export {}

declare global {
  interface Window {
    /** Optional Netlify snippet injection. Anon key is public by design. */
    __ONEFM_OPS__?: {
      url?: string
      anonKey?: string
    }
  }
}
