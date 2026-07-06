/**
 * Living Archive content model — ONE FM 98.5: The Living Archive of the Goulburn Valley.
 * Phase 1 spine. Every public claim carries source confidence.
 */

export type SourceConfidence =
  | 'confirmed-public'
  | 'confirmed-one-fm-document'
  | 'confirmed-website-archive'
  | 'confirmed-newspaper'
  | 'oral-history'
  | 'needs-verification'

export type PersonCategory =
  | 'life-member'
  | 'presenter'
  | 'sport-caller'
  | 'board'
  | 'technical'
  | 'multicultural'
  | 'volunteer'
  | 'breakfast-host'
  | 'ob-crew'

export type ArchiveTopic =
  | 'origins'
  | 'sport'
  | 'multicultural'
  | 'emergency'
  | 'event'
  | 'governance'
  | 'branding'

export type DecadeId = '1980s' | '1990s' | '2000s' | '2010s' | '2020s'

export interface ArchiveSource {
  label: string
  type: 'acma' | 'annual-report' | 'fm985' | 'newspaper' | 'council' | 'website-archive' | 'oral'
  date?: string
  url?: string
}

export interface ArchivePerson {
  id: string
  name: string
  categories: PersonCategory[]
  years?: string
  roles?: string[]
  programs?: string[]
  photo?: string
  confidence: SourceConfidence
  sources: ArchiveSource[]
  notes?: string
}

export interface ArchiveCard {
  id: string
  decade: DecadeId
  year?: number
  topic: ArchiveTopic
  cardType:
    | 'milestone'
    | 'newspaper'
    | 'presenter'
    | 'program'
    | 'photo'
    | 'event'
    | 'football'
    | 'emergency'
    | 'multicultural'
    | 'award'
    | 'website-archive'
    | 'memory-pending'
  title: string
  body: string
  confidence: SourceConfidence
  sources: ArchiveSource[]
  people?: string[]
  places?: string[]
  image?: string
}

export const CONFIDENCE_LABELS: Record<SourceConfidence, string> = {
  'confirmed-public': 'Confirmed · public source',
  'confirmed-one-fm-document': 'Confirmed · ONE FM document',
  'confirmed-website-archive': 'Confirmed · website archive',
  'confirmed-newspaper': 'Confirmed · newspaper',
  'oral-history': 'Community memory',
  'needs-verification': 'Still verifying',
}

export const CATEGORY_LABELS: Record<PersonCategory, string> = {
  'life-member': 'Life members',
  presenter: 'Presenters',
  'sport-caller': 'Sports callers',
  board: 'Board / governance',
  technical: 'Technical / production',
  multicultural: 'Multicultural',
  volunteer: 'Volunteers',
  'breakfast-host': 'Breakfast hosts',
  'ob-crew': 'Outside broadcast',
}
