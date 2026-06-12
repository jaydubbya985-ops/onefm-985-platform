import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description: string;
  ogImage?: string;
  ogType?: string;
}

export function SEO({ title, description, ogImage = '/one-fm-logo.png', ogType = 'website' }: SEOProps) {
  return (
    <Helmet>
      <title>{title} | ONE FM 98.5</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content="ONE FM 98.5" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      <link rel="canonical" href={`https://fm985.com.au${window.location.hash}`} />
    </Helmet>
  );
}
