/**
 * Fail if ops realtime invents a live viewer count.
 * Run: npx vite-node scripts/verify-realtime-presence.ts
 */
import { deskPresenceLabel } from '../src/hooks/useRealtime'

function assert(cond: unknown, message: string) {
  if (!cond) {
    console.error(`verify-realtime-presence FAIL: ${message}`)
    process.exit(1)
  }
}

const demo = deskPresenceLabel({ live: false, isSubscribed: false, lastCompany: null })
const waiting = deskPresenceLabel({ live: true, isSubscribed: false, lastCompany: null })
const listening = deskPresenceLabel({ live: true, isSubscribed: true, lastCompany: null })
const named = deskPresenceLabel({ live: true, isSubscribed: true, lastCompany: 'FOOTT Waste Solutions' })

for (const line of [demo, waiting, listening, named]) {
  assert(!/viewer/i.test(line), `must not invent viewers: ${line}`)
  assert(!/\b[1-9]\s*online\b/i.test(line), `must not invent an online count: ${line}`)
}

assert(demo.includes('DEMO'), `demo label: ${demo}`)
assert(waiting.includes('not connected'), `waiting label: ${waiting}`)
assert(listening.includes('Presence is not counted'), `listening label: ${listening}`)
assert(named.includes('FOOTT Waste Solutions'), `named label: ${named}`)

console.log('verify-realtime-presence OK')
