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
 *   - `three` + `@react-three/fiber` load on demand, only where a spatial
 *     scene renders.
 *   - react / react-dom / scheduler AND react-router share one stable vendor
 *     chunk (see the note in manualChunks — this is deliberate, not a bug).
 *   - `motion` (the v13 package, which resolves through framer-motion
 *     internally) gets its own chunk.
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
          // Order matters: these are substring tests, so the most specific
          // package paths must be matched before the broader ones.

          // Keep the spatial engine in its own chunk so it never loads on
          // routes that have no scene (About, Categories, forms, etc.).
          if (id.includes('node_modules/@react-three')) return 'three'
          if (id.includes('node_modules/three')) return 'three'

          // `motion` v13 is the current package name; it pulls framer-motion
          // in as its implementation, so both specifiers are matched. Testing
          // only for framer-motion used to be correct and no longer is.
          if (id.includes('node_modules/framer-motion')) return 'motion'
          if (id.includes('node_modules/motion')) return 'motion'

          // react-router-dom's path CONTAINS 'node_modules/react', so it must
          // be claimed before the react test or it silently lands in the react
          // chunk. It is small and always needed, so it deliberately ships in
          // the same vendor chunk — named here so the intent is explicit
          // rather than accidental.
          if (id.includes('node_modules/react-router')) return 'react'
          if (
            id.includes('node_modules/react') ||
            id.includes('node_modules/react-dom') ||
            id.includes('node_modules/scheduler')
          ) {
            return 'react'
          }
        },
      },
    },
  },
})
