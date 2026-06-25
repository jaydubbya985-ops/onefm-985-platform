import path from 'path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { inspectAttr } from 'plugin-inspect-react-code'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  base: './',
  plugins: [
    react(),
    // Dev-only — strips from production bundle
    ...(mode === 'development' ? [inspectAttr()] : []),
  ],
  server: {
    port: 3000,
    proxy: {
      '/api/fm985': {
        target: 'https://fm985.com.au',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/fm985/, ''),
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'es2020',
    sourcemap: false,
    chunkSizeWarningLimit: 600,
    modulePreload: {
      // vendor-pdf (jspdf + html2canvas) is only reachable through the
      // lazy-loaded SalesProposal/ops invoice routes — eagerly preloading
      // it on every page forces all visitors to download 174KB gzip they
      // may never need.
      resolveDependencies: (_filename, deps) => deps.filter((d) => !d.includes('vendor-pdf')),
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Vite's dynamic-import preload helper is a virtual module (not under
          // node_modules) — left unassigned, Rollup's default heuristic dropped it
          // into vendor-pdf, forcing every page (which all use SOME dynamic import)
          // to load the 174KB-gzip PDF vendor chunk just for this helper. Pin it to
          // vendor-react, which every page already loads anyway.
          if (id.includes('vite/preload-helper')) return 'vendor-react'
          if (!id.includes('node_modules')) return
          if (id.includes('jspdf') || id.includes('html2canvas')) return 'vendor-pdf'
          if (id.includes('@supabase')) return 'vendor-supabase'
          if (id.includes('framer-motion')) return 'vendor-motion'
          if (id.includes('lucide-react')) return 'vendor-icons'
          if (id.includes('gsap')) return 'vendor-gsap'
          if (id.includes('react-router') || id.includes('@remix-run')) return 'vendor-router'
          if (id.includes('lenis')) return 'vendor-scroll'
          // recharts/d3 depend on react — keep them in the same chunk as
          // react/react-dom to avoid a vendor-react <-> vendor-charts circular
          // chunk, which crashes with "Cannot access 'X' before initialization"
          // in production (Rollup ESM live-binding ordering issue).
          if (id.includes('recharts') || id.includes('d3-') || id.includes('react-dom') || id.includes('react/')) return 'vendor-react'
        },
      },
    },
  },
}))
