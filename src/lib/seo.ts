import { useEffect } from 'react';

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

export function useSeo(options: {
  title: string;
  description: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: 'website' | 'article';
  robots?: string;
  structuredData?: Array<Record<string, unknown>>;
}) {
  const { title, description, keywords, ogTitle, ogDescription, canonicalUrl, ogImage, ogType, robots, structuredData } = options;

  useEffect(() => {
    const previousTitle = document.title;
    const previousDescription = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';
    const previousKeywords = document.querySelector('meta[name="keywords"]')?.getAttribute('content') || '';
    const previousRobots = document.querySelector('meta[name="robots"]')?.getAttribute('content') || '';
    const previousOgTitle = document.querySelector('meta[property="og:title"]')?.getAttribute('content') || '';
    const previousOgDescription = document.querySelector('meta[property="og:description"]')?.getAttribute('content') || '';
    const previousOgImage = document.querySelector('meta[property="og:image"]')?.getAttribute('content') || '';
    const previousOgType = document.querySelector('meta[property="og:type"]')?.getAttribute('content') || '';
    const canonicalTag = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    const previousCanonical = canonicalTag?.getAttribute('href') || '';
    const previousStructuredData = document.querySelectorAll('script[data-seo-structured="true"]');

    document.title = title;
    upsertMeta('name', 'description', description);

    if (keywords) {
      upsertMeta('name', 'keywords', keywords);
    }

    upsertMeta('property', 'og:title', ogTitle ?? title);
    upsertMeta('property', 'og:description', ogDescription ?? description);
    if (robots) upsertMeta('name', 'robots', robots);
    if (ogImage) upsertMeta('property', 'og:image', ogImage);
    if (ogType) upsertMeta('property', 'og:type', ogType);
    if (canonicalUrl) {
      let link = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'canonical');
        document.head.appendChild(link);
      }
      link.setAttribute('href', canonicalUrl);
    }
    if (structuredData?.length) {
      previousStructuredData.forEach((node) => node.remove());
      structuredData.forEach((entry) => {
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.dataset.seoStructured = 'true';
        script.text = JSON.stringify(entry);
        document.head.appendChild(script);
      });
    }

    return () => {
      document.title = previousTitle;
      upsertMeta('name', 'description', previousDescription);
      if (keywords) {
        upsertMeta('name', 'keywords', previousKeywords);
      }
      if (robots) upsertMeta('name', 'robots', previousRobots);
      upsertMeta('property', 'og:title', previousOgTitle);
      upsertMeta('property', 'og:description', previousOgDescription);
      if (ogImage) upsertMeta('property', 'og:image', previousOgImage);
      if (ogType) upsertMeta('property', 'og:type', previousOgType);
      if (canonicalUrl) {
        let link = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
        if (!link) {
          link = document.createElement('link');
          link.setAttribute('rel', 'canonical');
          document.head.appendChild(link);
        }
        link.setAttribute('href', previousCanonical);
      }
      if (structuredData?.length) {
        document.querySelectorAll('script[data-seo-structured="true"]').forEach((node) => node.remove());
      }
    };
  }, [canonicalUrl, description, keywords, ogDescription, ogImage, ogTitle, ogType, robots, structuredData, title]);
}
