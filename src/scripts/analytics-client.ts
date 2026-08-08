/**
 * Browser analytics client: consent gate, GA4 loader, delegated CTA tracker.
 * Progressive enhancement — never blocks navigation.
 */

import type { AnalyticsPageContext } from '../lib/analytics-context';
import {
  CONSENT_STORAGE_KEY,
  classifyCtaHref,
  isAllowedAnalyticsEvent,
  isContactIntentType,
  parseConsentValue,
  sanitizeAnalyticsParams,
  type AnalyticsConsentValue,
  type AnalyticsEventName,
  type CtaPosition,
} from '../lib/analytics';

export type AnalyticsClientConfig = {
  measurementId: string;
  debug?: boolean;
  pageContext: AnalyticsPageContext;
};

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    __AMPHON_ANALYTICS__?: {
      ready?: boolean;
      measurementId?: string;
    };
    __AMPHON_ANALYTICS_BOOT__?: AnalyticsClientConfig;
  }
}

const GA_SCRIPT_ID = 'amphon-ga4-gtag';
let initialized = false;
let clickBound = false;
let currentConfig: AnalyticsClientConfig | null = null;

function readConsent(): AnalyticsConsentValue | null {
  try {
    return parseConsentValue(window.localStorage.getItem(CONSENT_STORAGE_KEY));
  } catch {
    return null;
  }
}

function writeConsent(value: AnalyticsConsentValue): void {
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, value);
  } catch {
    // ignore quota / private mode
  }
}

function isValidMeasurementId(id: string): boolean {
  return /^G-[A-Z0-9]+$/i.test(id.trim());
}

function debugLog(message: string, payload?: Record<string, string>): void {
  if (!currentConfig?.debug) return;
  try {
    // eslint-disable-next-line no-console
    console.info('[amphon-analytics]', message, payload ?? '');
  } catch {
    // ignore
  }
}

function ensureDataLayer(): void {
  window.dataLayer = window.dataLayer || [];
  if (typeof window.gtag !== 'function') {
    window.gtag = function gtag(...args: unknown[]) {
      window.dataLayer?.push(args);
    };
  }
}

function loadGoogleTag(measurementId: string): void {
  if (document.getElementById(GA_SCRIPT_ID)) return;

  ensureDataLayer();
  window.gtag?.('js', new Date());

  const config: Record<string, unknown> = {
    anonymize_ip: true,
  };
  if (currentConfig?.debug) {
    config.debug_mode = true;
  }
  window.gtag?.('config', measurementId, config);

  const script = document.createElement('script');
  script.id = GA_SCRIPT_ID;
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
  document.head.appendChild(script);

  window.__AMPHON_ANALYTICS__ = {
    ready: true,
    measurementId,
  };
  debugLog('ga4_loaded');
}

function readPageContextFromDom(): AnalyticsPageContext {
  const el = document.documentElement;
  const lead = el.dataset.leadType;
  return {
    page_type: (el.dataset.pageType as AnalyticsPageContext['page_type']) || 'other',
    service_category:
      (el.dataset.serviceCategory as AnalyticsPageContext['service_category']) || 'other',
    province: el.dataset.province || 'national',
    ...(lead ? { lead_type: lead as AnalyticsPageContext['lead_type'] } : {}),
  };
}

export function trackEvent(name: string, parameters?: Record<string, unknown>): void {
  try {
    if (!isAllowedAnalyticsEvent(name)) return;
    const consent = readConsent();
    if (consent !== 'granted') return;

    const id = currentConfig?.measurementId?.trim() || '';
    if (!isValidMeasurementId(id)) return;
    if (!window.__AMPHON_ANALYTICS__?.ready) return;

    const page = currentConfig?.pageContext ?? readPageContextFromDom();
    const merged: Record<string, unknown> = {
      page_type: page.page_type,
      service_category: page.service_category,
      province: page.province,
      ...parameters,
    };
    if (page.lead_type) merged.lead_type = page.lead_type;

    const clean = sanitizeAnalyticsParams(merged);
    window.gtag?.('event', name as AnalyticsEventName, clean);
    debugLog(name, clean);
  } catch {
    // never throw into UI
  }
}

export function trackCtaClick(params: Record<string, unknown>): void {
  trackEvent('cta_click', params);
}

export function trackContactIntent(params: Record<string, unknown>): void {
  trackEvent('contact_intent', params);
}

function normalizePosition(raw: string | null | undefined): CtaPosition {
  const value = (raw || '').trim().toLowerCase();
  const allowed: CtaPosition[] = [
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
  ];
  return (allowed.find((p) => p === value) ?? 'other') as CtaPosition;
}

function derivePosition(el: Element): CtaPosition {
  const attrHost = el.closest('[data-cta-position]');
  if (attrHost instanceof HTMLElement && attrHost.dataset.ctaPosition) {
    return normalizePosition(attrHost.dataset.ctaPosition);
  }
  if (el.closest('#sticky-cta, .sticky-cta')) return 'sticky';
  if (el.closest('header.header, .header')) return 'header';
  if (el.closest('footer.footer, .footer')) return 'footer';
  if (el.closest('.cta-band, .contact-grid, .contact-address, .contact-card')) return 'contact_section';
  if (el.closest('.hero, .hero__actions, .page-header')) return 'hero';
  if (el.closest('[data-inline-cta], .inline-service-cta')) return 'inline_middle';
  if (el.closest('.card')) return 'card';
  return 'inline_middle';
}

function handleDocumentClick(event: MouseEvent): void {
  try {
    const target = event.target;
    if (!(target instanceof Element)) return;

    const anchor = target.closest('a');
    if (!(anchor instanceof HTMLAnchorElement)) return;

    const href = anchor.getAttribute('href');
    const fromHref = classifyCtaHref(href);
    const attrType = (anchor.dataset.ctaType || '').toLowerCase();
    const attrDestination = (anchor.dataset.destination || '').toLowerCase();

    let classification = fromHref;
    if (attrType) {
      const cta_type = attrType as NonNullable<typeof fromHref>['cta_type'];
      const destination = (attrDestination || attrType || fromHref?.destination || 'other') as NonNullable<
        typeof fromHref
      >['destination'];
      classification = {
        cta_type,
        destination,
        contact_method: undefined,
      };
      if (cta_type === 'line' || cta_type === 'phone' || cta_type === 'messenger') {
        classification.contact_method = cta_type;
      }
    }

    if (!classification) return;

    const position = derivePosition(anchor);
    const base = {
      cta_type: classification.cta_type,
      cta_position: position,
      destination: classification.destination,
    };

    // Fire-and-forget; never preventDefault / await
    trackCtaClick(base);
    if (classification.contact_method && isContactIntentType(classification.cta_type)) {
      trackContactIntent({
        contact_method: classification.contact_method,
        cta_position: position,
        destination: classification.destination,
        cta_type: classification.cta_type,
      });
    }
  } catch {
    // ignore
  }
}

function bindClickTracker(): void {
  if (clickBound) return;
  document.addEventListener('click', handleDocumentClick, { capture: true, passive: true });
  clickBound = true;
}

function updateConsentUi(consent: AnalyticsConsentValue | null): void {
  const banner = document.getElementById('analytics-consent');
  if (!banner) return;
  if (consent === null) {
    banner.hidden = false;
    banner.setAttribute('data-open', 'true');
  } else {
    banner.hidden = true;
    banner.removeAttribute('data-open');
  }
}

function applyConsent(value: AnalyticsConsentValue): void {
  writeConsent(value);
  updateConsentUi(value);
  if (value === 'granted') {
    const id = currentConfig?.measurementId?.trim() || '';
    if (isValidMeasurementId(id)) {
      loadGoogleTag(id);
    } else {
      debugLog('consent_granted_but_measurement_id_missing');
    }
  }
}

function bindConsentUi(): void {
  const banner = document.getElementById('analytics-consent');
  banner?.querySelectorAll('[data-consent-action]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const action = (btn as HTMLElement).dataset.consentAction;
      if (action === 'grant') applyConsent('granted');
      if (action === 'deny') applyConsent('denied');
    });
  });

  document.querySelectorAll('[data-consent-revisit]').forEach((el) => {
    el.addEventListener('click', (event) => {
      event.preventDefault();
      try {
        window.localStorage.removeItem(CONSENT_STORAGE_KEY);
      } catch {
        // ignore
      }
      updateConsentUi(null);
      const focusBtn = document.querySelector('#analytics-consent [data-consent-action="grant"]');
      if (focusBtn instanceof HTMLElement) focusBtn.focus();
    });
  });
}

export function initAnalytics(config: AnalyticsClientConfig): void {
  if (initialized) return;
  initialized = true;
  currentConfig = config;

  bindConsentUi();
  bindClickTracker();

  const consent = readConsent();
  updateConsentUi(consent);

  if (consent === 'granted' && isValidMeasurementId(config.measurementId.trim())) {
    loadGoogleTag(config.measurementId.trim());
  }
}

export function __testables() {
  return {
    derivePosition,
    handleDocumentClick,
    isValidMeasurementId,
    readConsent,
  };
}
