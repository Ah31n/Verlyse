#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * Deploy the built `dist/` tree to InfinityFree over FTP.
 *
 * Credentials are read from the environment and never written to the repo:
 *   FTP_HOST  — default ftpupload.net (InfinityFree's shared FTP host)
 *   FTP_USER  — e.g. if0_12345678
 *   FTP_PASS  — the FTP account password
 *   FTP_DIR   — remote web root, default /htdocs
 *
 * The upload is non-destructive to anything that is not a hashed build
 * artifact: every local file is mirrored into FTP_DIR, and stale files under
 * the hashed /assets directory are pruned (their names are content hashes, so
 * anything missing locally is dead). Everything else on the account is left
 * untouched. Pass --clean-assets to enable pruning; the default is upload-only.
 *
 * Explicit FTPS is tried first and plain FTP is used as a fallback (free
 * InfinityFree accounts vary in TLS support).
 */
import { Client } from 'basic-ftp'
import * as fs from 'node:fs'
import * as path from 'node:path'

const HOST = process.env.FTP_HOST || 'ftpupload.net'
const USER = process.env.FTP_USER
const PASS = process.env.FTP_PASS
const REMOTE = process.env.FTP_DIR || '/htdocs'
const LOCAL = path.resolve(process.cwd(), 'dist')
const PRUNE = process.argv.includes('--clean-assets')

if (!USER || !PASS) {
  console.error('FTP_USER and FTP_PASS must be set in the environment.')
  process.exit(2)
}
if (!fs.existsSync(path.join(LOCAL, 'index.html'))) {
  console.error('dist/index.html missing — run the production build first.')
  process.exit(2)
}

async function connect() {
  const client = new Client(0)
  client.ftp.verbose = false
  for (const secure of [true, false]) {
    try {
      await client.access({ host: HOST, port: 21, user: USER, password: PASS, secure, passive: true })
      console.log(`Connected to ${HOST} (${secure ? 'FTPS explicit' : 'plain FTP'}).`)
      return client
    } catch (err) {
      console.log(`  ${secure ? 'FTPS' : 'FTP'} connect failed: ${String(err.message || err).split('\n')[0]}`)
      client.close()
    }
  }
  throw new Error('Could not log in over FTPS or FTP — check host, username and password.')
}

/** Recursive file listing of a remote directory (relative paths, posix). */
async function walk(client, dir, prefix = '') {
  const out = []
  let entries = []
  try { entries = await client.list(dir) } catch { return out }
  for (const e of entries) {
    if (e.name === '.' || e.name === '..') continue
    const rel = prefix ? `${prefix}/${e.name}` : e.name
    if (e.isDirectory) {
      out.push(...await walk(client, `${dir}/${e.name}`.replace(/\/+/g, '/'), rel))
    } else if (e.isFile) {
      out.push({ rel, size: e.size })
    }
  }
  return out
}

function localFiles(dir, prefix = '') {
  const out = []
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name)
    const rel = prefix ? `${prefix}/${name}` : name
    if (fs.statSync(full).isDirectory()) out.push(...localFiles(full, rel))
    else out.push({ rel, full, size: fs.statSync(full).size })
  }
  return out
}

const run = async () => {
  const client = await connect()
  try {
    // Ensure web root exists.
    for (const part of REMOTE.split('/').filter(Boolean)) {
      try { await client.ensureDir(part) } catch {}
    }
    await client.cd(REMOTE).catch(() => { throw new Error(`Remote dir ${REMOTE} not found.`) })

    const before = await walk(client, '.')
    console.log(`Remote ${REMOTE}: ${before.length} existing files.`)

    const files = localFiles(LOCAL)
    console.log(`Local dist: ${files.length} files to mirror.`)
    let uploaded = 0
    for (const f of files) {
      const remotePath = `/${f.rel}`
      await client.uploadFrom(f.full, remotePath)
      uploaded += 1
      if (uploaded % 10 === 0 || uploaded === files.length) process.stdout.write(`\r  uploaded ${uploaded}/${files.length}`)
    }
    process.stdout.write('\n')

    let pruned = 0
    if (PRUNE) {
      const localSet = new Set(files.map((f) => f.rel))
      for (const e of before) {
        if (!e.rel.startsWith('assets/')) continue
        if (!localSet.has(e.rel)) {
          await client.remove(`/${e.rel}`)
          pruned += 1
        }
      }
    }
    // Post-upload sanity: index.html present remotely.
    await client.cd(REMOTE)
    const root = await client.list('.')
    const hasIndex = root.some((e) => e.isFile && e.name === 'index.html')
    const hasHtaccess = root.some((e) => e.isFile && e.name === '.htaccess')
    console.log(`Uploaded ${uploaded} files${pruned ? `, pruned ${pruned} stale asset files` : ''}.`)
    console.log(`Checks: index.html ${hasIndex ? 'OK' : 'MISSING'}, .htaccess ${hasHtaccess ? 'OK' : 'MISSING'}.`)
    if (!hasIndex) process.exitCode = 1
  } finally {
    client.close()
  }
}

run().catch((err) => { console.error('Deploy failed:', err); process.exit(1) })
