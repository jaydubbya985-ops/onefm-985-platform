import { useEffect } from 'react'
import { Helmet } from 'react-helmet-async';
import { formatSeoDefault } from '@/lib/coverageCopy'

const SITE_URL = 'https://fm985.com.au'
const DEFAULT_OG_IMAGE = '/assets/images/studio-exterior-rainbow.jpg'
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
  ogImage = DEFAULT_OG_IMAGE,
  ogType = 'website',
}: SEOProps) {
  const fullTitle = `${title} | ONE FM 98.5`
  const canonicalUrl = `${SITE_URL}/${window.location.hash}`

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

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage.startsWith('http') ? ogImage : `${SITE_URL}${ogImage}`} />
      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content="ONE FM 98.5" />
      <meta property="og:url" content={canonicalUrl} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@onefm985" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage.startsWith('http') ? ogImage : `${SITE_URL}${ogImage}`} />

      <link rel="canonical" href={canonicalUrl} />
    </Helmet>
  );
}
