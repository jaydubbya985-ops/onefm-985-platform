/**
 * LIVE #/ops load outcome — empty charts are not a successful zero week
 * when Supabase failed to return the ledger.
 */

export type OpsLoadKind = 'idle' | 'demo' | 'ok' | 'error'

export interface OpsLoadResult {
  table: string
  error?: string | null
}

export interface OpsLoadStatus {
  kind: OpsLoadKind
  failedTables: string[]
}

const IDLE: OpsLoadStatus = { kind: 'idle', failedTables: [] }

let current: OpsLoadStatus = IDLE

export function resetOpsLoadStatus(): void {
  current = IDLE
}

export function recordOpsLoad(status: OpsLoadStatus): void {
  current = status
}

export function getOpsLoadStatus(): OpsLoadStatus {
  return current
}

export function opsLoadFromResults(
  configured: boolean,
  results: OpsLoadResult[],
): OpsLoadStatus {
  if (!configured) return { kind: 'demo', failedTables: [] }
  const failedTables = results
    .filter((row) => Boolean(row.error))
    .map((row) => row.table)
  if (failedTables.length) return { kind: 'error', failedTables }
  return { kind: 'ok', failedTables: [] }
}

/** Chart empty-state when the live ledger request failed. Null = keep the DEMO-hidden note. */
export function opsLoadChartNote(status: OpsLoadStatus): string | null {
  if (status.kind !== 'error') return null
  return 'The live ledger did not load. This empty chart is not a zero week.'
}
