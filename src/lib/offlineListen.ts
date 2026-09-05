/**
 * Browser connectivity for the public listener surface.
 * Does not claim the transmitter is up. Does not invent a live-now count.
 */
export const OFFLINE_LISTEN_COPY =
  'You’re offline. 98.5 FM is still on the dial in Shepparton and the Goulburn Murray. The live stream needs a connection.'

export function subscribeOffline(onChange: (offline: boolean) => void): () => void {
  if (typeof window === 'undefined') return () => {}

  const emit = () => onChange(window.navigator.onLine === false)
  emit()
  window.addEventListener('offline', emit)
  window.addEventListener('online', emit)
  return () => {
    window.removeEventListener('offline', emit)
    window.removeEventListener('online', emit)
  }
}
