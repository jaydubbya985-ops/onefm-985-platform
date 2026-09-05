import fs from 'node:fs'
import path from 'path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { inspectAttr } from 'plugin-inspect-react-code'

/** Keep crawler OG on this SPA — WordPress does not host /assets/images from this build. */
function readPublicSiteOrigin() {
  const src = fs.readFileSync(path.resolve('src/lib/publicSite.ts'), 'utf8')
  const match = src.match(/export const PUBLIC_SITE_ORIGIN = '([^']+)'/)
  if (!match) throw new Error('inject-coverage-og: missing PUBLIC_SITE_ORIGIN in publicSite.ts')
  return match[1]
}

/** Read stationStats from pricing.ts so crawler OG stays on the same source as coverageCopy. */
function readStationStats() {
  const src = fs.readFileSync(path.resolve('src/data/pricing.ts'), 'utf8')
  const num = (key: string) => {
    const match = src.match(new RegExp(`${key}:\\s*(\\d+)`))
    if (!match) throw new Error(`inject-coverage-og: missing ${key} in stationStats`)
    return Number(match[1])
  }
  return {
    totalTowns: num('totalTowns'),
    broadcastPopulation: num('broadcastPopulation'),
    broadcastRadiusKm: num('broadcastRadiusKm'),
  }
}

/** Keep in sync with formatOgDescription / formatSeoDefault in coverageCopy.ts */
function injectCoverageOg() {
  const stationStats = readStationStats()
  const towns = `${stationStats.totalTowns} towns`
  const pop = stationStats.broadcastPopulation.toLocaleString('en-AU')
  const og = `Community radio from Shepparton, VIC. ${towns}. ${pop} people in the broadcast area.`
  const meta = `ONE FM 98.5 — The Voice of the Goulburn Valley. Volunteer-run community radio from Shepparton, Victoria. ${towns} · ${stationStats.broadcastRadiusKm}km radius (ABS 2021 via townData).`
  const siteOrigin = readPublicSiteOrigin()
  return {
    name: 'inject-coverage-og',
    transformIndexHtml(html: string) {
      if (
        !html.includes('__ONEFM_OG_DESCRIPTION__') ||
        !html.includes('__ONEFM_META_DESCRIPTION__') ||
        !html.includes('__ONEFM_SITE_ORIGIN__')
      ) {
        throw new Error('inject-coverage-og: index.html is missing coverage / SPA origin placeholders')
      }
      const out = html
        .replaceAll('__ONEFM_META_DESCRIPTION__', meta)
        .replaceAll('__ONEFM_OG_DESCRIPTION__', og)
        .replaceAll('__ONEFM_SITE_ORIGIN__', siteOrigin)
      if (out.includes('__ONEFM_')) {
        throw new Error('inject-coverage-og: placeholders remained after inject')
      }
      return out
    },
  }
}

/** Club logo dumps are not referenced by the app. Drop them so a phone deploy zip is small enough to upload. */
function omitUnusedClubLogos() {
  return {
    name: 'omit-unused-club-logos',
    closeBundle() {
      for (const dir of ['kdl', 'gvl']) {
        fs.rmSync(path.resolve('dist/assets/logos', dir), { recursive: true, force: true })
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  base: './',
  plugins: [
    react(),
    injectCoverageOg(),
    omitUnusedClubLogos(),
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
      // vendor-pdf (jspdf) is only reachable through ops invoice/proposal
      // routes — eagerly preloading it on every page forces all visitors to
      // download a chunk they may never need.
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
