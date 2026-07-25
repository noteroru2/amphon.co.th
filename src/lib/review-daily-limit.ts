export const DAILY_GOOGLE_REVIEW_LIMIT = 10;
export const BANGKOK_TIME_ZONE = 'Asia/Bangkok';

export type DailyLimitResult =
  | { allowed: true; resetAt: Date }
  | { allowed: false; reason: 'limit_reached' | 'storage_unavailable'; resetAt: Date };

export interface DailyLimitStore {
  take(dateKey: string, limit: number, ttlSeconds: number): Promise<boolean>;
}

const bangkokParts = (date: Date) => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: BANGKOK_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value);
  return { year: value('year'), month: value('month'), day: value('day') };
};

export function bangkokWindow(now = new Date()) {
  const { year, month, day } = bangkokParts(now);
  const dateKey = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  const resetAt = new Date(Date.UTC(year, month - 1, day + 1, -7, 0, 0));
  return {
    dateKey,
    resetAt,
    ttlSeconds: Math.max(1, Math.ceil((resetAt.getTime() - now.getTime()) / 1000)),
  };
}

export function retryAfterSeconds(resetAt: Date, now = new Date()) {
  return Math.max(1, Math.ceil((resetAt.getTime() - now.getTime()) / 1000));
}

const TAKE_SCRIPT = `
local current = tonumber(redis.call("GET", KEYS[1]) or "0")
local limit = tonumber(ARGV[1])
if current >= limit then return 0 end
current = redis.call("INCR", KEYS[1])
if current == 1 then redis.call("EXPIRE", KEYS[1], tonumber(ARGV[2])) end
return 1
`.trim();

export class UpstashDailyLimitStore implements DailyLimitStore {
  private readonly url: string;
  private readonly token: string;
  private readonly fetcher: typeof fetch;

  constructor(
    url: string,
    token: string,
    fetcher: typeof fetch = fetch,
  ) {
    this.url = url;
    this.token = token;
    this.fetcher = fetcher;
  }

  async take(dateKey: string, limit: number, ttlSeconds: number): Promise<boolean> {
    if (!this.url || !this.token) throw new Error('counter_storage_not_configured');
    const response = await this.fetcher(this.url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(['EVAL', TAKE_SCRIPT, '1', `google-reviews:${dateKey}`, limit, ttlSeconds]),
    });
    if (!response.ok) throw new Error('counter_storage_request_failed');
    const payload = await response.json() as { result?: unknown };
    if (payload.result !== 0 && payload.result !== 1) throw new Error('counter_storage_invalid_response');
    return payload.result === 1;
  }
}

export function configuredDailyLimitStore(): DailyLimitStore | null {
  const url = import.meta.env?.KV_REST_API_URL || import.meta.env?.UPSTASH_REDIS_REST_URL;
  const token = import.meta.env?.KV_REST_API_TOKEN || import.meta.env?.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? new UpstashDailyLimitStore(url, token) : null;
}

export async function takeDailyGoogleReviewRequest(
  store: DailyLimitStore | null,
  now = new Date(),
): Promise<DailyLimitResult> {
  const window = bangkokWindow(now);
  if (!store) return { allowed: false, reason: 'storage_unavailable', resetAt: window.resetAt };
  try {
    const allowed = await store.take(window.dateKey, DAILY_GOOGLE_REVIEW_LIMIT, window.ttlSeconds);
    return allowed
      ? { allowed: true, resetAt: window.resetAt }
      : { allowed: false, reason: 'limit_reached', resetAt: window.resetAt };
  } catch {
    return { allowed: false, reason: 'storage_unavailable', resetAt: window.resetAt };
  }
}
