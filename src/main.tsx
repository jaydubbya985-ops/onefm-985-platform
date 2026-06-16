import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { initSupabaseAuthRefresh, isSupabaseConfigured } from '@/lib/supabase'
import './index.css'
import App from './App.tsx'

if (isSupabaseConfigured()) {
  initSupabaseAuthRefresh()
}

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <HelmetProvider>
      <HashRouter>
        <App />
      </HashRouter>
    </HelmetProvider>
  </ErrorBoundary>,
)
