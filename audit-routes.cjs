const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const screenshotsDir = '/home/user/workspace_extracted/verlyse-project/audit/screenshots-live';
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/chromium',
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--window-size=1440,900',
    ],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

  // Track console messages
  const consoleMessages = [];
  page.on('console', msg => {
    if (msg.type() === 'error' || msg.type() === 'warning') {
      consoleMessages.push({ type: msg.type(), text: msg.text().substring(0, 200) });
    }
  });

  // Track failed requests
  const failedRequests = [];
  page.on('response', response => {
    if (response.status() >= 400) {
      failedRequests.push({ status: response.status(), url: response.url().substring(0, 200) });
    }
  });

  const routes = [
    { path: '/', name: 'home' },
    { path: '/about', name: 'about' },
    { path: '/articles', name: 'articles' },
    { path: '/article/their-voices-matter', name: 'article-tvm' },
    { path: '/article/3-13', name: 'article-313' },
    { path: '/categories', name: 'categories' },
    { path: '/community', name: 'community' },
    { path: '/creators', name: 'creators' },
    { path: '/submit', name: 'submit' },
    { path: '/contact', name: 'contact' },
    { path: '/ambassadors', name: 'ambassadors' },
    { path: '/creator/alina-javed', name: 'creator-alina' },
  ];

  const results = [];

  for (const route of routes) {
    consoleMessages.length = 0;
    failedRequests.length = 0;

    try {
      await page.goto(`http://localhost:5173${route.path}`, {
        waitUntil: 'networkidle2',
        timeout: 30000,
      });

      // Wait for content to render
      await new Promise(r => setTimeout(r, 2000));

      // Get page title
      const title = await page.title();

      // Check for h1
      const h1 = await page.evaluate(() => {
        const h1s = document.querySelectorAll('h1');
        return Array.from(h1s).map(h => h.textContent?.trim().substring(0, 80));
      });

      // Check for main content
      const mainExists = await page.evaluate(() => {
        return document.querySelector('main') !== null;
      });

      // Check for skip link
      const skipLink = await page.evaluate(() => {
        return document.querySelector('.skip-link') !== null;
      });

      // Check for header
      const header = await page.evaluate(() => {
        return document.querySelector('header') !== null;
      });

      // Check for footer
      const footer = await page.evaluate(() => {
        return document.querySelector('footer') !== null;
      });

      // Check for console errors
      const errors = consoleMessages.filter(m => m.type === 'error');

      // Take screenshot
      await page.screenshot({
        path: path.join(screenshotsDir, `${route.name}-desktop.png`),
        fullPage: false,
      });

      results.push({
        route: route.path,
        name: route.name,
        status: 'PASS',
        title: title.substring(0, 80),
        h1: h1,
        mainExists,
        skipLink,
        header,
        footer,
        consoleErrors: errors.length,
        failedRequests: failedRequests.length,
      });

      console.log(`✅ ${route.path} → PASS (title: "${title.substring(0, 60)}", h1: ${h1.length}, errors: ${errors.length})`);

    } catch (err) {
      results.push({
        route: route.path,
        name: route.name,
        status: 'FAIL',
        error: err.message.substring(0, 200),
      });
      console.log(`❌ ${route.path} → FAIL: ${err.message.substring(0, 100)}`);
    }
  }

  // Summary
  console.log('\n=== ROUTE AUDIT SUMMARY ===');
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  console.log(`Passed: ${passed}/${results.length}`);
  console.log(`Failed: ${failed}/${results.length}`);

  // Console errors across all routes
  const allConsoleErrors = results.filter(r => r.consoleErrors > 0);
  if (allConsoleErrors.length > 0) {
    console.log('\nRoutes with console errors:');
    for (const r of allConsoleErrors) {
      console.log(`  ${r.route}: ${r.consoleErrors} errors`);
    }
  }

  // Save results
  fs.writeFileSync(
    path.join(screenshotsDir, 'route-audit-results.json'),
    JSON.stringify(results, null, 2)
  );

  await browser.close();
  console.log('\nDone. Screenshots saved to:', screenshotsDir);
})();
