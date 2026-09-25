import React, { useEffect } from 'react';
import { CANONICAL_SITE_URL, DEFAULT_SEO } from './seoConfig';

export interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string[] | string;
  canonicalPath?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'profile';
  noindex?: boolean;
  jsonLd?: Record<string, unknown> | Array<Record<string, unknown>>;
}

function setOrCreateMeta(name: string, content: string, isProperty = false) {
  const attribute = isProperty ? 'property' : 'name';
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${name}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, name);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

function setOrCreateCanonical(href: string) {
  let element = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', 'canonical');
    document.head.appendChild(element);
  }
  element.setAttribute('href', href);
}

function setOrCreateJsonLd(jsonLd?: Record<string, unknown> | Array<Record<string, unknown>>) {
  const SCRIPT_ID = 'seo-dynamic-jsonld';
  let script = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;

  if (!jsonLd) {
    if (script) script.remove();
    return;
  }

  if (!script) {
    script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.type = 'application/ld+json';
    document.head.appendChild(script);
  }

  try {
    script.textContent = JSON.stringify(jsonLd);
  } catch (err) {
    console.error('Failed to stringify JSON-LD:', err);
  }
}

export const SEOHead: React.FC<SEOHeadProps> = ({
  title,
  description,
  keywords,
  canonicalPath = '/',
  ogImage,
  ogType = 'website',
  noindex = false,
  jsonLd,
}) => {
  useEffect(() => {
    // 1. Title
    const finalTitle = title ? `${title}` : DEFAULT_SEO.title;
    document.title = finalTitle;

    // 2. Description
    const finalDescription = description || DEFAULT_SEO.description;
    setOrCreateMeta('description', finalDescription);

    // 3. Keywords
    let finalKeywords = '';
    if (Array.isArray(keywords)) {
      finalKeywords = keywords.join(', ');
    } else if (typeof keywords === 'string') {
      finalKeywords = keywords;
    } else if (DEFAULT_SEO.keywords) {
      finalKeywords = DEFAULT_SEO.keywords.join(', ');
    }
    if (finalKeywords) {
      setOrCreateMeta('keywords', finalKeywords);
    }

    // 4. Robots
    setOrCreateMeta('robots', noindex ? 'noindex, nofollow' : 'index, follow');

    // 5. Canonical URL
    const cleanPath = canonicalPath.startsWith('/') ? canonicalPath : `/${canonicalPath}`;
    const canonicalUrl = `${CANONICAL_SITE_URL}${cleanPath === '/' ? '' : cleanPath}`;
    setOrCreateCanonical(canonicalUrl);

    // 6. Open Graph
    const finalImage = ogImage || DEFAULT_SEO.ogImage || `${CANONICAL_SITE_URL}/orbs-icon.png`;
    setOrCreateMeta('og:title', finalTitle, true);
    setOrCreateMeta('og:description', finalDescription, true);
    setOrCreateMeta('og:url', canonicalUrl, true);
    setOrCreateMeta('og:type', ogType, true);
    setOrCreateMeta('og:image', finalImage, true);
    setOrCreateMeta('og:site_name', 'Orven Casido', true);
    setOrCreateMeta('og:locale', 'en_US', true);

    // 7. Twitter / X Cards
    setOrCreateMeta('twitter:card', 'summary_large_image');
    setOrCreateMeta('twitter:title', finalTitle);
    setOrCreateMeta('twitter:description', finalDescription);
    setOrCreateMeta('twitter:image', finalImage);

    // 8. Structured Data JSON-LD
    setOrCreateJsonLd(jsonLd);
  }, [title, description, keywords, canonicalPath, ogImage, ogType, noindex, jsonLd]);

  return null;
};
