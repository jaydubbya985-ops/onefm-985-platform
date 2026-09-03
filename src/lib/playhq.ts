/**
 * PlayHQ types for a future server-side GVL feed.
 * Do not ship invented fixtures, LIVE scores, or a scraped Facebook ladder.
 * Keys stay server-side — never call PlayHQ from the browser.
 */

export interface PlayHQGame {
  id: string;
  status: 'UPCOMING' | 'LIVE' | 'FINAL';
  createdAt: string;
  updatedAt: string;
  association: {
    id: string;
    name: string;
    url: string;
    logo: { sizes: { url: string; dimensions: { width: number; height: number } }[] };
  };
  competition: { id: string; name: string };
  season: { id: string; name: string; status: string; url: string };
  grade: { id: string; name: string; url: string };
  round: { id: string; name: string } | null;
  schedule: { date: string; time: string; timezone: string };
  competitors: PlayHQCompetitor[];
  venue: PlayHQVenue | null;
  gameType: { name: string; value: string };
}

export interface PlayHQCompetitor {
  id: string;
  name: string;
  isHomeTeam: boolean;
  outcome: 'WON' | 'LOST' | 'DRAW' | null;
  scoreTotal: number;
  scoreSubTotal: { type: string; value: number }[];
}

export interface PlayHQVenue {
  id: string;
  name: string;
  surfaceName: string;
  surfaceAbbreviation: string;
  address: {
    line1: string;
    suburb: string;
    postcode: string;
    state: string;
    country: string;
    latitude: string;
    longitude: string;
  };
}

export interface PlayHQGameSummary {
  id: string;
  status: string;
  gradeId: string;
  round: { id: string; name: string; abbreviatedName: string; isFinalRound: boolean };
  type: string;
  schedule: { day: number | null; dateTime: string; playingSurfaceId: string }[];
  appearances: PlayHQAppearance[];
  competitors: PlayHQSummaryCompetitor[];
  periods: PlayHQPeriod[];
}

export interface PlayHQAppearance {
  id: string;
  firstName: string | null;
  lastName: string | null;
  roleType: string;
  captainRole: string | null;
  isFillIn: boolean;
  isEmergency: boolean;
  isRegisteredPlayer: boolean;
  visible: boolean;
  teamId: string;
  playerNumber: string | null;
  playerPosition: string | null;
  scoreTotal: number;
  bestPlayer: number;
  scoreSubTotal: { type: string; value: number }[];
}

export interface PlayHQSummaryCompetitor {
  id: string;
  name: string;
  isHomeTeam: boolean;
  outcome: string;
  scoreTotal: number;
  scoreSubTotal: { type: string; value: number }[];
}

export interface PlayHQPeriod {
  name: string;
  competitors: {
    id: string;
    scoreTotals: number;
    scoreSubtotals: { type: string; value: number }[];
  }[];
}

/** Public GVL senior club names. Colours and ladder points are data pending. */
export const GVL_TEAMS = [
  { id: 'shepparton', name: 'Shepparton', shortName: 'Shep' },
  { id: 'echuca', name: 'Echuca', shortName: 'Echu' },
  { id: 'seymour', name: 'Seymour', shortName: 'Seym' },
  { id: 'mansfield', name: 'Mansfield', shortName: 'Mans' },
  { id: 'kyabram', name: 'Kyabram', shortName: 'Kyab' },
  { id: 'mooroopna', name: 'Mooroopna', shortName: 'Moor' },
  { id: 'shepp-united', name: 'Shepparton United', shortName: 'SUtd' },
  { id: 'shepp-swans', name: 'Shepparton Swans', shortName: 'SSwa' },
  { id: 'benalla', name: 'Benalla', shortName: 'Bena' },
  { id: 'rochester', name: 'Rochester', shortName: 'Roch' },
  { id: 'euroa', name: 'Euroa', shortName: 'Euro' },
  { id: 'tatura', name: 'Tatura', shortName: 'Tatu' },
] as const

export interface GVLLadderTeam {
  position: number
  team: string
  played: number
  won: number
  lost: number
  pointsFor: number
  pointsAgainst: number
  percentage: number
  points: number
}

/** Empty until a server-side PlayHQ proxy exists. Never fill with invented Round tables. */
export const GVL_LADDER: GVLLadderTeam[] = []

export function formatAFLScore(scoreTotal: number, scoreSubTotal: { type: string; value: number }[]): string {
  const goals = scoreSubTotal.find((s) => s.type === 'TOTAL_GOALS')?.value ?? 0
  const behinds = scoreSubTotal.find((s) => s.type === 'TOTAL_BEHINDS')?.value ?? 0
  return `${goals}.${behinds} (${scoreTotal})`
}

export function getGameStatusLabel(status: string): string {
  switch (status) {
    case 'UPCOMING':
      return 'Upcoming'
    case 'LIVE':
      return 'LIVE'
    case 'FINAL':
      return 'Full Time'
    default:
      return status
  }
}

/** Club colours are data pending — do not invent GVL brand hex. */
export function getTeamColor(_teamName: string): string {
  return '#8A9199'
}
