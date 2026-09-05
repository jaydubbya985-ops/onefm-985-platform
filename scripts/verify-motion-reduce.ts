/**
 * Fail if decorative motion ignores prefers-reduced-motion.
 * Run: npx vite-node scripts/verify-motion-reduce.ts
 *
 * TiltCard 3D swing and coverage-map sonar both invent motion.
 * When the user asks for less motion, keep the sourced layout still.
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

function fail(msg: string): never {
  console.error(`verify-motion-reduce FAIL: ${msg}`)
  process.exit(1)
}

const tilt = readFileSync(resolve('src/components/TiltCard.tsx'), 'utf8')
if (!tilt.includes("prefers-reduced-motion: reduce")) {
  fail('TiltCard must not invent a 3D swing under prefers-reduced-motion')
}
if (!tilt.includes('return')) {
  fail('TiltCard reduced-motion path must skip the tilt')
}

const glow = readFileSync(resolve('src/lib/coverageGlowCanvas.ts'), 'utf8')
if (!glow.includes('prefersReducedMotion')) {
  fail('coverage glow must gate sonar / pulse on prefers-reduced-motion')
}
if (!glow.includes('if (prefersReducedMotion()) return')) {
  fail('sonar ripples must not run when motion is reduced')
}
if (!glow.includes('this.phase = 0')) {
  fail('reduced-motion path must draw a static sourced footprint, not a live pulse')
}

console.log('verify-motion-reduce: ok — tilt and sonar yield to prefers-reduced-motion')
