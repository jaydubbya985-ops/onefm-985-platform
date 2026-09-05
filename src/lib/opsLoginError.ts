/**
 * LIVE #/ops staff sign-in. A fetch miss is not a wrong password.
 */

export function opsLoginFailureNote(err: unknown): string {
  const message = err instanceof Error ? err.message : String(err ?? '')
  const status =
    typeof err === 'object' && err && 'status' in err
      ? Number((err as { status?: number }).status)
      : undefined

  if (
    status === 0 ||
    /failed to fetch|networkerror|network request failed|load failed|aborterror|timeout/i.test(
      message,
    )
  ) {
    return 'Could not reach sign-in. This is not a wrong password.'
  }

  return 'Invalid email or password.'
}
