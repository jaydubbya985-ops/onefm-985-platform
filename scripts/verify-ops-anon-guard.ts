/**
 * Prove ops-config never publishes a service_role JWT to the browser.
 * Run: npx vite-node scripts/verify-ops-anon-guard.ts
 */
import { readFileSync } from 'node:fs'
import type { HandlerEvent } from '@netlify/functions'
import { handler } from '../netlify/functions/ops-config.ts'
import { isBrowserSafeAnonKey } from '../src/lib/opsAnonGuard.ts'
import { isValidSupabaseKey, resolveOpsConfig } from '../src/lib/opsConfigResolve.ts'

const fail: string[] = []

function assert(cond: boolean, msg: string) {
  if (!cond) fail.push(msg)
}

function jwtWithRole(role: string | undefined): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url')
  const payload = Buffer.from(
    JSON.stringify(role === undefined ? { iss: 'supabase', ref: 'example' } : { iss: 'supabase', ref: 'example', role }),
  ).toString('base64url')
  return `${header}.${payload}.fakesig`
}

const anonJwt = jwtWithRole('anon')
const serviceJwt = jwtWithRole('service_role')
const adminJwt = jwtWithRole('supabase_admin')
const noRoleJwt = jwtWithRole(undefined)

assert(isBrowserSafeAnonKey(anonJwt), 'legacy anon JWT must stay publishable')
assert(isBrowserSafeAnonKey('sb_publishable_testkey_not_real'), 'publishable key must stay publishable')
assert(!isBrowserSafeAnonKey(serviceJwt), 'service_role JWT must not leave the function')
assert(!isBrowserSafeAnonKey(adminJwt), 'supabase_admin JWT must not leave the function')
assert(!isBrowserSafeAnonKey(noRoleJwt), 'JWT without role must not leave the function')
assert(!isBrowserSafeAnonKey('sb_secret_not_for_the_browser'), 'sb_secret_ must not leave the function')
assert(!isBrowserSafeAnonKey(''), 'empty key must not leave the function')

// Document the leftover: resolveOpsConfig still treats any eyJ as LIVE.
assert(isValidSupabaseKey(serviceJwt), 'leftover: resolveOpsConfig still accepts service_role JWT shape')
const leaked = resolveOpsConfig({
  VITE_SUPABASE_URL: 'https://example.supabase.co',
  VITE_SUPABASE_ANON_KEY: serviceJwt,
})
assert(leaked.configured === true, 'leftover: resolveOpsConfig would mark service_role as LIVE')
assert(
  leaked.configured && !isBrowserSafeAnonKey(leaked.anonKey),
  'ops-config must drop a resolveOpsConfig LIVE result that is a service_role JWT',
)

const fnSource = readFileSync(new URL('../netlify/functions/ops-config.ts', import.meta.url), 'utf8')
assert(fnSource.includes('isBrowserSafeAnonKey'), 'ops-config must call isBrowserSafeAnonKey')
assert(fnSource.includes('opsAnonGuard'), 'ops-config must import opsAnonGuard')
assert(
  fnSource.includes('configured: false'),
  'ops-config must stay DEMO when the key is not browser-safe',
)
assert(
  !fnSource.includes('service_role') || fnSource.includes('isBrowserSafeAnonKey'),
  'ops-config must not mention service_role without the guard',
)

const ENV_KEYS = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
] as const

async function invokeOpsConfig(env: Record<string, string>): Promise<{ configured?: boolean; anonKey?: string }> {
  const prior: Record<string, string | undefined> = {}
  for (const key of ENV_KEYS) {
    prior[key] = process.env[key]
    delete process.env[key]
  }
  Object.assign(process.env, env)
  try {
    const res = await handler({ httpMethod: 'GET' } as HandlerEvent, {} as never)
    return JSON.parse(res.body ?? '{}') as { configured?: boolean; anonKey?: string }
  } finally {
    for (const key of ENV_KEYS) {
      if (prior[key] === undefined) delete process.env[key]
      else process.env[key] = prior[key]
    }
  }
}

const serviceBody = await invokeOpsConfig({
  SUPABASE_URL: 'https://example.supabase.co',
  SUPABASE_ANON_KEY: serviceJwt,
})
assert(serviceBody.configured === false, 'handler must stay DEMO for a service_role JWT')
assert(!serviceBody.anonKey, 'handler must not return the service_role JWT')
assert(!JSON.stringify(serviceBody).includes(serviceJwt), 'handler body must not contain the service_role JWT')

const adminBody = await invokeOpsConfig({
  SUPABASE_URL: 'https://example.supabase.co',
  SUPABASE_ANON_KEY: adminJwt,
})
assert(adminBody.configured === false, 'handler must stay DEMO for a supabase_admin JWT')
assert(!adminBody.anonKey, 'handler must not return the supabase_admin JWT')

const anonBody = await invokeOpsConfig({
  SUPABASE_URL: 'https://example.supabase.co',
  SUPABASE_ANON_KEY: anonJwt,
})
assert(anonBody.configured === true, 'handler must stay LIVE for a real anon JWT')
assert(anonBody.anonKey === anonJwt, 'handler may publish the anon JWT')

const publishableBody = await invokeOpsConfig({
  VITE_SUPABASE_URL: 'https://example.supabase.co',
  VITE_SUPABASE_ANON_KEY: 'sb_publishable_testkey_not_real',
})
assert(publishableBody.configured === true, 'handler must stay LIVE for sb_publishable_')
assert(publishableBody.anonKey === 'sb_publishable_testkey_not_real', 'handler may publish sb_publishable_')

if (fail.length) {
  console.error('verify-ops-anon-guard FAILED')
  for (const msg of fail) console.error(' -', msg)
  process.exit(1)
}

console.log('verify-ops-anon-guard OK')
console.log('  anon JWT publishable')
console.log('  service_role JWT held at the function')
console.log('  supabase_admin JWT held at the function')
console.log('  sb_publishable_ still LIVE')
console.log('  GET handler DEMO for service_role (no key in body)')
console.log('  GET handler LIVE for anon JWT')
console.log('  GET handler LIVE for sb_publishable_')
