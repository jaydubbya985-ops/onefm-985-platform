/**
 * Story studio card must not label unlabeled faces as a presenter on air.
 * Named portraits: Di Hunter and Sally Nayler only.
 * Run: npx vite-node scripts/verify-story-desk.ts
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

function assert(cond: unknown, message: string) {
  if (!cond) {
    console.error(`verify-story-desk FAIL: ${message}`)
    process.exit(1)
  }
}

const story = readFileSync(resolve('src/pages/Story.tsx'), 'utf8')

assert(!story.includes('ONE FM presenter on air'), 'Story must not label an unlabeled still as a presenter on air')
assert(!story.includes('Where the magic happens'), 'Story must not ship leftover AI studio copy')
assert(!story.includes('src="/assets/images/studio-presenter-mic.jpg"'), 'Story studio card must not use the unlabeled commentary-box still')
assert(story.includes('src="/studio-control-room.jpg"'), 'Story studio card must sit on the Solidyne desk')
assert(
  story.includes('Solidyne desk, not a presenter portrait'),
  'Story studio alt must name the desk, not a host',
)
assert(
  story.includes('Named archive portraits: Di Hunter and Sally Nayler only'),
  'Story studio card must keep named portraits to Di Hunter and Sally Nayler',
)

console.log('verify-story-desk OK')
