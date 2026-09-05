/**
 * Community Broadcasting Foundation — dollars we can collect without inventing them.
 *
 * Program names and close dates: CBF public rounds, checked 25 Aug 2026
 * (cbf.org.au/round-2-grants-now-open/ and cbf.smartygrants.com.au).
 *
 * Awarded amounts for ONE FM: DATA PENDING until Jay pastes a grant letter
 * or SmartyGrants record. Do not put a dollar figure on any row.
 */

export type CbfProgramStatus = 'open' | 'closed' | 'pending_letter'

export interface CbfProgram {
  id: string
  name: string
  status: CbfProgramStatus
  closes?: string
  closed?: string
  closesNote: string
  /** Always null until a real award letter is on file. */
  amountAud: null
  source: string
  action: string
}

export const CBF_SOURCE_CHECKED = '2026-08-25'

export const CBF_PROGRAMS: CbfProgram[] = [
  {
    id: 'stolen-generations',
    name: 'Stolen Generations Truth Telling grants',
    status: 'open',
    closes: '2026-09-01',
    closesNote: 'Closes 2:00pm AEST Tuesday 1 September 2026',
    amountAud: null,
    source: 'CBF SmartyGrants + cbf.org.au Round 2 2026/27, checked 25 Aug 2026',
    action:
      'Only if ONE FM has a survivor-led project that fits the guidelines. Amount stays Data pending until an award letter exists.',
  },
  {
    id: 'music-hubs',
    name: 'Community Radio Music Hubs',
    status: 'open',
    closes: '2026-09-13',
    closesNote: 'Opened 9:00am 24 Aug 2026 · closes 13 September 2026',
    amountAud: null,
    source: 'cbf.smartygrants.com.au, checked 25 Aug 2026',
    action:
      'Check eligibility in SmartyGrants. Do not invent a request amount here — paste the submitted or awarded figure when Jay has it.',
  },
  {
    id: 'content-r2',
    name: 'Content grants — Round 2 2026/27',
    status: 'closed',
    closed: '2026-08-11',
    closesNote: 'Closed 2:00pm AEST Tuesday 11 August 2026',
    amountAud: null,
    source: 'cbf.org.au Round 2 2026/27, checked 25 Aug 2026',
    action:
      'If already submitted, track the SmartyGrants ID. If not, wait for Round 1 2027. Amount pending award letter.',
  },
  {
    id: 'srp-r2',
    name: 'Specialist Radio Programming grants — Round 2 2026/27',
    status: 'closed',
    closed: '2026-08-11',
    closesNote: 'Closed 2:00pm AEST Tuesday 11 August 2026 (ethnic / First Nations / RPH)',
    amountAud: null,
    source: 'cbf.org.au Round 2 2026/27, checked 25 Aug 2026',
    action:
      'If ONE FM lodged ethnic / First Nations / RPH programs, track that application. Amount pending award letter.',
  },
  {
    id: 'dev-ops-r2',
    name: 'Development & Operations grants — Round 2 2026/27',
    status: 'closed',
    closed: '2026-08-11',
    closesNote: 'Closed 2:00pm AEST Tuesday 11 August 2026',
    amountAud: null,
    source: 'cbf.org.au Round 2 2026/27, checked 25 Aug 2026',
    action:
      'If already submitted, track it. If not, next window is Round 1 2027. Amount pending award letter.',
  },
]

export const CBF_NEED_JAY =
  'NEED JAY: paste last CBF award letters / SmartyGrants application IDs. Until then every CBF dollar stays Data pending.'
