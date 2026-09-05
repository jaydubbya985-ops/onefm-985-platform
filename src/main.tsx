import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { initSupabaseFromRuntime } from '@/lib/supabase'
import { installInPageHash } from '@/lib/inPageHash'
import './index.css'
import App from './App.tsx'

installInPageHash()

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
