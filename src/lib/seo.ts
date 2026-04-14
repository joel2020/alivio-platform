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
}) {
  const { title, description, keywords, ogTitle, ogDescription } = options;

  useEffect(() => {
    const previousTitle = document.title;
    const previousDescription = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';
    const previousKeywords = document.querySelector('meta[name="keywords"]')?.getAttribute('content') || '';
    const previousOgTitle = document.querySelector('meta[property="og:title"]')?.getAttribute('content') || '';
    const previousOgDescription = document.querySelector('meta[property="og:description"]')?.getAttribute('content') || '';

    document.title = title;
    upsertMeta('name', 'description', description);

    if (keywords) {
      upsertMeta('name', 'keywords', keywords);
    }

    upsertMeta('property', 'og:title', ogTitle ?? title);
    upsertMeta('property', 'og:description', ogDescription ?? description);

    return () => {
      document.title = previousTitle;
      upsertMeta('name', 'description', previousDescription);
      if (keywords) {
        upsertMeta('name', 'keywords', previousKeywords);
      }
      upsertMeta('property', 'og:title', previousOgTitle);
      upsertMeta('property', 'og:description', previousOgDescription);
    };
  }, [description, keywords, ogDescription, ogTitle, title]);
}
