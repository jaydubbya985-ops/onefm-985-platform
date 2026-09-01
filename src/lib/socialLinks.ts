/**
 * ONE FM 98.5 — official social profiles (Jason-confirmed).
 */

export const FACEBOOK_PAGE_URL = 'https://www.facebook.com/onefmshepparton'

export const SOUNDCLOUD_PROFILE_URL = 'https://soundcloud.com/user-570295409'

/** Placeholders until URLs are confirmed */
export const SOCIAL_LINKS = {
  facebook: FACEBOOK_PAGE_URL,
  soundcloud: SOUNDCLOUD_PROFILE_URL,
  instagram: null as string | null,
  twitter: null as string | null,
  youtube: null as string | null,
  tiktok: null as string | null,
} as const

export function facebookPageEmbedUrl(width = 500, height = 400): string {
  const params = new URLSearchParams({
    href: FACEBOOK_PAGE_URL,
    tabs: 'timeline',
    width: String(width),
    height: String(height),
    small_header: 'true',
    adapt_container_width: 'true',
    hide_cover: 'false',
    show_facepile: 'true',
  })
  return `https://www.facebook.com/plugins/page.php?${params.toString()}`
}

export type SocialPlatform = keyof typeof SOCIAL_LINKS

export function getSocialHref(platform: SocialPlatform): string | null {
  return SOCIAL_LINKS[platform]
}

/** Confirmed public profiles only. Do not invent Instagram, X, YouTube, or TikTok URLs. */
export function confirmedSocialNote(): string {
  return 'Facebook and SoundCloud only'
}
