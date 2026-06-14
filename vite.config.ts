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
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          if (id.includes('jspdf') || id.includes('html2canvas')) return 'vendor-pdf'
          if (id.includes('@supabase')) return 'vendor-supabase'
          if (id.includes('framer-motion')) return 'vendor-motion'
          if (id.includes('lucide-react')) return 'vendor-icons'
        },
      },
    },
  },
}))
