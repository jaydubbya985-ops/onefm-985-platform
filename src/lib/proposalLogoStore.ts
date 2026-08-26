/**
 * Client logos stay on this device.
 * Not written to Supabase (no logo column) and stripped from the main ops localStorage blob.
 */
const KEY = 'onefm_proposal_logos_v1'

export interface StoredProposalLogo {
  dataUrl: string
  w: number
  h: number
}

export function loadProposalLogos(): Record<string, StoredProposalLogo> {
  try {
    const raw = window.sessionStorage.getItem(KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as Record<string, StoredProposalLogo | string>
    if (!parsed || typeof parsed !== 'object') return {}
    const out: Record<string, StoredProposalLogo> = {}
    for (const [id, value] of Object.entries(parsed)) {
      if (typeof value === 'string') out[id] = { dataUrl: value, w: 400, h: 200 }
      else if (value?.dataUrl) out[id] = value
    }
    return out
  } catch {
    return {}
  }
}

export function saveProposalLogo(id: string, logo: StoredProposalLogo | null): void {
  try {
    const map = loadProposalLogos()
    if (logo) map[id] = logo
    else delete map[id]
    window.sessionStorage.setItem(KEY, JSON.stringify(map))
  } catch {
    // Quota / private mode — PDF can still use in-memory state this session.
  }
}
