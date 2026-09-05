/**
 * Live content from fm985.com.au + ONE FM SoundCloud (user-570295409).
 * Interviews on WordPress embed SoundCloud stream URLs — we parse those for native audio.
 */

import scraped from '@/data/oneFmScrapedData.json'

export const SOUNDCLOUD_PROFILE_URL = 'https://soundcloud.com/user-570295409'

/** @deprecated Native SoundCloudPanel replaces the orange iframe widget. */
export const SOUNDCLOUD_EMBED_URL =
  'https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/user-570295409&color=%23D4AF37&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false'

const WP_PATH = '/wp-json/wp/v2'
/** WordPress category: Interview */
const INTERVIEW_CATEGORY_ID = 24

/** Try Netlify rewrite, then serverless proxy, then static scraped interviews. */
const API_BASES = [
  '/api/fm985',
  '/.netlify/functions/fm985-proxy',
]

export interface Fm985Interview {
  id: number
  title: string
  excerpt: string
  link: string
  date: string
  audioUrl: string | null
  imageUrl: string | null
}

interface WpPost {
  id: number
  date: string
  link: string
  title: { rendered: string }
  excerpt: { rendered: string }
  content: { rendered: string }
  _embedded?: {
    'wp:featuredmedia'?: Array<{ source_url?: string }>
  }
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

function scrapedFallback(limit: number): Fm985Interview[] {
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
      imageUrl: null,
    }
  })
}

async function fetchFromWp(limit: number): Promise<Fm985Interview[] | null> {
  const query = `posts?categories=${INTERVIEW_CATEGORY_ID}&per_page=${limit}&_embed=wp:featuredmedia`
  for (const base of API_BASES) {
    const url = `${base}${WP_PATH}/${query}`
    try {
      const res = await fetch(url)
      if (!res.ok) continue
      const posts: WpPost[] = await res.json()
      if (!Array.isArray(posts) || posts.length === 0) continue
      return posts.map((post) => ({
        id: post.id,
        title: stripHtml(post.title.rendered),
        excerpt: stripHtml(post.excerpt.rendered),
        link: post.link,
        date: post.date,
        audioUrl:
          extractSoundCloudStream(post.content.rendered) ??
          extractSoundCloudStream(post.excerpt.rendered),
        imageUrl: post._embedded?.['wp:featuredmedia']?.[0]?.source_url ?? null,
      }))
    } catch {
      continue
    }
  }
  return null
}

export type InterviewFeedSource = 'wordpress' | 'station-archive'

export interface InterviewFeed {
  items: Fm985Interview[]
  source: InterviewFeedSource
}

export function interviewFeedEyebrow(source: InterviewFeedSource): string {
  return source === 'wordpress' ? 'FROM FM985.COM.AU' : 'STATION ARCHIVE'
}

export function interviewFeedIntro(source: InterviewFeedSource): string {
  return source === 'wordpress'
    ? 'Interviews published on fm985.com.au — play the SoundCloud cut when the post includes one.'
    : 'The live WordPress feed is not on this session. These rows are the station interview archive, not today\'s posts.'
}

export async function fetchInterviewFeed(limit = 6): Promise<InterviewFeed> {
  const live = await fetchFromWp(limit)
  if (live && live.length > 0) return { items: live, source: 'wordpress' }
  return { items: scrapedFallback(limit), source: 'station-archive' }
}

/** Array-only wrapper — SoundCloudPanel still consumes items, not the source label. */
export async function fetchLatestInterviews(limit = 6): Promise<Fm985Interview[]> {
  const feed = await fetchInterviewFeed(limit)
  return feed.items
}

export function formatInterviewDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
