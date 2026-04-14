import { useEffect } from 'react';

type StructuredData = Record<string, unknown>;

const STRUCTURED_DATA_SCRIPT_ID = 'alivio-structured-data';

function upsertMeta(nameOrProperty: 'name' | 'property', key: string, content: string) {
  const selector = `meta[${nameOrProperty}="${key}"]`;
  let tag = document.head.querySelector(selector) as HTMLMetaElement | null;

  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(nameOrProperty, key);
    document.head.appendChild(tag);
  }

  tag.setAttribute('content', content);
}

function upsertCanonical(url: string) {
  let tag = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;

  if (!tag) {
    tag = document.createElement('link');
    tag.setAttribute('rel', 'canonical');
    document.head.appendChild(tag);
  }

  tag.setAttribute('href', url);
}

function upsertStructuredData(data: StructuredData | StructuredData[]) {
  let tag = document.getElementById(STRUCTURED_DATA_SCRIPT_ID) as HTMLScriptElement | null;

  if (!tag) {
    tag = document.createElement('script');
    tag.id = STRUCTURED_DATA_SCRIPT_ID;
    tag.type = 'application/ld+json';
    document.head.appendChild(tag);
  }

  const payload = Array.isArray(data) ? data : [data];
  tag.textContent = JSON.stringify(payload.length === 1 ? payload[0] : payload);
}

export function useSeo(options: {
  title: string;
  description: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: string;
  twitterCard?: string;
  robots?: string;
  structuredData?: StructuredData | StructuredData[];
}) {
  const {
    title,
    description,
    keywords,
    ogTitle,
    ogDescription,
    canonicalUrl,
    ogImage,
    ogType,
    twitterCard,
    robots,
    structuredData,
  } = options;

  useEffect(() => {
    document.title = title;
    upsertMeta('name', 'description', description);

    if (keywords) {
      upsertMeta('name', 'keywords', keywords);
    }

    const effectiveOgTitle = ogTitle ?? title;
    const effectiveOgDescription = ogDescription ?? description;

    upsertMeta('property', 'og:title', effectiveOgTitle);
    upsertMeta('property', 'og:description', effectiveOgDescription);
    upsertMeta('property', 'og:type', ogType ?? 'website');
    upsertMeta('property', 'og:site_name', 'Alivio Search Partners');

    if (canonicalUrl) {
      upsertCanonical(canonicalUrl);
      upsertMeta('property', 'og:url', canonicalUrl);
    }

    if (ogImage) {
      upsertMeta('property', 'og:image', ogImage);
      upsertMeta('name', 'twitter:image', ogImage);
    }

    upsertMeta('name', 'twitter:card', twitterCard ?? 'summary_large_image');
    upsertMeta('name', 'twitter:title', effectiveOgTitle);
    upsertMeta('name', 'twitter:description', effectiveOgDescription);

    if (robots) {
      upsertMeta('name', 'robots', robots);
    }

    if (structuredData) {
      upsertStructuredData(structuredData);
    }
  }, [
    canonicalUrl,
    description,
    keywords,
    ogDescription,
    ogImage,
    ogTitle,
    ogType,
    robots,
    structuredData,
    title,
    twitterCard,
  ]);
}
