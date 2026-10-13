/**
 * Build-time access to the canonical route registry.
 *
 * `src/data/routes.ts` imports `src/data/content.ts`, so the old trick of
 * transpiling a single self-contained file with `ts.transpileModule` no longer
 * works — the relative import would dangle. Vite's SSR build is used instead,
 * which is the same mechanism `scripts/ssr-smoke.mjs` already relies on, so
 * the build scripts and the application resolve modules identically.
 *
 * Every generator (prerender, sitemap, route audit) reads through here. There
 * is deliberately no second copy of the route list anywhere in scripts/.
 */
import { build } from 'vite'
import { mkdir, rm, writeFile } from 'node:fs/promises'
import { pathToFileURL } from 'node:url'
import { join } from 'node:path'

const OUT_DIR = join(process.cwd(), '.registry-build')
const ENTRY = join(OUT_DIR, 'entry.ts')

/**
 * @param {string} [origin] canonical origin; defaults to the registry's own.
 * @returns {Promise<{ routes: any[], patterns: Record<string,string>, canonicalUrl: (p: string, o?: string) => string }>}
 */
export async function loadRouteRegistry(origin) {
  await mkdir(OUT_DIR, { recursive: true })
  await writeFile(
    ENTRY,
    `export { buildRouteRegistry, ROUTE_PATTERNS, canonicalUrl, DEFAULT_ORIGIN } from '${join(process.cwd(), 'src/data/routes.ts').replace(/\\/g, '/')}'\n`,
  )

  await build({
    configFile: false,
    logLevel: 'silent',
    build: {
      ssr: ENTRY,
      outDir: OUT_DIR,
      emptyOutDir: false,
      rollupOptions: { output: { entryFileNames: 'registry.mjs' } },
    },
  })

  const mod = await import(`${pathToFileURL(join(OUT_DIR, 'registry.mjs')).href}?${Date.now()}`)
  const resolved = origin || mod.DEFAULT_ORIGIN
  const result = {
    routes: mod.buildRouteRegistry(resolved),
    patterns: mod.ROUTE_PATTERNS,
    canonicalUrl: (p, o = resolved) => mod.canonicalUrl(p, o),
    origin: resolved,
  }

  await rm(OUT_DIR, { recursive: true, force: true })
  return result
}
