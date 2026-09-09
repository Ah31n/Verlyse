#!/usr/bin/env node
// Quick single-shot capture for phase31b iteration.
// Usage: node audit/phase31b-shot.mjs <route|path> <1440|768|390|reduced> [--out file.png] [--reduced]
import puppeteer from 'puppeteer';
import { existsSync } from 'node:fs';
import path from 'node:path';

const [routeArg, viewportArg, ...rest] = process.argv.slice(2);
const reduce = rest.includes('--reduced');
const outIdx = rest.indexOf('--out');
const outArg = outIdx >= 0 ? rest[outIdx + 1] : null;

const viewports = {
  '1440': { width: 1440, height: 900 },
  '768': { width: 768, height: 1024 },
  '390': { width: 390, height: 844 },
  reduced: { width: 1440, height: 900 },
};

const route = routeArg === 'reduced' ? '/entries/1440' : routeArg;
const vp = viewports[viewportArg];
const base = 'http://localhost:5173';

const browser = await puppeteer.launch({
  headless: 'new',
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
});
try {
  const page = await browser.newPage();
  await page.setViewport(vp);
  if (reduce || routeArg === 'reduced') {
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  }
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('requestfailed', (r) => errors.push(`REQFAIL ${r.url()} ${r.failure()?.errorText ?? ''}`));
  await page.goto(base + route, { waitUntil: 'load', timeout: 60000 });
  await new Promise((r) => setTimeout(r, 8000)); // settle (lazy routes 4.2-7s)
  const target = outArg ?? (outIdx >= 0 ? outArg : null);
  const out = target ?? `audit/shots/phase31b/iter-${routeArg.replace(/\//g, '_')}-${viewportArg}${reduce ? '-reduced' : ''}.png`;
  await page.screenshot({ path: out });
  const info = await page.evaluate(() => {
    const h1 = document.querySelector('h1');
    return {
      h1: h1 ? h1.textContent.trim() : null,
      h1count: document.querySelectorAll('h1').length,
      scrollW: document.documentElement.scrollWidth,
      innerW: window.innerWidth,
      title: document.title,
    };
  });
  console.log(JSON.stringify({ out, errors, info }, null, 2));
} finally {
  await browser.close();
}
