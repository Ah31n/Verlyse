import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * Build config.
 *
 * NOTE on bundling: this project historically shipped a SINGLE JS file
 * (`inlineDynamicImports: true`) because the free InfinityFree host runs
 * HTTP/1.1 where many round-trips are slow. That holds for the ~450 KB
 * publication shell. The spatial layer (three + @react-three/fiber) now adds
 * ~1.2 MB, which would make a single file far slower than a few parallel
 * HTTP/2 requests. So for this build we code-split:
 *   - `three` loads on demand, only where a spatial scene renders.
 *   - react/react-dom and framer-motion go into a stable vendor chunk.
 *   - route pages stay as their own lazy chunks.
 * The initial HTML + index chunk stays small; heavy 3D pulls in only when
 * needed. If the host ever reverts to single-file serving, remove the
 * manualChunks block and re-measure.
 */
export default defineConfig({
  plugins: [react()],
  // Allow the platform's live-preview host (a sandboxed proxy origin) to reach
  // the dev server. This is development-only and does not affect production.
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: ['.e2b.app'],
  },
  build: {
    target: 'es2020',
    cssMinify: true,
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Keep the spatial engine in its own chunk so it never loads on
          // routes that have no scene (About, Categories, forms, etc.).
          if (id.includes('node_modules/three')) return 'three'
          if (id.includes('node_modules/@react-three')) return 'three'
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/scheduler')) return 'react'
          if (id.includes('node_modules/framer-motion')) return 'motion'
          if (id.includes('node_modules/react-router')) return 'router'
        },
      },
    },
  },
})
