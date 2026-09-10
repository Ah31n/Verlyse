# Deploying Verlyse Media to InfinityFree

Production build: `npm run build` (runs `tsc -b && vite build` plus
`scripts/prerender-metadata.mjs`, which writes per-route metadata shells into
`dist/` — 50 shells covering every core route, department, folio, and creator
page). The deployable tree is `dist/`, published to the account's `/htdocs`.

## What must be on the server

- Contents of `dist/` **at the root of `/htdocs`** (no enclosing folder),
  including the dotfile `.htaccess`.
- `public/.htaccess` ships: `DirectoryIndex index.html`, an SPA fallback to
  `/index.html` for any path without a real file/directory (the router renders
  its own NotFound), immutable caching for hashed `/assets`, no-cache for
  HTML shells, deflate, and `Options -Indexes`.
- `robots.txt`, `sitemap.xml`, fonts, and `img/` are part of the build.

## Methods

**Online File Manager (no local software):** upload a zip of the `dist/`
tree (files at archive root) into `htdocs`, extract in place, confirm
`.htaccess` and `index.html` sit directly in `htdocs`, delete the zip.

**FTP (FileZilla):** host `ftpupload.net`, port `21`, explicit FTPS, passive
mode; enable "force showing hidden files" so `.htaccess` copies.

**Scripted:** `scripts/deploy-ftp.mjs` mirrors `dist/` → `/htdocs` with
`basic-ftp`. Credentials come only from the environment — never commit them:

```bash
FTP_HOST=ftpupload.net FTP_USER='if0_xxxxxxx' FTP_PASS='…' \
  node scripts/deploy-ftp.mjs --clean-assets
```

`--clean-assets` prunes stale hashed files under remote `/assets`; all other
remote files are left untouched.

## Network constraints

InfinityFree's FTP edge accepts TCP connections from datacenter IPs but never
returns the 220 banner (silent drop), so deploys must originate from a
residential/office network or the browser-based File Manager, which connects
server-side.

## Canonical origin

Prerender metadata, `index.html` OG/canonical tags, `robots.txt`, and
`sitemap.xml` use `https://verlysemedia.kesug.com`. Override at build time
with `PUBLIC_SITE_ORIGIN=https://… npm run build` if the domain changes.
Free SSL for the subdomain is issued via the control panel (SSL/TLS → Free
SSL); http serves until the certificate is provisioned.

## Smoke checks after deploy

1. `/` loads with the issue masthead and no host placeholder.
2. Hard refresh on `/article/their-voices-matter` and
   `/categories/social-issues` returns the page (fallback rule), not 404.
3. `/assets/*` JS chunks return 200 with long-cache headers.
4. `/sitemap.xml` and `/robots.txt` resolve and list the kesug origin.
