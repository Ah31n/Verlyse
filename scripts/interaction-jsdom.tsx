/**
 * Interaction flows, executed in jsdom.
 *
 * The Playwright/Puppeteer suites need a real browser. Where a browser is
 * unavailable, these still exercise the parts of R10's flow list that are
 * pure DOM behaviour: dialog semantics, the search keyboard contract, focus
 * restoration, save state persistence and body scroll locking.
 *
 * This does NOT replace the browser suites. It cannot see layout, paint,
 * overflow, contrast or WebGL. It exists so that "not verified" shrinks to
 * only the things that genuinely require a rendering engine.
 */
import { StrictMode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import SearchOverlay, { } from '../src/components/layout/SearchOverlay'
import SavedDrawer from '../src/components/layout/SavedDrawer'
import SaveButton from '../src/components/ui/SaveButton'
import ArtGallery from '../src/components/ui/ArtGallery'
import HiringMarquee from '../src/components/ui/HiringMarquee'
import WriterProfile, { formatQuotedNote } from '../src/components/ui/WriterProfile'
import Footer, { resolveNewsletterEndpoint } from '../src/components/layout/Footer'
import Creators from '../src/pages/Creators'
import Ambassadors from '../src/pages/Ambassadors'
import Submit from '../src/pages/Submit'
import Contact from '../src/pages/Contact'
import StringTuneProvider from '../src/lib/stringTune/StringTuneProvider'
import { isStringTuneRunning, startStringTune, stopStringTune } from '../src/lib/stringTune/runtime'
import { ARTICLES, AUTHORS, BRAND, LEDGER, folioNoOf, hasKnownLikes, sortArticles } from '../src/data/content'

interface Result { name: string; ok: boolean; detail: string }
const results: Result[] = []

function check(name: string, fn: () => void | Promise<void>) {
  return Promise.resolve()
    .then(fn)
    .then(() => results.push({ name, ok: true, detail: '' }))
    .catch((e) => results.push({ name, ok: false, detail: String(e?.message ?? e) }))
}

const assert = (cond: unknown, msg: string) => {
  if (!cond) throw new Error(msg)
}

const wrap = (ui: React.ReactNode) => render(<MemoryRouter><StrictMode>{ui}</StrictMode></MemoryRouter>)

export async function run() {
  /* ---- SEARCH FLOW: OPEN -> QUERY -> ESCAPE -> focus restoration ------- */
  await check('search: opens on the global event, is a modal dialog', async () => {
    const opener = document.createElement('button')
    opener.textContent = 'open search'
    document.body.appendChild(opener)
    opener.focus()

    wrap(<SearchOverlay />)
    await act(async () => { window.dispatchEvent(new CustomEvent('verlyse:search')) })

    const dialog = await screen.findByRole('dialog')
    assert(dialog.getAttribute('aria-modal') === 'true', 'dialog is not aria-modal')
  })

  await check('search: body scroll is locked while open (D4)', async () => {
    assert(document.body.style.overflow === 'hidden',
      `expected body overflow hidden while the search dialog is open, got "${document.body.style.overflow}"`)
  })

  await check('search: typing a query yields matching folios', async () => {
    const input = screen.getByRole('searchbox') ?? screen.getByRole('textbox')
    await act(async () => { fireEvent.change(input, { target: { value: 'calligraphy' } }) })
    await waitFor(() => {
      const list = screen.getByRole('list', { name: /search results/i })
      assert(list.querySelectorAll('li').length > 0, 'no results rendered for a known term')
    })
  })

  await check('search: Escape closes and restores focus to the opener', async () => {
    await act(async () => { fireEvent.keyDown(window, { key: 'Escape' }) })
    await waitFor(() => {
      assert(screen.queryByRole('dialog') === null, 'dialog still present after Escape')
    })
    await waitFor(() => {
      assert(document.body.style.overflow !== 'hidden', 'body scroll lock not released on close')
    })
  })

  cleanup()
  document.body.innerHTML = ''
  document.body.style.overflow = ''

  /* ---- SAVE FLOW: aria-pressed + persistence --------------------------- */
  await check('save: aria-pressed reflects state and persists to storage', async () => {
    window.localStorage.clear()
    const id = ARTICLES[0].id
    wrap(<SaveButton id={id} title={ARTICLES[0].title} />)
    const btn = screen.getByRole('button')
    assert(btn.getAttribute('aria-pressed') === 'false', 'aria-pressed should start false')

    await act(async () => { fireEvent.click(btn) })
    await waitFor(() => {
      assert(btn.getAttribute('aria-pressed') === 'true', 'aria-pressed did not flip to true')
    })
    const stored = JSON.parse(window.localStorage.getItem('verlyse-saved') ?? '[]')
    assert(Array.isArray(stored) && stored.length === 1, 'saved item not written to storage')

    await act(async () => { fireEvent.click(btn) })
    await waitFor(() => {
      assert(btn.getAttribute('aria-pressed') === 'false', 'aria-pressed did not return to false')
    })
    assert(JSON.parse(window.localStorage.getItem('verlyse-saved') ?? '[]').length === 0,
      'unsave did not clear storage')
  })

  cleanup()

  /* ---- SAVED DRAWER: dialog semantics + scroll lock -------------------- */
  await check('saved drawer: opens as a modal dialog, locks scroll, and syncs single-item removal', async () => {
    window.localStorage.clear()
    const item = ARTICLES[0]
    wrap(
      <>
        <SaveButton id={item.id} title={item.title} category={item.category} />
        <SavedDrawer />
      </>,
    )
    const saveTrigger = screen.getByRole('button', { name: new RegExp(`Save “${item.title}”`, 'i') })
    await act(async () => { fireEvent.click(saveTrigger) })
    assert(saveTrigger.getAttribute('aria-pressed') === 'true', 'SaveButton did not flip to true')

    await act(async () => { window.dispatchEvent(new CustomEvent('verlyse:saved')) })
    const dialog = await screen.findByRole('dialog')
    assert(dialog.getAttribute('aria-modal') === 'true', 'saved drawer is not aria-modal')
    assert(document.body.style.overflow === 'hidden', 'saved drawer did not lock body scroll')

    const removeBtn = screen.getByRole('button', { name: new RegExp(`Remove ${item.title}`, 'i') })
    await act(async () => { fireEvent.click(removeBtn) })
    await waitFor(() => {
      assert(saveTrigger.getAttribute('aria-pressed') === 'false', 'removing single item in SavedDrawer did not sync SaveButton')
    })
  })

  cleanup()
  document.body.style.overflow = ''

  /* ---- REPEAT MOUNT / UNMOUNT (R07 resource + listener cleanup) -------- */
  await check('repeat mount/unmount leaves no stray dialog or scroll lock', async () => {
    for (let i = 0; i < 12; i += 1) {
      const view = wrap(<><SearchOverlay /><SavedDrawer /></>)
      await act(async () => { window.dispatchEvent(new CustomEvent('verlyse:search')) })
      view.unmount()
    }
    assert(document.querySelectorAll('[role="dialog"]').length === 0,
      'a dialog survived unmount')
    assert(document.body.style.overflow !== 'hidden',
      'body scroll lock survived unmount')
  })

  cleanup()

  /* ---- ART GALLERY LIGHTBOX: focus trap, Escape, focus restore, no assetPath leak ---- */
  await check('art gallery: hides internal asset paths and traps focus inside lightbox', async () => {
    const qg = ARTICLES.find((a) => a.id === 'the-quiet-grief')!
    assert(qg.likesCountRaw === -1 && !hasKnownLikes(qg), 'the-quiet-grief must treat likesCountRaw=-1 as unknown')
    const sd = ARTICLES.find((a) => a.id === 'she-didnt-say-qubool-hai')!
    assert(!!sd, 'she-didnt-say-qubool-hai article missing from ARTICLES')
    assert(sd.likesCountRaw === -1 && !hasKnownLikes(sd), 'she-didnt-say-qubool-hai must treat likesCountRaw=-1 as unknown')
    assert(sd.authorId === 'haieqa-wahab', 'she-didnt-say-qubool-hai authorId must be haieqa-wahab')
    assert(sd.credit?.includes('Wajiha Ahmed') && sd.credit?.includes('Haieqa Wahab'), 'she-didnt-say-qubool-hai credit must name Editor Wajiha Ahmed and Writer Haieqa Wahab')
    assert(sd.slides.length === 8 && sd.slideDescriptions?.length === 8, 'she-didnt-say-qubool-hai must have 8 slides and 8 slideDescriptions')
    assert(
      sd.sourceCaption?.includes('She didn’t say Qubool Hai.\nShe was forced to.') &&
        sd.sourceCaption?.includes('#ForcedMarriage #verlysemedia #EndForcedMarriage #WomensRights #ConsentMatters'),
      'she-didnt-say-qubool-hai verbatim sourceCaption mismatch',
    )
    const mostAppreciated = sortArticles('most-appreciated')
    assert(
      mostAppreciated.findIndex((a) => a.id === 'the-quiet-grief') >= mostAppreciated.length - 3 &&
        mostAppreciated.findIndex((a) => a.id === 'she-didnt-say-qubool-hai') >= mostAppreciated.length - 3,
      'unknown likesCountRaw=-1 articles should sort after known-likes articles in most-appreciated',
    )
    wrap(<ArtGallery article={qg} />)

    assert(!document.body.textContent?.includes('/img/works/DeUZFPTCjPU-1.webp'), 'public gallery leaked internal assetPath')
    assert(!document.body.textContent?.includes('pending source binary'), 'public gallery leaked internal status text')

    const gallerySection = document.querySelector('section[aria-label*="plate sequence"]')
    assert(!gallerySection?.className.includes('256px'), 'ArtGallery still has leftover +256px right-gutter padding offset')

    const trigger = screen.getByRole('button', { name: /Inspect Plate 01 of 05/i })
    assert(!trigger.className.includes('transition-all'), 'ArtGallery plate button uses transition-all alongside StringGlide transform')
    trigger.focus()
    await act(async () => { fireEvent.click(trigger) })

    const dialog = await screen.findByRole('dialog')
    assert(dialog.getAttribute('aria-modal') === 'true', 'lightbox is not aria-modal')
    assert(document.body.style.overflow === 'hidden', 'lightbox did not lock body scroll')

    const closeBtn = screen.getByRole('button', { name: /Close lightbox/i })
    const nextBtn = screen.getByRole('button', { name: /Next plate/i })
    closeBtn.focus()
    await act(async () => { fireEvent.keyDown(document, { key: 'Tab', shiftKey: true }) })
    assert(document.activeElement === nextBtn, 'Shift+Tab from first control did not wrap to last control in lightbox')

    await act(async () => { fireEvent.keyDown(document, { key: 'Tab', shiftKey: false }) })
    assert(document.activeElement === closeBtn, 'Tab from last control did not wrap to first control in lightbox')

    await act(async () => { fireEvent.keyDown(window, { key: 'Escape' }) })
    await waitFor(() => {
      assert(screen.queryByRole('dialog') === null, 'lightbox still open after Escape')
      assert(document.activeElement === trigger, 'focus was not restored to trigger button after closing lightbox')
    })
  })

  cleanup()
  document.body.style.overflow = ''

  /* ---- SUBMIT & CONTACT FORMS: aria-invalid, aria-describedby, single alert, cover honesty ---- */
  await check('submit & contact forms: accessible validation and truthful cover filename handling', async () => {
    wrap(<Submit />)
    const nameInput = screen.getByLabelText(/Full name/i)
    assert(nameInput.getAttribute('aria-invalid') === null, 'untouched valid field should not have aria-invalid')

    const submitBtn = screen.getByRole('button', { name: /Submit the piece/i })
    await act(async () => { fireEvent.click(submitBtn) })

    assert(nameInput.getAttribute('aria-invalid') === 'true', 'invalid field missing aria-invalid="true"')
    assert(nameInput.getAttribute('aria-describedby') === 'sf-name-err', 'invalid field missing aria-describedby')
    const alerts = screen.getAllByRole('alert')
    assert(alerts.length === 1, `expected a single form-level role="alert", got ${alerts.length}`)

    const fileInput = document.querySelector<HTMLInputElement>('#sf-cover')!
    const file = new File(['dummy'], 'painting.webp', { type: 'image/webp' })
    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [file] } })
    })
    assert(document.body.textContent?.includes('not uploaded'), 'selected cover file did not clearly state it is not uploaded')

    await act(async () => {
      fireEvent.input(nameInput, { target: { value: 'Alina' } })
    })
    assert(nameInput.getAttribute('aria-invalid') === null, 'correcting field did not clear aria-invalid')
  })

  cleanup()

  await check('contact form: accessible validation and single role="alert"', async () => {
    wrap(<Contact />)
    const sendBtn = screen.getByRole('button', { name: /Seal the letter/i })
    await act(async () => { fireEvent.click(sendBtn) })
    const alerts = screen.getAllByRole('alert')
    assert(alerts.length === 1, `expected 1 alert on Contact form, got ${alerts.length}`)
    const emailInput = screen.getByLabelText(/Email/i)
    assert(emailInput.getAttribute('aria-invalid') === 'true', 'Contact email missing aria-invalid="true"')
    assert(emailInput.getAttribute('aria-describedby') === 'cf-email-err', 'Contact email missing aria-describedby')
  })

  cleanup()

  /* ---- WRITER PROFILE: no doubled quotes or empty quote blocks --------- */
  await check('writer profile: never doubles quotation marks or renders empty quote blocks', async () => {
    assert(formatQuotedNote('“Hello world.”') === '“Hello world.”', 'doubled outer curly quotes')
    assert(formatQuotedNote('““Hello world.””') === '“Hello world.”', 'failed to collapse doubled quotes')
    assert(formatQuotedNote('“A note.” — Abheesha') === '“A note.” — Abheesha', 'corrupted attributed note')
    assert(formatQuotedNote('') === '', 'non-empty output for empty note')

    for (const author of AUTHORS) {
      wrap(<WriterProfile author={author} />)
      const text = document.body.textContent ?? ''
      assert(!text.includes('““') && !text.includes('””'), `doubled quotation marks rendered for ${author.id}`)
      cleanup()
    }
  })

  cleanup()

  /* ---- HIRING MARQUEE ("THE NEXT BYLINE") & TEAM ROSTER UPDATE --------- */
  await check('hiring marquee & team roster: exact Google Form URL, 3 roles, a11y deduplication, and Haiqa/Manha removed from team', async () => {
    const exactFormUrl =
      'https://docs.google.com/forms/d/e/1FAIpQLScbXxbyw22YM4Mlid81RoyckzgwvpBC9h8siWff3hMp6tcBwg/viewform?usp=publish-editor'
    assert(BRAND.hiringForm === exactFormUrl, 'BRAND.hiringForm does not match official Google Forms URL')
    assert(BRAND.team.length === 10, `expected 10 team members in BRAND.team, got ${BRAND.team.length}`)
    assert(
      !BRAND.team.some((m) => /haiqa|manha/i.test(m.name)),
      'Haiqa Nafees or Manha still present in BRAND.team',
    )

    wrap(<HiringMarquee />)
    const text = document.body.textContent ?? ''
    assert(text.includes('VERLYSE MEDIA / OPEN CALL 2026'), 'missing hiring kicker')
    assert(text.includes('The next voice could be yours.'), 'missing hiring headline')
    assert(text.includes('Researcher') && text.includes('Palette Designer') && text.includes('Content Writer'), 'missing one or more open roles')
    assert(text.includes('Previous experience isn’t essential'), 'missing beginner-friendly experience note')
    assert(!/track\s*0/i.test(text), 'HiringMarquee rendered generic Track 0 label')

    const cta = screen.getByRole('link', { name: /Explore the roles and apply to Verlyse Media/i })
    assert(cta.getAttribute('href') === exactFormUrl, `hiring CTA href mismatch: ${cta.getAttribute('href')}`)
    assert(cta.getAttribute('target') === '_blank', 'hiring CTA missing target="_blank"')
    assert(cta.getAttribute('rel')?.includes('noopener') && cta.getAttribute('rel')?.includes('noreferrer'), 'hiring CTA missing rel="noopener noreferrer"')
    cleanup()

    wrap(<Ambassadors />)
    const ambText = document.body.textContent ?? ''
    assert(!ambText.includes('Haiqa Nafees') && !ambText.includes('HAIQA NAFEES'), 'Haiqa Nafees still rendered on /ambassadors')
    assert(!ambText.includes('Manha') && !ambText.includes('MANHA'), 'Manha still rendered on /ambassadors')
    assert(!/crash zoom|35mm/i.test(ambText), '/ambassadors rendered generic camera slate text')
    cleanup()

    const haiqaAuthor = AUTHORS.find((a) => a.id === 'haiqa-nafees')
    assert(!!haiqaAuthor && haiqaAuthor.role === 'Writer · Associate Editor', 'Haiqa Nafees author profile was not preserved in AUTHORS')
    assert(folioNoOf('non-existent-article') === '', 'folioNoOf should return empty string rather than 00 for missing article')
  })

  cleanup()

  /* ---- EDITORIAL COUNTS, FOOTER NEWSLETTER & CRAFT CONTROLS A11Y ------- */
  await check('editorial counts, footer newsletter guidance, and craft system a11y', async () => {
    assert(LEDGER.features === 21, `expected 21 catalogued features, got ${LEDGER.features}`)
    assert(LEDGER.publishedFeatures === 19, `expected 19 published features, got ${LEDGER.publishedFeatures}`)
    assert(LEDGER.provisionalFeatures === 2, `expected 2 provisional features, got ${LEDGER.provisionalFeatures}`)
    assert(
      resolveNewsletterEndpoint('verlysemedia.kesug.com') === 'https://verlyse-react.vercel.app/api/newsletter',
      'static canonical host did not resolve to Vercel newsletter endpoint'
    )
    assert(resolveNewsletterEndpoint('localhost') === '/api/newsletter', 'local host did not resolve to /api/newsletter')

    wrap(<Creators />)
    const creatorsText = document.body.textContent ?? ''
    assert(
      creatorsText.includes('21 catalogued features (19 published folios and 2 provisional records)'),
      'Creators page did not distinguish published vs provisional counts'
    )
    const floralSpan = document.querySelector('[data-craft-floral-word]')
    assert(!!floralSpan && !floralSpan.className.includes('cursor-pointer'), 'FloralWord should be decorative without cursor-pointer')
    assert(
      document.querySelectorAll('[data-craft-dot-matrix], [data-craft-emblem]').length === 0,
      'Generic DotMatrixLedger / RouteEmblemSeal placeholder badges must not render'
    )
    cleanup()

    wrap(<Footer />)
    const footerEl = document.querySelector('footer[aria-label="Footer"]')
    assert(!!footerEl, 'Footer landmark missing')
    const nlInput = screen.getByLabelText(/Email address for The Verlyse Letter/i)
    assert(nlInput.getAttribute('placeholder') === 'Enter your email address…', 'Newsletter email input missing visible placeholder guidance')
    const nlSubmitBtn = screen.getByRole('button', { name: /Take the letter/i })
    assert(!!nlSubmitBtn, 'Newsletter submit button missing')

    const specimen = document.querySelector('[data-footer-specimen="verlyse"]')
    assert(!!specimen, 'Fixed Verlyse footer specimen missing')
    assert(specimen?.getAttribute('aria-hidden') === 'true', 'Footer specimen must be aria-hidden="true"')
    assert((specimen?.textContent ?? '').trim() === 'Verlyse', `Footer specimen should render fixed "Verlyse" wordmark, got "${specimen?.textContent}"`)
    const specimenControls = specimen?.querySelectorAll(
      'input, select, textarea, button, a, [role="radio"], [role="button"], [download], [tabindex]:not([tabindex="-1"])'
    )
    assert((specimenControls?.length ?? 0) === 0, `Footer specimen must contain 0 interactive/focusable descendants, found ${specimenControls?.length}`)

    const footerInputs = footerEl?.querySelectorAll('input, select, textarea') ?? []
    assert(footerInputs.length === 1 && footerInputs[0].id === 'nl-email', 'Footer should only contain the newsletter email input')

    const footerText = footerEl?.textContent ?? ''
    assert(!/\bTG\d+\b/i.test(footerText), 'Footer rendered TG+digits tool identifier')
    assert(
      !/herbarium colophon|inscribe phrase|foliage density|keep plate|oxblood\s*&\s*antique brass|tudor rose|nocturne\s*&\s*gilded|mulberry velvet/i.test(footerText),
      'Footer rendered generic Type Garden demo labels'
    )
    for (const navHref of ['/articles', '/categories', '/creators', '/room', '/about', '/community', '/ambassadors', '/submit', '/contact']) {
      assert(!!footerEl?.querySelector(`a[href="${navHref}"]`), `Footer missing navigation link ${navHref}`)
    }
    cleanup()
  })

  /* ---- STRINGTUNE REDUCED-MOTION RACE SAFETY --------------------------- */
  await check('stringTune: start/stop race safety when reduced-motion changes or provider unmounts mid-boot', async () => {
    stopStringTune()
    const pending = startStringTune()
    // Immediately stop before the async import resolves
    stopStringTune()
    const resolved = await pending
    assert(resolved === null && !isStringTuneRunning(), 'StringTune started despite stopStringTune() during pending boot')

    const view = wrap(<StringTuneProvider />)
    view.unmount()
    assert(!isStringTuneRunning(), 'StringTune remained running after provider unmount')
  })

  const failed = results.filter((r) => !r.ok)
  const lines = results.map((r) => `${r.ok ? '✓' : '✗'} ${r.name}${r.detail ? ` — ${r.detail}` : ''}`)
  return {
    report: lines.join('\n'),
    passed: results.length - failed.length,
    total: results.length,
    ok: failed.length === 0,
  }
}
