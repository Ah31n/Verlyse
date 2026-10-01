#!/usr/bin/env node
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

function findFiles(dir, exts = ['.tsx', '.jsx', '.ts', '.js']) {
  let files = []
  for (const item of readdirSync(dir)) {
    const p = join(dir, item)
    const st = statSync(p)
    if (st.isDirectory()) {
      if (item !== 'node_modules' && item !== '.git' && item !== 'dist') {
        files = files.concat(findFiles(p, exts))
      }
    } else if (exts.some(ext => item.endsWith(ext))) {
      files.push(p)
    }
  }
  return files
}

const files = findFiles('src')

const targetAttributes = [
  'string="parallax"',
  'string="spotlight"',
  'string="magnetic"',
  'string="progress"',
  'string="split"',
  'string="sequence"',
  'string="glide"',
  'string="lerp"',
  'string="masonry"',
  'string="tilt"',
  'string="marquee"',
  'string="impulse"',
  'string="lazy"',
  'string-id',
  'string-parallax',
  'string-factor',
  'string-strength',
  'string-radius',
  'string-cursor-target',
  'string-masonry-cols',
  'string-masonry-gap',
  'string-tilt-max',
]

const results = {}
for (const attr of targetAttributes) {
  results[attr] = []
}

for (const file of files) {
  // Exclude lab, test scripts, devtools
  if (file.includes('pages/Lab.tsx') || file.includes('StringTuneAdapter.tsx') || file.includes('StringTuneProvider.tsx') || file.includes('.d.ts')) {
    continue
  }
  const content = readFileSync(file, 'utf8')
  
  for (const attr of targetAttributes) {
    if (content.includes(attr)) {
      results[attr].push(file)
    }
  }
}

console.log('=== STRINGTUNE PRODUCTION CONSUMERS AUDIT ===')
for (const [attr, fileList] of Object.entries(results)) {
  console.log(`${attr.padEnd(26)} : ${fileList.length} consumers ${fileList.length ? '(' + fileList.map(f => f.replace('src/', '')).join(', ') + ')' : ''}`)
}
