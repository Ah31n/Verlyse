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
import Submit, { resolveSubmitEndpoint } from '../src/pages/Submit'
import Contact, { resolveContactEndpoint } from '../src/pages/Contact'
import StringTuneProvider, { shouldSuspendStringTune } from '../src/lib/stringTune/StringTuneProvider'
import { isStringTuneRunning, startStringTune, stopStringTune } from '../src/lib/stringTune/runtime'
import { Magnetic } from '../src/components/ui/Magnetic'
import { MAX_ARCHIVE_PLATES, selectArchiveArticles } from '../src/components/spatial/SpatialArchive'
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

  /* ---- SUBMIT & CONTACT FORMS: aria-invalid, aria-describedby, binary cover upload, failure recovery, retry & acceptance ---- */
  await check('submit & contact forms: accessible validation, binary cover upload, failure preservation, manual draft fallback, and server acceptance', async () => {
    wrap(<Submit />)
    const nameInput = screen.getByLabelText(/Full name/i) as HTMLInputElement
    assert(nameInput.getAttribute('aria-invalid') === null, 'untouched valid field should not have aria-invalid')

    const submitBtn = screen.getByRole('button', { name: /Submit the piece/i })
    await act(async () => { fireEvent.click(submitBtn) })

    assert(nameInput.getAttribute('aria-invalid') === 'true', 'invalid field missing aria-invalid="true"')
    assert(nameInput.getAttribute('aria-describedby') === 'sf-name-err', 'invalid field missing aria-describedby')
    const alerts = screen.getAllByRole('alert')
    assert(alerts.length === 1, `expected a single form-level role="alert", got ${alerts.length}`)

    const fileInput = document.querySelector<HTMLInputElement>('#sf-cover')!
    // 1. Reject invalid file type
    const badFile = new File(['plain text'], 'notes.txt', { type: 'text/plain' })
    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [badFile] } })
    })
    assert(
      document.querySelector('#sf-cover-err')?.textContent?.includes('JPG, PNG, WEBP, AVIF or GIF'),
      'invalid MIME type did not display #sf-cover-err',
    )

    // 2. Reject oversized file (> 4 MB)
    const hugeFile = new File(['x'], 'huge.png', { type: 'image/png' })
    Object.defineProperty(hugeFile, 'size', { value: 4 * 1024 * 1024 + 100 })
    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [hugeFile] } })
    })
    assert(
      document.querySelector('#sf-cover-err')?.textContent?.includes('over 4 MB'),
      'oversized file did not display 4 MB error',
    )

    // 3. Select valid binary cover image
    const validBytes = new Uint8Array([0x52, 0x49, 0x46, 0x46, 0x24, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50])
    const file = new File([validBytes], 'painting.webp', { type: 'image/webp' })
    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [file] } })
    })
    assert(
      document.querySelector('#sf-cover-status')?.textContent?.includes('Cover ready to upload (painting.webp'),
      'selected cover file did not display ready-to-upload status',
    )

    // Fill required fields
    await act(async () => {
      fireEvent.input(nameInput, { target: { value: 'Alina Javed' } })
    })
    assert(nameInput.getAttribute('aria-invalid') === null, 'correcting field did not clear aria-invalid')

    const emailInput = screen.getByLabelText(/^Email$/i) as HTMLInputElement
    const titleInput = screen.getByLabelText(/Title of the work/i) as HTMLInputElement
    const catSelect = screen.getByLabelText(/Category/i) as HTMLSelectElement
    const workInput = screen.getByLabelText(/Full submission \/ article/i) as HTMLTextAreaElement
    const origCheck = document.querySelector<HTMLInputElement>('#sf-original')!

    emailInput.value = 'alina@example.test'
    titleInput.value = 'The Quiet Lantern'
    catSelect.value = 'Stories'
    workInput.value = 'Full manuscript text for submission verification.'
    await act(async () => {
      fireEvent.input(emailInput, { target: { value: 'alina@example.test' } })
      fireEvent.input(titleInput, { target: { value: 'The Quiet Lantern' } })
      fireEvent.change(catSelect, { target: { value: 'Stories' } })
      fireEvent.input(workInput, { target: { value: 'Full manuscript text for submission verification.' } })
      fireEvent.click(origCheck)
    })

    // 4. Test pending state, double-submit prevention, and 503 failure preserving values & file
    const origFetch = globalThis.fetch
    const calls: Array<{ url: string; body: FormData }> = []
    let resolveFirstFetch!: (res: Response) => void
    globalThis.fetch = ((url: string, init?: RequestInit) => {
      calls.push({ url: String(url), body: init?.body as FormData })
      return new Promise<Response>((resolve) => {
        resolveFirstFetch = resolve
      })
    }) as typeof fetch

    await act(async () => {
      fireEvent.click(submitBtn)
      // Attempt immediate second click while in-flight
      fireEvent.click(submitBtn)
    })
    assert(calls.length === 1, `double-submit guard failed: expected 1 fetch call, got ${calls.length}`)
    assert(submitBtn.hasAttribute('disabled') && submitBtn.getAttribute('aria-busy') === 'true', 'submit button not disabled/aria-busy while sending')

    await act(async () => {
      resolveFirstFetch(
        new Response(JSON.stringify({ ok: false, error: 'provider-unconfigured' }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' },
        }),
      )
    })

    // Must NOT claim "Accepted by the submission system" or "Sent to the desk" on failure
    assert(!document.body.textContent?.includes('Accepted by the submission system'), 'falsely showed acceptance on 503 failure')
    assert(!document.body.textContent?.includes('Sent to the desk'), 'falsely showed Sent to the desk on 503 failure')
    // Must keep form fields and cover selection intact
    assert(titleInput.value === 'The Quiet Lantern', 'title input was lost on failure')
    assert(workInput.value.includes('Full manuscript text'), 'work input was lost on failure')
    assert(document.body.textContent?.includes('Selected cover: painting.webp'), 'selected cover file was lost on failure')

    const failureAlerts = screen.getAllByRole('alert')
    assert(failureAlerts.length === 1, `expected 1 role="alert" on delivery failure, got ${failureAlerts.length}`)
    assert(failureAlerts[0].textContent?.includes('unconfigured'), 'failure alert did not explain unconfigured service')

    const draftLink = screen.getByRole('link', { name: /Open email draft in your mail app/i })
    assert(draftLink.getAttribute('href')?.startsWith('mailto:Verlysemedia.09@gmail.com?'), 'manual fallback link missing mailto href')
    assert(
      failureAlerts[0].textContent?.includes('manually attach "painting.webp"'),
      'manual fallback did not warn that mailto cannot attach local image files automatically',
    )

    // 5. Retry with preserved values and selected file -> Server acceptance (200)
    globalThis.fetch = (async (url: string, init?: RequestInit) => {
      calls.push({ url: String(url), body: init?.body as FormData })
      return new Response(
        JSON.stringify({
          ok: true,
          accepted: true,
          attachmentIncluded: true,
          attachmentName: 'painting.webp',
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      )
    }) as typeof fetch

    const retryBtn = screen.getByRole('button', { name: /Retry submission/i })
    await act(async () => {
      fireEvent.click(retryBtn)
    })

    assert(calls.length === 2, 'retry button did not trigger a second fetch call')
    const sentFormData = calls[1].body
    assert(sentFormData instanceof FormData, 'outbound submission body was not FormData')
    const uploadedCover = sentFormData.get('cover') as File | null
    assert(uploadedCover instanceof File, 'FormData did not include binary File under "cover"')
    assert(uploadedCover?.name === 'painting.webp', `expected cover filename painting.webp, got ${uploadedCover?.name}`)
    assert(uploadedCover?.size === validBytes.byteLength, 'uploaded File byte length mismatch')

    assert(document.body.textContent?.includes('Accepted by the submission system'), 'missing accepted screen after 200 ok')
    assert(document.body.textContent?.includes('Cover image uploaded & attached: painting.webp'), 'missing uploaded cover confirmation')

    globalThis.fetch = origFetch
  })

  cleanup()

  await check('contact form: accessible validation, single role="alert", failure preservation, and server acceptance', async () => {
    wrap(<Contact />)
    const sendBtn = screen.getByRole('button', { name: /Seal the letter/i })
    await act(async () => { fireEvent.click(sendBtn) })
    const alerts = screen.getAllByRole('alert')
    assert(alerts.length === 1, `expected 1 alert on Contact form, got ${alerts.length}`)
    const emailInput = screen.getByLabelText(/Email/i) as HTMLInputElement
    assert(emailInput.getAttribute('aria-invalid') === 'true', 'Contact email missing aria-invalid="true"')
    assert(emailInput.getAttribute('aria-describedby') === 'cf-email-err', 'Contact email missing aria-describedby')

    const nameInput = screen.getByLabelText(/Your name/i) as HTMLInputElement
    const subjInput = screen.getByLabelText(/Subject/i) as HTMLInputElement
    const msgInput = screen.getByLabelText(/The letter itself/i) as HTMLTextAreaElement

    emailInput.value = 'reader@example.test'
    subjInput.value = 'Editorial inquiry'
    msgInput.value = 'A note to the editors.'
    await act(async () => {
      fireEvent.change(nameInput, { target: { value: 'Reader Name' } })
      fireEvent.input(emailInput, { target: { value: 'reader@example.test' } })
      fireEvent.input(subjInput, { target: { value: 'Editorial inquiry' } })
      fireEvent.input(msgInput, { target: { value: 'A note to the editors.' } })
    })

    const origFetch = globalThis.fetch
    const contactBodies: FormData[] = []
    globalThis.fetch = (async (_url: string, init?: RequestInit) => {
      contactBodies.push(init?.body as FormData)
      return new Response(JSON.stringify({ ok: false, error: 'provider-unconfigured' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      })
    }) as typeof fetch

    await act(async () => { fireEvent.click(sendBtn) })
    assert(!document.body.textContent?.includes('Letter received by the server'), 'Contact form falsely showed success on 503')
    assert(subjInput.value === 'Editorial inquiry', 'Contact subject was lost on 503 failure')
    assert(screen.getAllByRole('alert').length === 1, 'Contact failure did not render single role="alert"')
    assert(contactBodies[0] instanceof FormData && contactBodies[0].get('kind') === 'contact', 'Contact form did not send multipart FormData with kind=contact')

    globalThis.fetch = (async (_url: string, init?: RequestInit) => {
      contactBodies.push(init?.body as FormData)
      return new Response(JSON.stringify({ ok: true, accepted: true, kind: 'contact' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }) as typeof fetch

    const retryBtn = screen.getByRole('button', { name: /Retry sending letter/i })
    await act(async () => { fireEvent.click(retryBtn) })
    assert(document.body.textContent?.includes('Letter received by the server'), 'Contact form did not show accepted screen after 200 ok')
    globalThis.fetch = origFetch
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
    const nlInput = screen.getByLabelText(/Email address for The Verlyse Letter/i) as HTMLInputElement
    assert(nlInput.getAttribute('placeholder') === 'Enter your email address…', 'Newsletter email input missing visible placeholder guidance')
    const nlSubmitBtn = screen.getByRole('button', { name: /Take the letter/i })
    assert(!!nlSubmitBtn, 'Newsletter submit button missing')

    // Newsletter validation & failure/retry/acceptance flow
    const origFetch = globalThis.fetch
    await act(async () => {
      fireEvent.change(nlInput, { target: { value: 'reader@example.test' } })
    })
    globalThis.fetch = (async () =>
      new Response(JSON.stringify({ error: 'not-configured' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      })) as typeof fetch
    await act(async () => {
      fireEvent.click(nlSubmitBtn)
    })
    assert(nlInput.value === 'reader@example.test', 'Newsletter cleared email input on 503 failure')
    assert(!document.body.textContent?.includes("You're on the list."), 'Newsletter falsely claimed subscription on 503 failure')
    assert(!!screen.getByRole('button', { name: /Retry letter/i }), 'Newsletter did not offer Retry letter button after 503 failure')

    globalThis.fetch = (async () =>
      new Response(JSON.stringify({ ok: false, error: 'blocked', blocked: true }), {
        status: 422,
        headers: { 'Content-Type': 'application/json' },
      })) as typeof fetch
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Retry letter/i }))
    })
    assert(nlInput.value === 'reader@example.test', 'Newsletter cleared email input on 422 spam-block failure')
    assert(!document.body.textContent?.includes("We’ll send the next letter"), 'Newsletter showed success subtitle on 422 spam-block')

    globalThis.fetch = (async () =>
      new Response(JSON.stringify({ ok: true }), {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      })) as typeof fetch
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Retry letter/i }))
    })
    assert(nlInput.value === '', 'Newsletter did not clear email input after 201 ok')
    assert(document.body.textContent?.includes("You're on the list."), 'Newsletter did not show confirmed subscription after 201 ok')
    globalThis.fetch = origFetch

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
    assert(shouldSuspendStringTune('/room') === true, 'StringTune should suspend on /room')
    assert(resolveSubmitEndpoint('verlysemedia.kesug.com') === 'https://verlyse-react.vercel.app/api/submit', 'resolveSubmitEndpoint did not map kesug.com to Vercel API')
    assert(resolveSubmitEndpoint('localhost') === '/api/submit', 'resolveSubmitEndpoint did not map localhost to /api/submit')
    assert(resolveContactEndpoint('verlysemedia.kesug.com') === 'https://verlyse-react.vercel.app/api/submit', 'resolveContactEndpoint did not map kesug.com to Vercel API')
    assert(selectArchiveArticles(null).length === MAX_ARCHIVE_PLATES && MAX_ARCHIVE_PLATES === 9, 'SpatialArchive did not cap cover textures to curated 9-plate subset')

    const magView = wrap(<Magnetic><span>Hover target</span></Magnetic>)
    assert(!magView.container.innerHTML.includes('will-change-transform'), 'Magnetic applied persistent will-change-transform at rest')
    magView.unmount()
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
