/**
 * Shared analytics helpers for R9B (CTA + contact intent).
 * Safe to import from Node tests and browser scripts.
 */

export const ANALYTICS_EVENTS = ['cta_click', 'contact_intent'] as const;
export type AnalyticsEventName = (typeof ANALYTICS_EVENTS)[number];

export type CtaType =
  | 'line'
  | 'phone'
  | 'maps'
  | 'facebook'
  | 'messenger'
  | 'copy_line_id'
  | 'email'
  | 'internal_form'
  | 'other';

export type CtaPosition =
  | 'hero'
  | 'above_fold'
  | 'inline_top'
  | 'inline_middle'
  | 'inline_bottom'
  | 'sticky'
  | 'floating'
  | 'header'
  | 'footer'
  | 'contact_section'
  | 'card'
  | 'other';

export type CtaDestination =
  | 'line'
  | 'phone'
  | 'maps'
  | 'facebook'
  | 'messenger'
  | 'clipboard'
  | 'email'
  | 'internal_form'
  | 'other';

export type ContactMethod = 'line' | 'phone' | 'messenger' | 'form';

/** Fields that must never appear in analytics payloads. */
export const BLOCKED_PARAM_KEYS = new Set([
  'name',
  'full_name',
  'phone_number',
  'tel_value',
  'email',
  'line_id',
  'customer_line_id',
  'chat_message',
  'message',
  'address',
  'serial',
  'serial_number',
  'imei',
  'asset_tag',
  'invoice',
  'invoice_number',
  'account',
  'bank_account',
  'customer_id',
  'free_text',
  'form_payload',
  'page_path',
  'href',
  'url',
  'destination_url',
]);

const ALLOWED_CTA_TYPES = new Set<string>([
  'line',
  'phone',
  'maps',
  'facebook',
  'messenger',
  'copy_line_id',
  'email',
  'internal_form',
  'other',
]);

const ALLOWED_POSITIONS = new Set<string>([
  'hero',
  'above_fold',
  'inline_top',
  'inline_middle',
  'inline_bottom',
  'sticky',
  'floating',
  'header',
  'footer',
  'contact_section',
  'card',
  'other',
]);

const ALLOWED_DESTINATIONS = new Set<string>([
  'line',
  'phone',
  'maps',
  'facebook',
  'messenger',
  'clipboard',
  'email',
  'internal_form',
  'other',
]);

const CONTACT_METHODS = new Set<string>(['line', 'phone', 'messenger', 'form']);

export type CtaClassification = {
  cta_type: CtaType;
  destination: CtaDestination;
  contact_method?: ContactMethod;
};

/**
 * Classify an href into controlled CTA enums.
 * Never returns telephone numbers or full external URLs.
 */
export function classifyCtaHref(rawHref: string | null | undefined): CtaClassification | null {
  if (!rawHref) return null;
  const href = String(rawHref).trim();
  if (!href || href.startsWith('#') || href.startsWith('javascript:')) return null;

  const lower = href.toLowerCase();

  if (lower.startsWith('tel:')) {
    return { cta_type: 'phone', destination: 'phone', contact_method: 'phone' };
  }
  if (lower.startsWith('mailto:')) {
    return { cta_type: 'email', destination: 'email' };
  }

  let url: URL | null = null;
  try {
    url = new URL(href, 'https://amphon.co.th');
  } catch {
    return null;
  }

  const host = url.hostname.toLowerCase();
  const path = url.pathname.toLowerCase();

  if (
    host === 'line.me' ||
    host.endsWith('.line.me') ||
    host === 'lin.ee' ||
    host.includes('line.naver.jp')
  ) {
    return { cta_type: 'line', destination: 'line', contact_method: 'line' };
  }

  if (host === 'm.me' || (host.includes('facebook.com') && path.includes('/messages'))) {
    return { cta_type: 'messenger', destination: 'messenger', contact_method: 'messenger' };
  }

  if (host.includes('facebook.com') || host.includes('fb.com') || host.includes('fb.me')) {
    return { cta_type: 'facebook', destination: 'facebook' };
  }

  if (
    host === 'maps.app.goo.gl' ||
    host === 'maps.google.com' ||
    (host.includes('google.com') && path.includes('/maps')) ||
    (host === 'goo.gl' && path.startsWith('/maps'))
  ) {
    return { cta_type: 'maps', destination: 'maps' };
  }

  // Same-origin / relative — not a contact CTA
  if (host === 'amphon.co.th' || host === 'www.amphon.co.th' || href.startsWith('/')) {
    return null;
  }

  return null;
}

export function isContactIntentType(ctaType: CtaType): boolean {
  return ctaType === 'line' || ctaType === 'phone' || ctaType === 'messenger';
}

export function sanitizeAnalyticsParams(
  input: Record<string, unknown> | null | undefined,
): Record<string, string> {
  const out: Record<string, string> = {};
  if (!input) return out;

  for (const [key, value] of Object.entries(input)) {
    if (value == null || value === '') continue;
    if (BLOCKED_PARAM_KEYS.has(key)) continue;
    if (/phone|email|serial|imei|message|address|invoice|customer/i.test(key)) continue;

    const str = String(value);
    if (str.length > 80) continue;
    if (/^tel:/i.test(str)) continue;
    if (/^mailto:/i.test(str)) continue;
    if (/^https?:\/\//i.test(str)) continue;
    if (/\?/.test(str)) continue;

    out[key] = str;
  }

  if (out.cta_type && !ALLOWED_CTA_TYPES.has(out.cta_type)) out.cta_type = 'other';
  if (out.cta_position && !ALLOWED_POSITIONS.has(out.cta_position)) out.cta_position = 'other';
  if (out.destination && !ALLOWED_DESTINATIONS.has(out.destination)) out.destination = 'other';
  if (out.contact_method && !CONTACT_METHODS.has(out.contact_method)) delete out.contact_method;

  return out;
}

export function isAllowedAnalyticsEvent(name: string): name is AnalyticsEventName {
  return (ANALYTICS_EVENTS as readonly string[]).includes(name);
}

export const CONSENT_STORAGE_KEY = 'amphon_analytics_consent';
export type AnalyticsConsentValue = 'granted' | 'denied';

export function parseConsentValue(raw: string | null | undefined): AnalyticsConsentValue | null {
  if (raw === 'granted' || raw === 'denied') return raw;
  return null;
}
