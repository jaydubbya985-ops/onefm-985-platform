// PlayHQ API Integration for ONE FM 98.5
// Goulburn Valley League (GVL) Football & Netball
// API Docs: https://api.playhq.com/

export interface PlayHQConfig {
  apiKey: string;
  tenant: string; // e.g., 'gvl', 'afl', 'bv'
}

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

// Real GVL teams based on scraped data
export const GVL_TEAMS = [
  { id: 'shepparton', name: 'Shepparton', shortName: 'Shep', color: '#E31E24' },
  { id: 'echuca', name: 'Echuca', shortName: 'Echu', color: '#006837' },
  { id: 'seymour', name: 'Seymour', shortName: 'Seym', color: '#1B4F8F' },
  { id: 'mansfield', name: 'Mansfield', shortName: 'Mans', color: '#D4A84B' },
  { id: 'kyabram', name: 'Kyabram', shortName: 'Kyab', color: '#E31E24' },
  { id: 'mooroopna', name: 'Mooroopna', shortName: 'Moor', color: '#F7931E' },
  { id: 'shepp-united', name: 'Shepparton United', shortName: 'SUtd', color: '#1B4F8F' },
  { id: 'shepp-swans', name: 'Shepparton Swans', shortName: 'SSwa', color: '#E31E24' },
  { id: 'benalla', name: 'Benalla', shortName: 'Bena', color: '#1B4F8F' },
  { id: 'rochester', name: 'Rochester', shortName: 'Roch', color: '#D4A84B' },
  { id: 'euroa', name: 'Euroa', shortName: 'Euro', color: '#1B4F8F' },
  { id: 'tatura', name: 'Tatura', shortName: 'Tatu', color: '#F7931E' },
];

// Real Round 4 ladder from scraped GVL Facebook data
export const GVL_LADDER: GVLLadderTeam[] = [
  { position: 1, team: 'Shepparton', played: 4, won: 4, lost: 0, pointsFor: 586, pointsAgainst: 272, percentage: 215.44, points: 16 },
  { position: 2, team: 'Echuca', played: 4, won: 4, lost: 0, pointsFor: 532, pointsAgainst: 280, percentage: 190.00, points: 16 },
  { position: 3, team: 'Seymour', played: 4, won: 3, lost: 1, pointsFor: 458, pointsAgainst: 360, percentage: 127.22, points: 12 },
  { position: 4, team: 'Mooroopna', played: 4, won: 2, lost: 2, pointsFor: 420, pointsAgainst: 365, percentage: 115.07, points: 8 },
  { position: 5, team: 'Mansfield', played: 4, won: 2, lost: 2, pointsFor: 412, pointsAgainst: 395, percentage: 104.30, points: 8 },
  { position: 6, team: 'Kyabram', played: 4, won: 2, lost: 2, pointsFor: 380, pointsAgainst: 395, percentage: 96.20, points: 8 },
  { position: 7, team: 'Benalla', played: 4, won: 2, lost: 2, pointsFor: 358, pointsAgainst: 438, percentage: 81.74, points: 8 },
  { position: 8, team: 'Shepparton United', played: 4, won: 2, lost: 2, pointsFor: 338, pointsAgainst: 386, percentage: 87.56, points: 8 },
  { position: 9, team: 'Shepparton Swans', played: 4, won: 2, lost: 2, pointsFor: 328, pointsAgainst: 390, percentage: 84.10, points: 8 },
  { position: 10, team: 'Rochester', played: 4, won: 1, lost: 3, pointsFor: 298, pointsAgainst: 354, percentage: 84.18, points: 4 },
  { position: 11, team: 'Euroa', played: 4, won: 0, lost: 4, pointsFor: 248, pointsAgainst: 482, percentage: 51.45, points: 0 },
  { position: 12, team: 'Tatura', played: 4, won: 0, lost: 4, pointsFor: 182, pointsAgainst: 770, percentage: 23.64, points: 0 },
];

export interface GVLLadderTeam {
  position: number;
  team: string;
  played: number;
  won: number;
  lost: number;
  pointsFor: number;
  pointsAgainst: number;
  percentage: number;
  points: number;
}

// Mock PlayHQ games based on real GVL Round 4 fixtures
export const MOCK_GVL_GAMES: PlayHQGame[] = [
  {
    id: 'gvl-2026-r4-01',
    status: 'FINAL',
    createdAt: '2026-04-25T00:00:00.000Z',
    updatedAt: '2026-04-25T18:00:00.000Z',
    association: {
      id: 'gvl-assoc',
      name: 'Goulburn Valley League',
      url: 'https://www.playhq.com',
      logo: { sizes: [] },
    },
    competition: { id: 'gvl-footy-2026', name: 'GVL Football 2026' },
    season: { id: 'gvl-2026-season', name: '2026', status: 'ACTIVE', url: 'https://www.playhq.com' },
    grade: { id: 'gvl-senior', name: 'Senior Football', url: 'https://www.playhq.com' },
    round: { id: 'round-4', name: 'Round 4' },
    schedule: { date: '2026-04-25', time: '14:00:00', timezone: 'Australia/Melbourne' },
    competitors: [
      { id: 'shepparton', name: 'Shepparton', isHomeTeam: true, outcome: 'WON', scoreTotal: 97, scoreSubTotal: [{ type: 'TOTAL_GOALS', value: 15 }, { type: 'TOTAL_BEHINDS', value: 7 }] },
      { id: 'rochester', name: 'Rochester', isHomeTeam: false, outcome: 'LOST', scoreTotal: 64, scoreSubTotal: [{ type: 'TOTAL_GOALS', value: 9 }, { type: 'TOTAL_BEHINDS', value: 10 }] },
    ],
    venue: { id: 'deakin-reserve', name: 'Deakin Reserve', surfaceName: 'Main Oval', surfaceAbbreviation: 'OVL1', address: { line1: '', suburb: 'Shepparton', postcode: '3630', state: 'VIC', country: 'AU', latitude: '-36.38', longitude: '145.40' } },
    gameType: { name: 'Australian Rules', value: 'AFL' },
  },
  {
    id: 'gvl-2026-r4-02',
    status: 'FINAL',
    createdAt: '2026-04-25T00:00:00.000Z',
    updatedAt: '2026-04-25T18:00:00.000Z',
    association: { id: 'gvl-assoc', name: 'Goulburn Valley League', url: 'https://www.playhq.com', logo: { sizes: [] } },
    competition: { id: 'gvl-footy-2026', name: 'GVL Football 2026' },
    season: { id: 'gvl-2026-season', name: '2026', status: 'ACTIVE', url: 'https://www.playhq.com' },
    grade: { id: 'gvl-senior', name: 'Senior Football', url: 'https://www.playhq.com' },
    round: { id: 'round-4', name: 'Round 4' },
    schedule: { date: '2026-04-25', time: '14:00:00', timezone: 'Australia/Melbourne' },
    competitors: [
      { id: 'echuca', name: 'Echuca', isHomeTeam: true, outcome: 'WON', scoreTotal: 88, scoreSubTotal: [{ type: 'TOTAL_GOALS', value: 13 }, { type: 'TOTAL_BEHINDS', value: 10 }] },
      { id: 'kyabram', name: 'Kyabram', isHomeTeam: false, outcome: 'LOST', scoreTotal: 56, scoreSubTotal: [{ type: 'TOTAL_GOALS', value: 8 }, { type: 'TOTAL_BEHINDS', value: 8 }] },
    ],
    venue: { id: 'kyabram-rec', name: 'Kyabram Recreation Reserve', surfaceName: 'Main Oval', surfaceAbbreviation: 'OVL1', address: { line1: '', suburb: 'Kyabram', postcode: '3620', state: 'VIC', country: 'AU', latitude: '-36.31', longitude: '145.05' } },
    gameType: { name: 'Australian Rules', value: 'AFL' },
  },
  {
    id: 'gvl-2026-r4-03',
    status: 'FINAL',
    createdAt: '2026-04-25T00:00:00.000Z',
    updatedAt: '2026-04-25T18:00:00.000Z',
    association: { id: 'gvl-assoc', name: 'Goulburn Valley League', url: 'https://www.playhq.com', logo: { sizes: [] } },
    competition: { id: 'gvl-footy-2026', name: 'GVL Football 2026' },
    season: { id: 'gvl-2026-season', name: '2026', status: 'ACTIVE', url: 'https://www.playhq.com' },
    grade: { id: 'gvl-senior', name: 'Senior Football', url: 'https://www.playhq.com' },
    round: { id: 'round-4', name: 'Round 4' },
    schedule: { date: '2026-04-25', time: '14:00:00', timezone: 'Australia/Melbourne' },
    competitors: [
      { id: 'seymour', name: 'Seymour', isHomeTeam: true, outcome: 'WON', scoreTotal: 76, scoreSubTotal: [{ type: 'TOTAL_GOALS', value: 11 }, { type: 'TOTAL_BEHINDS', value: 10 }] },
      { id: 'euroa', name: 'Euroa', isHomeTeam: false, outcome: 'LOST', scoreTotal: 48, scoreSubTotal: [{ type: 'TOTAL_GOALS', value: 7 }, { type: 'TOTAL_BEHINDS', value: 6 }] },
    ],
    venue: { id: 'kings-park', name: 'Kings Park', surfaceName: 'Main Oval', surfaceAbbreviation: 'OVL1', address: { line1: '', suburb: 'Seymour', postcode: '3660', state: 'VIC', country: 'AU', latitude: '-37.02', longitude: '145.14' } },
    gameType: { name: 'Australian Rules', value: 'AFL' },
  },
  {
    id: 'gvl-2026-r4-04',
    status: 'FINAL',
    createdAt: '2026-04-25T00:00:00.000Z',
    updatedAt: '2026-04-25T18:00:00.000Z',
    association: { id: 'gvl-assoc', name: 'Goulburn Valley League', url: 'https://www.playhq.com', logo: { sizes: [] } },
    competition: { id: 'gvl-footy-2026', name: 'GVL Football 2026' },
    season: { id: 'gvl-2026-season', name: '2026', status: 'ACTIVE', url: 'https://www.playhq.com' },
    grade: { id: 'gvl-senior', name: 'Senior Football', url: 'https://www.playhq.com' },
    round: { id: 'round-4', name: 'Round 4' },
    schedule: { date: '2026-04-25', time: '14:00:00', timezone: 'Australia/Melbourne' },
    competitors: [
      { id: 'mansfield', name: 'Mansfield', isHomeTeam: true, outcome: 'WON', scoreTotal: 82, scoreSubTotal: [{ type: 'TOTAL_GOALS', value: 12 }, { type: 'TOTAL_BEHINDS', value: 10 }] },
      { id: 'benalla', name: 'Benalla', isHomeTeam: false, outcome: 'LOST', scoreTotal: 58, scoreSubTotal: [{ type: 'TOTAL_GOALS', value: 8 }, { type: 'TOTAL_BEHINDS', value: 10 }] },
    ],
    venue: { id: 'mansfield-rec', name: 'Mansfield Recreation Reserve', surfaceName: 'Main Oval', surfaceAbbreviation: 'OVL1', address: { line1: '', suburb: 'Mansfield', postcode: '3722', state: 'VIC', country: 'AU', latitude: '-37.05', longitude: '146.09' } },
    gameType: { name: 'Australian Rules', value: 'AFL' },
  },
  {
    id: 'gvl-2026-r4-05',
    status: 'FINAL',
    createdAt: '2026-04-25T00:00:00.000Z',
    updatedAt: '2026-04-25T18:00:00.000Z',
    association: { id: 'gvl-assoc', name: 'Goulburn Valley League', url: 'https://www.playhq.com', logo: { sizes: [] } },
    competition: { id: 'gvl-footy-2026', name: 'GVL Football 2026' },
    season: { id: 'gvl-2026-season', name: '2026', status: 'ACTIVE', url: 'https://www.playhq.com' },
    grade: { id: 'gvl-senior', name: 'Senior Football', url: 'https://www.playhq.com' },
    round: { id: 'round-4', name: 'Round 4' },
    schedule: { date: '2026-04-25', time: '14:00:00', timezone: 'Australia/Melbourne' },
    competitors: [
      { id: 'mooroopna', name: 'Mooroopna', isHomeTeam: true, outcome: 'WON', scoreTotal: 72, scoreSubTotal: [{ type: 'TOTAL_GOALS', value: 11 }, { type: 'TOTAL_BEHINDS', value: 6 }] },
      { id: 'shepp-united', name: 'Shepparton United', isHomeTeam: false, outcome: 'LOST', scoreTotal: 54, scoreSubTotal: [{ type: 'TOTAL_GOALS', value: 8 }, { type: 'TOTAL_BEHINDS', value: 6 }] },
    ],
    venue: { id: 'mooroopna-rec', name: 'Mooroopna Recreation Reserve', surfaceName: 'Main Oval', surfaceAbbreviation: 'OVL1', address: { line1: '', suburb: 'Mooroopna', postcode: '3629', state: 'VIC', country: 'AU', latitude: '-36.39', longitude: '145.35' } },
    gameType: { name: 'Australian Rules', value: 'AFL' },
  },
  {
    id: 'gvl-2026-r4-06',
    status: 'FINAL',
    createdAt: '2026-04-25T00:00:00.000Z',
    updatedAt: '2026-04-25T18:00:00.000Z',
    association: { id: 'gvl-assoc', name: 'Goulburn Valley League', url: 'https://www.playhq.com', logo: { sizes: [] } },
    competition: { id: 'gvl-footy-2026', name: 'GVL Football 2026' },
    season: { id: 'gvl-2026-season', name: '2026', status: 'ACTIVE', url: 'https://www.playhq.com' },
    grade: { id: 'gvl-senior', name: 'Senior Football', url: 'https://www.playhq.com' },
    round: { id: 'round-4', name: 'Round 4' },
    schedule: { date: '2026-04-25', time: '14:00:00', timezone: 'Australia/Melbourne' },
    competitors: [
      { id: 'shepp-swans', name: 'Shepparton Swans', isHomeTeam: true, outcome: 'WON', scoreTotal: 68, scoreSubTotal: [{ type: 'TOTAL_GOALS', value: 10 }, { type: 'TOTAL_BEHINDS', value: 8 }] },
      { id: 'tatura', name: 'Tatura', isHomeTeam: false, outcome: 'LOST', scoreTotal: 42, scoreSubTotal: [{ type: 'TOTAL_GOALS', value: 6 }, { type: 'TOTAL_BEHINDS', value: 6 }] },
    ],
    venue: { id: 'shepp-swans-oval', name: 'Deakin Reserve', surfaceName: 'Main Oval', surfaceAbbreviation: 'OVL1', address: { line1: '', suburb: 'Shepparton', postcode: '3630', state: 'VIC', country: 'AU', latitude: '-36.38', longitude: '145.40' } },
    gameType: { name: 'Australian Rules', value: 'AFL' },
  },
];

// PlayHQ API client
export class PlayHQClient {
  private config: PlayHQConfig;
  private baseUrl = 'https://api.playhq.com';

  constructor(config: PlayHQConfig) {
    this.config = config;
  }

  // Public API - no JWT needed, just x-api-key + x-phq-tenant
  private async publicRequest<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: {
        'x-api-key': this.config.apiKey,
        'x-phq-tenant': this.config.tenant,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`PlayHQ API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Get games for a specific grade
  async getGamesForGrade(gradeId: string, cursor?: string): Promise<{ data: PlayHQGame[]; metadata: { hasMore: boolean; nextCursor?: string } }> {
    const query = cursor ? `?cursor=${encodeURIComponent(cursor)}` : '';
    return this.publicRequest(`/v1/grades/${gradeId}/games${query}`);
  }

  // Get game summary with player stats
  async getGameSummary(gameId: string): Promise<{ data: PlayHQGameSummary }> {
    return this.publicRequest(`/v1/games/${gameId}/summary`);
  }

  // Get all grades for a season
  async getGradesForSeason(seasonId: string): Promise<{ data: { id: string; name: string; competition: { id: string; name: string } }[] }> {
    return this.publicRequest(`/v1/seasons/${seasonId}/grades`);
  }
}

// Helper: Format AFL score (goals.behinds = total)
export function formatAFLScore(scoreTotal: number, scoreSubTotal: { type: string; value: number }[]): string {
  const goals = scoreSubTotal.find(s => s.type === 'TOTAL_GOALS')?.value ?? 0;
  const behinds = scoreSubTotal.find(s => s.type === 'TOTAL_BEHINDS')?.value ?? 0;
  return `${goals}.${behinds} (${scoreTotal})`;
}

// Helper: Get game status label
export function getGameStatusLabel(status: string): string {
  switch (status) {
    case 'UPCOMING': return 'Upcoming';
    case 'LIVE': return 'LIVE';
    case 'FINAL': return 'Full Time';
    default: return status;
  }
}

// Helper: Get team color
export function getTeamColor(teamName: string): string {
  const team = GVL_TEAMS.find(t => t.name.toLowerCase() === teamName.toLowerCase());
  return team?.color ?? '#8A9199';
}
