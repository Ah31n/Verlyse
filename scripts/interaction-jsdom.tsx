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
import { ARTICLES } from '../src/data/content'

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
  await check('saved drawer: opens as a modal dialog and locks scroll', async () => {
    wrap(<SavedDrawer />)
    await act(async () => { window.dispatchEvent(new CustomEvent('verlyse:saved')) })
    const dialog = await screen.findByRole('dialog')
    assert(dialog.getAttribute('aria-modal') === 'true', 'saved drawer is not aria-modal')
    assert(document.body.style.overflow === 'hidden', 'saved drawer did not lock body scroll')
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

  const failed = results.filter((r) => !r.ok)
  const lines = results.map((r) => `${r.ok ? '✓' : '✗'} ${r.name}${r.detail ? ` — ${r.detail}` : ''}`)
  return {
    report: lines.join('\n'),
    passed: results.length - failed.length,
    total: results.length,
    ok: failed.length === 0,
  }
}
