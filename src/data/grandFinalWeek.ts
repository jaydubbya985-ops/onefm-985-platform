/**
 * GVL Grand Final Week 2026 — verified fixtures only.
 *
 * Sources (checked 14 Sep 2026):
 *  - Grand Final day Sunday 20 Sep 2026, Deakin Reserve, Shepparton — TryBooking event 1645877
 *    ("GVL 2026 Grand Final - Disabled Car Parking -incl gate entry", 8:30 AM – 6:00 PM) and
 *    Shepparton Adviser preliminary final preview (9 Sep 2026).
 *  - Senior Football: Echuca v Shepparton Bears — Shepparton News, 14 Sep 2026,
 *    "Gallery | Bears maul Bombers to advance to Goulburn Valley League grand final"
 *    (Bears won Sunday 13 Sep preliminary final v Kyabram).
 *  - Echuca's fourth GVL decider in five seasons — Shepparton News, 14 Sep 2026,
 *    "Murray Bombers into another grand final after Ky blitz".
 *  - A-grade netball: Euroa v Mooroopna — Shepparton Adviser (Euroa won the second
 *    semi-final) and Shepparton News, 14 Sep 2026, "Gallery | Mooroopna break prelim
 *    hoodoo to enter GVL grand final".
 *
 * NOT listed until verified: reserves and Under 18 grand final matchups
 * (preliminary-final winners unconfirmed at compile time), and any bounce times.
 */

export interface GrandFinalFixture {
  grade: string
  home: string
  away: string
  note?: string
}

export interface GrandFinalWeek {
  year: number
  title: string
  dateLabel: string
  venue: string
  dayLabel: string
  fixtures: GrandFinalFixture[]
  headlineNote: string
  sources: string[]
}

export const GRAND_FINAL_WEEK_2026: GrandFinalWeek = {
  year: 2026,
  title: 'GVL Grand Final 2026',
  dateLabel: 'Sunday 20 September 2026',
  venue: 'Deakin Reserve, Shepparton',
  dayLabel: 'Gates open 8:30 am — a full day of netball and football finals',
  fixtures: [
    {
      grade: 'Senior Football',
      home: 'Echuca',
      away: 'Shepparton Bears',
      note: "Echuca's fourth GVL decider in five seasons; the Bears booked their spot by beating Kyabram in Sunday's preliminary final.",
    },
    {
      grade: 'A-Grade Netball',
      home: 'Euroa',
      away: 'Mooroopna',
      note: 'Mooroopna broke through its preliminary-final hoodoo to set up the decider with Euroa.',
    },
  ],
  headlineNote: 'Grand final week in the Goulburn Valley — decided at Deakin Reserve.',
  sources: ['Shepparton News (14 Sep 2026)', 'Shepparton Adviser (9 Sep 2026)'],
}
