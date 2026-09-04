/**
 * App still mounts this from the root. It used to sweep a 2px bar to 100%
 * on a 900ms timer on every hash change — leftover chrome, not a load.
 * Lazy routes already paint SkeletonLoader. Do not invent progress.
 */
export function RouteProgressBar() {
  return null
}
