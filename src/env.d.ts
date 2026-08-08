/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_GA_MEASUREMENT_ID?: string;
  readonly PUBLIC_GA_DEBUG?: string;
  readonly PUBLIC_GOOGLE_MAPS_URL?: string;
  readonly GOOGLE_PLACES_API_KEY?: string;
  readonly GOOGLE_PLACE_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
