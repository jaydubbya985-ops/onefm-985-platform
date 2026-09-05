import { useEffect } from 'react'
import { Helmet } from 'react-helmet-async';
import { formatSeoDefault } from '@/lib/coverageCopy'
import { DEFAULT_OG_IMAGE_PATH, spaCanonicalUrl, spaOgImageUrl } from '@/lib/publicSite'

const DEFAULT_TITLE = 'ONE FM 98.5 — The Voice of the Goulburn Valley'

interface SEOProps {
  title: string;
  description?: string;
  ogImage?: string;
  ogType?: string;
}

export function SEO({
  title,
  description = formatSeoDefault(),
  ogImage = DEFAULT_OG_IMAGE_PATH,
  ogType = 'website',
}: SEOProps) {
  const fullTitle = `${title} | ONE FM 98.5`
  const canonicalUrl = spaCanonicalUrl()
  const imageUrl = spaOgImageUrl(ogImage)

  // React 19 + react-helmet-async v3 creates a <title> element but leaves it empty in
  // some environments. Set document.title directly to guarantee browser tab updates.
  useEffect(() => {
    document.title = fullTitle
    return () => { document.title = DEFAULT_TITLE }
  }, [fullTitle])

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />

      {/* Open Graph — absolute URLs on this SPA origin, not WordPress. */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content="ONE FM 98.5" />
      <meta property="og:url" content={canonicalUrl} />

      {/* Twitter Card — no twitter:site. socialLinks.twitter is null until a handle is confirmed. */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />

      <link rel="canonical" href={canonicalUrl} />
    </Helmet>
  );
}
