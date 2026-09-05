/**
 * Lock: Home/Listen interview strip names WordPress vs archive — not leftover “fresh”.
 * Run: npx vite-node scripts/verify-interviews-not-fresh.ts
 */
import { readFileSync } from 'node:fs'
import {
  interviewFeedEyebrow,
  interviewFeedIntro,
  type InterviewFeedSource,
} from '../src/lib/fm985Feed'

function assert(cond: unknown, message: string) {
  if (!cond) {
    console.error(`verify-interviews-not-fresh FAIL: ${message}`)
    process.exit(1)
  }
}

const live: InterviewFeedSource = 'wordpress'
const archive: InterviewFeedSource = 'station-archive'

assert(interviewFeedEyebrow(live) === 'FROM FM985.COM.AU', interviewFeedEyebrow(live))
assert(interviewFeedEyebrow(archive) === 'STATION ARCHIVE', interviewFeedEyebrow(archive))
assert(interviewFeedIntro(live).includes('fm985.com.au'), interviewFeedIntro(live))
assert(!interviewFeedIntro(archive).toLowerCase().includes('fresh'), interviewFeedIntro(archive))
assert(interviewFeedIntro(archive).includes('archive'), interviewFeedIntro(archive))
assert(interviewFeedIntro(archive).includes("not today's posts"), interviewFeedIntro(archive))

const ui = readFileSync(new URL('../src/components/LatestInterviews.tsx', import.meta.url), 'utf8')
assert(!/Fresh from ONE FM/.test(ui), 'LatestInterviews must not claim leftover Fresh from ONE FM')
assert(!ui.includes('LIVE &amp; LOCAL') && !ui.includes('LIVE & LOCAL'), 'archive strip must not leftover LIVE & LOCAL')
assert(ui.includes('fetchInterviewFeed'), 'LatestInterviews must use fetchInterviewFeed so the source is labelled')
assert(ui.includes('interviewFeedIntro'), 'intro must follow feed source')

const feed = readFileSync(new URL('../src/lib/fm985Feed.ts', import.meta.url), 'utf8')
assert(feed.includes('export async function fetchLatestInterviews'), 'SoundCloudPanel still needs the array wrapper')
assert(feed.includes("source: 'station-archive'"), 'WP miss must label station-archive, not pretend it synced')

console.log('verify-interviews-not-fresh: interview strip names WordPress or the archive, not leftover fresh.')
