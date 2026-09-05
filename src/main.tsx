import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { initSupabaseFromRuntime } from '@/lib/supabase'
import { hoistPasswordResetPath } from '@/lib/authUrls'
import './index.css'
import App from './App.tsx'

hoistPasswordResetPath()

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
