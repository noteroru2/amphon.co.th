/**
 * Structured data generators for Google Search Central compliance.
 * Rule: every JSON-LD field must reflect visible on-page content — no hidden or duplicate FAQ.
 * @see https://developers.google.com/search/docs/appearance/structured-data/sd-policies
 */
import { site, type BreadcrumbItem, type FAQItem, type ProvinceName } from '../config/site';

const SCHEMA = 'https://schema.org';
const IN_LANGUAGE = 'th-TH';

/** Canonical URL — trailingSlash: 'never' (must match sitemap + canonical tag). */
export function absoluteUrl(path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return normalizePageUrl(path);
  }
  const trimmed = path.trim().replace(/\/+$/, '') || '/';
  const normalized = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  if (normalized === '/') return site.url;
  return `${site.url}${normalized}`;
}

/** Strip trailing slash from page URLs used in @id (never on homepage). */
export function normalizePageUrl(pageUrl: string): string {
  if (pageUrl === site.url || pageUrl === `${site.url}/`) return site.url;
  return pageUrl.replace(/\/+$/, '');
}

export function toAbsoluteMediaUrl(pathOrUrl: string): string {
  if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) {
    return pathOrUrl;
  }
  return absoluteUrl(pathOrUrl);
}

export function seoTitle(pageTitle?: string): string {
  if (!pageTitle) return `${site.title} | รับซื้อสินค้าไอทีมือสองทั่วประเทศ`;
  return `${pageTitle} | ${site.title}`;
}

/** ogImage → heroImage → site.defaultOgImage (never favicon). Returns absolute URL. */
export function resolveOgImage(ogImage?: string, heroImage?: string): string {
  const path = ogImage ?? heroImage ?? site.defaultOgImage;
  return toAbsoluteMediaUrl(path);
}

export const schemaIds = {
  organization: `${site.url}/#organization`,
  localBusiness: `${site.url}/#localbusiness`,
  website: `${site.url}/#website`,
  webpage: (pageUrl: string) => `${normalizePageUrl(pageUrl)}#webpage`,
  breadcrumb: (pageUrl: string) => `${normalizePageUrl(pageUrl)}#breadcrumb`,
  service: (pageUrl: string) => `${normalizePageUrl(pageUrl)}#service`,
  article: (pageUrl: string) => `${normalizePageUrl(pageUrl)}#article`,
  faq: (pageUrl: string) => `${normalizePageUrl(pageUrl)}#faq`,
  itemList: (pageUrl: string) => `${normalizePageUrl(pageUrl)}#itemlist`,
  offerCatalog: (pageUrl: string) => `${normalizePageUrl(pageUrl)}#offercatalog`,
  place: (pageUrl: string) => `${normalizePageUrl(pageUrl)}#place`,
};

function parseOpeningHours(hours: string) {
  const [days, time] = hours.split(' ');
  const [opens, closes] = (time ?? '').split('-');
  return { dayOfWeek: days, opens, closes };
}

function areaServedNodes() {
  return [
    { '@type': 'Country' as const, name: 'Thailand', alternateName: 'ประเทศไทย' },
  ];
}

function postalAddressNode() {
  return {
    '@type': 'PostalAddress' as const,
    streetAddress: site.address.street,
    addressLocality: site.address.locality,
    addressRegion: site.address.region,
    postalCode: site.address.postalCode,
    addressCountry: site.address.country,
  };
}

function imageObjectNode(url: string) {
  return { '@type': 'ImageObject' as const, url: toAbsoluteMediaUrl(url) };
}

export function createOrganizationSchema() {
  return {
    '@type': 'Organization',
    '@id': schemaIds.organization,
    name: site.name,
    alternateName: site.alternateName,
    legalName: site.title,
    url: site.url,
    description: site.description,
    logo: imageObjectNode(site.logo),
    image: toAbsoluteMediaUrl(site.image),
    email: site.email,
    telephone: site.phoneTel,
    foundingDate: site.foundingDate,
    knowsAbout: [...site.knowsAbout],
    contactPoint: site.contactPoint.map((cp) => ({
      '@type': 'ContactPoint',
      ...cp,
    })),
    sameAs: [...site.sameAs],
  };
}

export function createLocalBusinessSchema() {
  return {
    '@type': ['LocalBusiness', 'ProfessionalService'],
    '@id': schemaIds.localBusiness,
    name: site.name,
    alternateName: site.alternateName,
    description: site.description,
    url: site.url,
    telephone: site.phoneTel,
    email: site.email,
    image: toAbsoluteMediaUrl(site.image),
    logo: imageObjectNode(site.logo),
    priceRange: site.priceRange,
    currenciesAccepted: site.currenciesAccepted,
    paymentAccepted: site.paymentAccepted.join(', '),
    address: postalAddressNode(),
    geo: {
      '@type': 'GeoCoordinates',
      latitude: site.geo.latitude,
      longitude: site.geo.longitude,
    },
    ...(site.hasMap ? { hasMap: site.hasMap } : {}),
    openingHoursSpecification: site.openingHours.map((hours) => {
      const parsed = parseOpeningHours(hours);
      return {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: parsed.dayOfWeek,
        opens: parsed.opens,
        closes: parsed.closes,
      };
    }),
    areaServed: areaServedNodes(),
    contactPoint: site.contactPoint.map((cp) => ({
      '@type': 'ContactPoint',
      ...cp,
    })),
    parentOrganization: { '@id': schemaIds.organization },
    sameAs: [...site.sameAs],
  };
}

/** No SearchAction — site has no on-page search. */
export function createWebsiteSchema() {
  return {
    '@type': 'WebSite',
    '@id': schemaIds.website,
    name: site.title,
    alternateName: site.name,
    url: site.url,
    description: site.description,
    inLanguage: IN_LANGUAGE,
    publisher: { '@id': schemaIds.organization },
  };
}

export function createWebPageSchema(params: {
  pageUrl: string;
  name: string;
  description: string;
  pageType?: string;
  datePublished?: string;
  dateModified?: string;
  mainEntityId?: string;
  primaryImageUrl?: string;
}) {
  const {
    pageUrl,
    name,
    description,
    pageType = 'WebPage',
    datePublished,
    dateModified,
    mainEntityId,
    primaryImageUrl,
  } = params;

  const normalizedUrl = normalizePageUrl(pageUrl);

  return {
    '@type': pageType,
    '@id': schemaIds.webpage(normalizedUrl),
    url: normalizedUrl,
    name,
    description,
    inLanguage: IN_LANGUAGE,
    isPartOf: { '@id': schemaIds.website },
    publisher: { '@id': schemaIds.organization },
    breadcrumb: { '@id': schemaIds.breadcrumb(normalizedUrl) },
    ...(mainEntityId ? { mainEntity: { '@id': mainEntityId } } : {}),
    ...(primaryImageUrl ? { primaryImageOfPage: imageObjectNode(primaryImageUrl) } : {}),
    ...(datePublished ? { datePublished } : {}),
    ...(dateModified ? { dateModified } : {}),
  };
}

export function createBreadcrumbSchema(pageUrl: string, items: BreadcrumbItem[]) {
  const normalizedUrl = normalizePageUrl(pageUrl);
  return {
    '@type': 'BreadcrumbList',
    '@id': schemaIds.breadcrumb(normalizedUrl),
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      ...(item.href ? { item: absoluteUrl(item.href) } : {}),
    })),
  };
}

export function createServiceSchema(params: {
  pageUrl: string;
  name: string;
  description: string;
  serviceType?: string;
  image?: string;
  offerCatalogId?: string;
}) {
  const normalizedUrl = normalizePageUrl(params.pageUrl);
  return {
    '@type': 'Service',
    '@id': schemaIds.service(normalizedUrl),
    name: params.name,
    description: params.description,
    url: normalizedUrl,
    inLanguage: IN_LANGUAGE,
    serviceType: params.serviceType ?? 'รับซื้อสินค้ามือสอง',
    provider: { '@id': schemaIds.localBusiness },
    areaServed: areaServedNodes(),
    ...(params.offerCatalogId
      ? {
          hasOfferCatalog: {
            '@id': params.offerCatalogId,
          },
        }
      : {}),
    ...(params.image ? { image: toAbsoluteMediaUrl(params.image) } : {}),
    offers: {
      '@type': 'Offer',
      description: 'ประเมินราคาฟรี ราคาขึ้นอยู่กับสภาพสินค้า',
      availability: `${SCHEMA}/InStock`,
      offeredBy: { '@id': schemaIds.localBusiness },
    },
  };
}

export function createArticleSchema(params: {
  pageUrl: string;
  headline: string;
  description: string;
  datePublished: string;
  dateModified?: string;
  author?: string;
  image?: string;
}) {
  const normalizedUrl = normalizePageUrl(params.pageUrl);
  return {
    '@type': 'BlogPosting',
    '@id': schemaIds.article(normalizedUrl),
    headline: params.headline,
    description: params.description,
    url: normalizedUrl,
    inLanguage: IN_LANGUAGE,
    datePublished: params.datePublished,
    dateModified: params.dateModified ?? params.datePublished,
    ...(params.image ? { image: toAbsoluteMediaUrl(params.image) } : {}),
    author: {
      '@type': 'Organization',
      name: params.author ?? site.name,
      url: site.url,
    },
    publisher: { '@id': schemaIds.organization },
    mainEntityOfPage: { '@id': schemaIds.webpage(normalizedUrl) },
  };
}

export function createItemListSchema(params: {
  pageUrl: string;
  name: string;
  items: { name: string; url: string; description?: string }[];
}) {
  const normalizedUrl = normalizePageUrl(params.pageUrl);
  return {
    '@type': 'ItemList',
    '@id': schemaIds.itemList(normalizedUrl),
    name: params.name,
    inLanguage: IN_LANGUAGE,
    numberOfItems: params.items.length,
    itemListElement: params.items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: normalizePageUrl(item.url),
      ...(item.description ? { description: item.description } : {}),
    })),
  };
}

export function createOfferCatalogSchema(params: {
  pageUrl: string;
  name: string;
  items: { name: string; url: string; description?: string }[];
}) {
  const normalizedUrl = normalizePageUrl(params.pageUrl);
  return {
    '@type': 'OfferCatalog',
    '@id': schemaIds.offerCatalog(normalizedUrl),
    name: params.name,
    inLanguage: IN_LANGUAGE,
    itemListElement: params.items.map((item) => ({
      '@type': 'Offer',
      itemOffered: {
        '@type': 'Service',
        name: item.name,
        description: item.description,
        url: absoluteUrl(item.url),
        inLanguage: IN_LANGUAGE,
        provider: { '@id': schemaIds.localBusiness },
      },
    })),
  };
}

/** Only when faqs are rendered visibly on the page. */
export function createFAQSchema(pageUrl: string, faqs: FAQItem[]) {
  if (faqs.length === 0) return null;

  return {
    '@type': 'FAQPage',
    '@id': schemaIds.faq(normalizePageUrl(pageUrl)),
    mainEntity: faqs.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

export function createPlaceSchema(params: {
  pageUrl: string;
  name: string;
  description: string;
  province: string;
}) {
  const normalizedUrl = normalizePageUrl(params.pageUrl);
  const geo =
    params.province in site.provinceGeo
      ? site.provinceGeo[params.province as ProvinceName]
      : null;

  return {
    '@type': 'Place',
    '@id': schemaIds.place(normalizedUrl),
    name: params.name,
    description: params.description,
    url: normalizedUrl,
    address: {
      '@type': 'AdministrativeArea',
      name: params.province,
      addressCountry: 'TH',
    },
    ...(geo
      ? {
          geo: {
            '@type': 'GeoCoordinates',
            latitude: geo.latitude,
            longitude: geo.longitude,
          },
        }
      : {}),
    containedInPlace: { '@type': 'AdministrativeArea', name: 'ภาคอีสาน' },
  };
}

export type PageGraphParams = {
  pageUrl: string;
  name: string;
  description: string;
  breadcrumbs: BreadcrumbItem[];
  pageType?: string;
  datePublished?: string;
  dateModified?: string;
  mainEntityId?: string;
  primaryImageUrl?: string;
  extra?: Record<string, unknown>[];
};

/** One @graph per page — single JSON-LD script, entities linked via @id. */
export function buildPageGraph(params: PageGraphParams) {
  const pageUrl = normalizePageUrl(params.pageUrl);

  const graph: Record<string, unknown>[] = [
    createOrganizationSchema(),
    createLocalBusinessSchema(),
    createWebsiteSchema(),
    createWebPageSchema({
      pageUrl,
      name: params.name,
      description: params.description,
      pageType: params.pageType,
      datePublished: params.datePublished,
      dateModified: params.dateModified,
      mainEntityId: params.mainEntityId,
      primaryImageUrl: params.primaryImageUrl,
    }),
    createBreadcrumbSchema(pageUrl, params.breadcrumbs),
    ...(params.extra ?? []),
  ];

  return { '@context': SCHEMA, '@graph': graph };
}

/** Pass the same faqs array rendered in FAQ.astro — returns [] if empty. */
export function faqSchemaIfVisible(pageUrl: string, faqs: FAQItem[]) {
  const schema = createFAQSchema(pageUrl, faqs);
  return schema ? [schema] : [];
}

export function mergeKeywords(...lists: (string[] | undefined)[]): string[] {
  return [...new Set(lists.flatMap((list) => list ?? []))];
}

export function contentDateModified(date: Date, updated?: Date): string | undefined {
  const value = updated ?? date;
  return value.toISOString();
}
