#!/usr/bin/env node
/**
 * Security hygiene check. It reports filenames and safe locations only; it
 * never prints matched secret content.
 */
import { readdir, readFile } from 'node:fs/promises'
import { join, relative } from 'node:path'
import { existsSync } from 'node:fs'

const root = process.cwd()
const ignoredDirs = new Set(['.git', 'node_modules', 'dist', 'coverage', '.cache', '.arena', '.vercel'])
const safeFiles = new Set(['.env.example', 'scripts/check-secrets.mjs'])
const sensitiveName = /(^|\/)(\.env(\..*)?|.*(\.mcp|mcp\.json|oauth|credential|secret|token|cookie|login data|session|pk[i]|private).*)$/i
const secretPatterns = [
  /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/,
  /(?:sk|pk|rk|cmp)_live_[A-Za-z0-9_-]{16,}/,
  /(?:api[_-]?key|access[_-]?token|client[_-]?secret|password)\s*[:=]\s*["'][^"']{16,}["']/i,
  /AKIA[0-9A-Z]{16}/,
]
const textExtensions = new Set(['.js', '.mjs', '.ts', '.tsx', '.json', '.css', '.html', '.md', '.yml', '.yaml', '.toml', '.txt', '.sh', '.py'])
const findings = []

async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name)
    const rel = relative(root, path).replaceAll('\\', '/')
    if (entry.isDirectory()) {
      if (!ignoredDirs.has(entry.name)) await walk(path)
      continue
    }
    if (!safeFiles.has(rel) && sensitiveName.test(rel)) findings.push(`sensitive filename: ${rel}`)
    const ext = rel.slice(rel.lastIndexOf('.')).toLowerCase()
    if (!textExtensions.has(ext) || safeFiles.has(rel)) continue
    const text = await readFile(path, 'utf8').catch(() => '')
    for (const pattern of secretPatterns) {
      if (pattern.test(text)) {
        findings.push(`secret-like pattern: ${rel}`)
        break
      }
    }
  }
}

if (!existsSync(root)) process.exit(1)
await walk(root)
if (findings.length) {
  console.error(`Security check failed with ${findings.length} finding(s):`)
  for (const finding of findings) console.error(`- ${finding}`)
  process.exit(1)
}
console.log('Security check passed: no sensitive filenames or obvious secret patterns found.')
