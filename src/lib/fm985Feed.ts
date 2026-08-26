/**
 * Live content from fm985.com.au + ONE FM SoundCloud (user-570295409).
 * Interviews on WordPress embed SoundCloud stream URLs — we parse those for native audio.
 *
 * Featured images: use the WordPress `_embed=wp:featuredmedia` URL when it is a
 * real station/post photo. Generic SoundCloud artwork (profile avatars + reused
 * show covers) falls back to a show-type photo from stationPhotos.ts.
 * Scanned WP REST 26 Aug 2026.
 */

import scraped from '@/data/oneFmScrapedData.json'
import { STATION_PHOTOS } from '@/lib/stationPhotos'

export const SOUNDCLOUD_PROFILE_URL = 'https://soundcloud.com/user-570295409'

/** @deprecated Native SoundCloudPanel replaces the orange iframe widget. */
export const SOUNDCLOUD_EMBED_URL =
  'https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/user-570295409&color=%23D4AF37&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false'

const WP_PATH = '/wp-json/wp/v2'
/** WordPress category: Interview */
export const INTERVIEW_CATEGORY_ID = 24
/**
 * Parent Sport (52) only holds stale 2023 AFL Opening Bounce posts.
 * Live 2026 sport lives under Super Saturday Sport + child shows.
 */
export const SPORT_CATEGORY_IDS = [98, 118, 119, 120, 121, 123] as const

/** Try Netlify rewrite, then serverless proxy, then static scraped interviews. */
const API_BASES = [
  '/api/fm985',
  '/.netlify/functions/fm985-proxy',
]

export type FeedKind = 'interview' | 'sport' | 'community'

export interface Fm985Interview {
  id: number
  title: string
  excerpt: string
  link: string
  date: string
  audioUrl: string | null
  imageUrl: string | null
  kind: FeedKind
}

interface WpMediaSize {
  source_url?: string
}

interface WpFeaturedMedia {
  source_url?: string
  media_details?: {
    sizes?: {
      large?: WpMediaSize
      medium_large?: WpMediaSize
      full?: WpMediaSize
    }
  }
}

interface WpPost {
  id: number
  date: string
  link: string
  title: { rendered: string }
  excerpt: { rendered: string }
  content: { rendered: string }
  categories?: number[]
  _embedded?: {
    'wp:featuredmedia'?: WpFeaturedMedia[]
  }
}

/** Recurring SoundCloud show covers re-hosted on fm985.com.au — not unique to a post. */
const GENERIC_SOUNDCLOUD_ARTWORK = [
  'artworks-lUp5FG5N9CFFMWdz', // Maree / Visitor Centre weekly cover
  'artworks-4EG4dqJktKWzllX4', // KDL Show
  'artworks-dQVC5iLzo9kT658b', // Square Gaiters
  'artworks-7h2YJbTmM23wGVua', // Hole In One
  'artworks-Qt0vqrCLKySlU60Y', // Square Gaiters (older)
  'artworks-gsL4ofS6vjxRwKcc', // Sport And Road
  'artworks-lHAfBIC8jUz4M2Dr', // Stats Man GVL preview
]

/**
 * True when the WP featured image is SoundCloud profile art, a CDN host, or a
 * reused weekly-show cover — not a unique post photo.
 */
export function isGenericSoundCloudArtwork(url: string | null | undefined): boolean {
  if (!url) return false
  const u = url.toLowerCase()
  if (u.includes('sndcdn.com') || u.includes('soundcloud.com')) return true
  if (/\/avatars-\d+-/.test(u)) return true
  return GENERIC_SOUNDCLOUD_ARTWORK.some((hash) => u.includes(hash.toLowerCase()))
}

export function showTypePhoto(kind: FeedKind): string {
  if (kind === 'sport') return STATION_PHOTOS.gvlActionSprint
  if (kind === 'community') return STATION_PHOTOS.communityBookStall
  return STATION_PHOTOS.studioPresenterMic
}

/** Display URL for a card — WP photo when real, otherwise a station library shot. */
export function resolveFeedImage(url: string | null | undefined, kind: FeedKind = 'interview'): string {
  if (url && !isGenericSoundCloudArtwork(url)) return url
  return showTypePhoto(kind)
}

function extractFeaturedImage(post: WpPost): string | null {
  const media = post._embedded?.['wp:featuredmedia']?.[0]
  if (!media) return null
  const sizes = media.media_details?.sizes
  return (
    sizes?.large?.source_url ||
    sizes?.medium_large?.source_url ||
    sizes?.full?.source_url ||
    media.source_url ||
    null
  )
}

function kindFromCategories(cats?: number[]): FeedKind {
  if (!cats || cats.length === 0) return 'interview'
  if (cats.includes(INTERVIEW_CATEGORY_ID)) return 'interview'
  if (cats.includes(7)) return 'community'
  return 'sport'
}

function stripHtml(html: string): string {
  // Use DOM parsing to decode entities (&#8217; → ' etc.) then extract text only
  const el = document.createElement('div')
  el.innerHTML = html
  return (el.textContent ?? '').replace(/\s+/g, ' ').trim()
}

/** Pull SoundCloud stream MP3 from Divi / WordPress post HTML. */
export function extractSoundCloudStream(html: string): string | null {
  const match = html.match(/https:\/\/feeds\.soundcloud\.com\/stream\/[A-Za-z0-9_-]+(?:\.mp3)?/)
  return match?.[0] ?? null
}

function mapWpPost(post: WpPost, kindOverride?: FeedKind): Fm985Interview {
  const kind = kindOverride ?? kindFromCategories(post.categories)
  const featured = extractFeaturedImage(post)
  return {
    id: post.id,
    title: stripHtml(post.title.rendered),
    excerpt: stripHtml(post.excerpt.rendered),
    link: post.link,
    date: post.date,
    audioUrl:
      extractSoundCloudStream(post.content.rendered) ??
      extractSoundCloudStream(post.excerpt.rendered),
    imageUrl: resolveFeedImage(featured, kind),
    kind,
  }
}

/** Real July 2026 interviews from WP REST — used when the proxy is down. */
const INTERVIEW_FALLBACK: Fm985Interview[] = [
  {
    id: 27492,
    title: 'Maree from the Visitor Centre talks what’s on this weekend in the Goulburn Valley – 24.7.26',
    excerpt: 'What’s on this weekend in the Goulburn Valley — from fm985.com.au.',
    link: 'https://fm985.com.au/interview/maree-from-the-visitor-centre-talks-whats-on-this-weekend-in-the-goulburn-valley-24-7-26/',
    date: '2026-07-24T09:00:04',
    audioUrl: null,
    imageUrl: null,
    kind: 'interview',
  },
  {
    id: 27381,
    title: 'Rowan Farren-Parnell with Rena & Aurora from the Mooroopna Steering Committee on a KidsTown petition',
    excerpt: 'Mooroopna Steering Committee interview on a KidsTown petition.',
    link: 'https://fm985.com.au/interview/rowan-farren-parnell-with-rena-aurora-from-the-mooroopna-steering-committee-on-a-kidstown-petition/',
    date: '2026-07-17T09:00:00',
    audioUrl: null,
    imageUrl: 'https://fm985.com.au/wp-content/uploads/2026/07/artworks-mW5vE65pGaKWTrk9-dZFogQ-t3000x3000-scaled.jpg',
    kind: 'interview',
  },
  {
    id: 27384,
    title: 'Collingwood Wheelchair AFL player Jack Elliott ahead of their Shepparton match vs St. Kilda',
    excerpt: 'Wheelchair AFL in Shepparton — interview on fm985.com.au.',
    link: 'https://fm985.com.au/interview/collingwood-wheelchair-afl-player-jack-elliott-ahead-of-their-shepparton-match-vs-st-kilda/',
    date: '2026-07-17T09:00:00',
    audioUrl: null,
    imageUrl: 'https://fm985.com.au/wp-content/uploads/2026/07/artworks-ZAf01oqEARs11Oxj-qRVkRA-t3000x3000-scaled.jpg',
    kind: 'interview',
  },
  {
    id: 27383,
    title: 'Jay ‘Redda’ Humphries who is preparing to run a half marathon for Beyond Blue',
    excerpt: 'Community interview — half marathon for Beyond Blue.',
    link: 'https://fm985.com.au/interview/jay-redda-humphries-who-is-preparing-to-run-a-half-marathon-for-beyond-blue/',
    date: '2026-07-17T09:00:00',
    audioUrl: null,
    imageUrl: null,
    kind: 'interview',
  },
  {
    id: 27359,
    title: 'Johnny Painter Interviews Bill Winters from RoadSafe Goulburn Valley – July 10, 2026',
    excerpt: 'RoadSafe Goulburn Valley with Johnny Painter.',
    link: 'https://fm985.com.au/interview/johnny-painter-interviews-bill-winters-from-roadsafe-goulburn-valley-july-10-2026/',
    date: '2026-07-10T09:00:00',
    audioUrl: null,
    imageUrl: null,
    kind: 'interview',
  },
  {
    id: 27291,
    title: 'Lauren Darby from Coast Rescue about PeliCount 2026',
    excerpt: 'Coast Rescue — PeliCount 2026.',
    link: 'https://fm985.com.au/interview/lauren-darby-from-coast-rescue-about-pelicount-2026/',
    date: '2026-07-10T09:00:00',
    audioUrl: null,
    imageUrl: 'https://fm985.com.au/wp-content/uploads/2026/07/artworks-NkLohYWi5YdsaILV-jR07jw-t3000x3000-scaled.jpg',
    kind: 'interview',
  },
  {
    id: 27292,
    title: 'Comedian Damian Callinan on his upcoming show ‘Hall Stories’ at the Dookie Hall',
    excerpt: 'Hall Stories at the Dookie Hall.',
    link: 'https://fm985.com.au/interview/comedian-damian-callinan-on-his-upcoming-show-hall-stories-at-the-dookie-hall/',
    date: '2026-07-03T09:00:00',
    audioUrl: null,
    imageUrl: 'https://fm985.com.au/wp-content/uploads/2026/07/artworks-7pUnkJS7dmsfXQ2W-LzFEjQ-t3000x3000-scaled.jpg',
    kind: 'interview',
  },
  {
    id: 27288,
    title: 'Country singer Steve Bell in the One FM studio with Di Hunter',
    excerpt: 'Steve Bell in the ONE FM studio with Di Hunter.',
    link: 'https://fm985.com.au/interview/country-singer-steve-bell-in-the-one-fm-studio-with-di-hunter/',
    date: '2026-07-03T09:00:00',
    audioUrl: null,
    imageUrl: 'https://fm985.com.au/wp-content/uploads/2026/07/artworks-mLcSEB52V8Q6GkTT-Wl2nEg-t3000x3000-scaled.jpg',
    kind: 'interview',
  },
].map((row): Fm985Interview => ({
  ...row,
  kind: 'interview',
  imageUrl: resolveFeedImage(row.imageUrl, 'interview'),
}))

const SPORT_FALLBACK: Fm985Interview[] = [
  {
    id: 27493,
    title: 'Percy Dryden, Sheala & Jayden ‘Chainbreaker’ Atkinson from the Yorta Yorta Turtles basketball side.',
    excerpt: 'Yorta Yorta Turtles basketball — Super Saturday Sport on fm985.com.au.',
    link: 'https://fm985.com.au/sport/super-sport/yorta-yorta-turtles/percy-dryden-sheala-jayden-chainbreaker-atkinson-from-the-yorta-yorta-turtles-basketball-side/',
    date: '2026-07-27T09:00:00',
    audioUrl: null,
    imageUrl: resolveFeedImage(
      'https://fm985.com.au/wp-content/uploads/2026/07/artworks-GDg5hStOhjMEPwCC-4N35Ig-t3000x3000-scaled.jpg',
      'sport',
    ),
    kind: 'sport',
  },
  {
    id: 27503,
    title: 'Sport And Road – July 25, 2026',
    excerpt: 'Super Saturday — Sport And Road.',
    link: 'https://fm985.com.au/sport/super-sport/sport-and-road/sport-and-road-july-25-2026/',
    date: '2026-07-27T09:00:00',
    audioUrl: null,
    imageUrl: showTypePhoto('sport'),
    kind: 'sport',
  },
  {
    id: 27502,
    title: 'Square Gaiters’ – The Harness Racing Show – July 25, 2026',
    excerpt: 'Super Saturday — Square Gaiters harness racing.',
    link: 'https://fm985.com.au/sport/super-sport/square-gaiters/square-gaiters-the-harness-racing-show-july-25-2026/',
    date: '2026-07-27T09:00:00',
    audioUrl: null,
    imageUrl: showTypePhoto('sport'),
    kind: 'sport',
  },
  {
    id: 27501,
    title: 'Hole In One’ – Golf Show – July 25, 2026',
    excerpt: 'Super Saturday — Hole In One golf.',
    link: 'https://fm985.com.au/sport/super-sport/hole-in-one/hole-in-one-golf-show-july-25-2026/',
    date: '2026-07-27T09:00:00',
    audioUrl: null,
    imageUrl: showTypePhoto('sport'),
    kind: 'sport',
  },
]

function scrapedFallback(limit: number): Fm985Interview[] {
  if (INTERVIEW_FALLBACK.length > 0) {
    return INTERVIEW_FALLBACK.slice(0, limit)
  }
  const rows = (scraped as { recent_interviews?: Array<{ date: string; guest: string; topic: string; host: string }> })
    .recent_interviews ?? []
  return rows.slice(0, limit).map((row, i) => {
    const guest = row.guest.startsWith('[') ? 'Community guest' : row.guest
    const host = row.host.startsWith('[') ? 'ONE FM' : row.host
    return {
      id: 9000 + i,
      title: `${guest} — ${row.topic}`,
      excerpt: `Interview with ${guest} on ${row.topic}. Hosted by ${host}.`,
      link: 'https://fm985.com.au/category/interview/',
      date: row.date,
      audioUrl: null,
      imageUrl: showTypePhoto('interview'),
      kind: 'interview' as const,
    }
  })
}

async function fetchFromWp(
  limit: number,
  categories: number | readonly number[],
  kind?: FeedKind,
): Promise<Fm985Interview[] | null> {
  const cat = typeof categories === 'number' ? String(categories) : categories.join(',')
  const query = `posts?categories=${cat}&per_page=${limit}&_embed=wp:featuredmedia`
  for (const base of API_BASES) {
    const url = `${base}${WP_PATH}/${query}`
    try {
      const res = await fetch(url)
      if (!res.ok) continue
      const posts: WpPost[] = await res.json()
      if (!Array.isArray(posts) || posts.length === 0) continue
      return posts.map((post) => mapWpPost(post, kind))
    } catch {
      continue
    }
  }
  return null
}

export async function fetchLatestInterviews(limit = 6): Promise<Fm985Interview[]> {
  const live = await fetchFromWp(limit, INTERVIEW_CATEGORY_ID, 'interview')
  if (live && live.length > 0) return live
  return scrapedFallback(limit)
}

export async function fetchLatestSport(limit = 8): Promise<Fm985Interview[]> {
  const live = await fetchFromWp(limit, SPORT_CATEGORY_IDS, 'sport')
  if (live && live.length > 0) return live
  return SPORT_FALLBACK.slice(0, limit)
}

export function formatInterviewDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
