/**
 * Live content from fm985.com.au + ONE FM SoundCloud (user-570295409).
 * Interviews on WordPress embed SoundCloud stream URLs — we parse those for native audio.
 */

export const SOUNDCLOUD_PROFILE_URL = 'https://soundcloud.com/user-570295409'
export const SOUNDCLOUD_EMBED_URL =
  'https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/user-570295409&color=%23D4A853&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=true'

const WP_API = '/api/fm985/wp-json/wp/v2'
/** WordPress category: Interview */
const INTERVIEW_CATEGORY_ID = 24

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
  const doc = html.replace(/<[^>]+>/g, ' ').replace(/&[^;]+;/g, ' ')
  return doc.replace(/\s+/g, ' ').trim()
}

/** Pull SoundCloud stream MP3 from Divi / WordPress post HTML. */
export function extractSoundCloudStream(html: string): string | null {
  const match = html.match(/https:\/\/feeds\.soundcloud\.com\/stream\/[A-Za-z0-9_-]+(?:\.mp3)?/)
  return match?.[0] ?? null
}

export async function fetchLatestInterviews(limit = 6): Promise<Fm985Interview[]> {
  const url = `${WP_API}/posts?categories=${INTERVIEW_CATEGORY_ID}&per_page=${limit}&_embed=wp:featuredmedia`
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`fm985 feed error: ${res.status}`)
  }

  const posts: WpPost[] = await res.json()

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
}

export function formatInterviewDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
