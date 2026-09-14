import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { initSupabaseFromRuntime } from '@/lib/supabase'
import './index.css'
import App from './App.tsx'

// A deploy renames Vite's hashed chunks; a browser holding yesterday's app
// shell then fails to lazy-load routes ("Failed to fetch dynamically imported
// module"). Vite signals this as `vite:preloadError` — reload once to pick up
// the fresh shell instead of showing an error page. Session-flagged so a
// genuinely broken deploy can't cause a reload loop.
const CHUNK_RELOAD_FLAG = 'onefm_chunk_reload'
window.addEventListener('vite:preloadError', (event) => {
  if (sessionStorage.getItem(CHUNK_RELOAD_FLAG)) return
  sessionStorage.setItem(CHUNK_RELOAD_FLAG, '1')
  event.preventDefault()
  window.location.reload()
})
// If the app runs cleanly for 15s the shell is current — re-arm the guard so
// a deploy that happens later in this session can also self-heal.
window.setTimeout(() => sessionStorage.removeItem(CHUNK_RELOAD_FLAG), 15000)

const root = document.getElementById('root')!

void initSupabaseFromRuntime().finally(() => {
  createRoot(root).render(
    <ErrorBoundary>
      <HelmetProvider>
        <HashRouter>
          <App />
        </HashRouter>
      </HelmetProvider>
    </ErrorBoundary>,
  )
})
