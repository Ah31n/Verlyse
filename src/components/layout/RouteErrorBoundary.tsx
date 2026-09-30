import { Component, type ErrorInfo, type ReactNode } from 'react'

/**
 * The last page in the magazine — the one that admits something went wrong.
 *
 * Every route in this app is a lazy chunk. Before this boundary existed, a
 * chunk that threw during render (or simply failed to download on a poor
 * connection) left the reader on a blank charcoal rectangle forever: the
 * Suspense fallback and a permanent failure looked exactly alike, with no
 * message and no way back.
 *
 * A stale-deploy chunk 404 is the common case — the reader has an old
 * index.html open, a new build has replaced the hashed assets, and the next
 * navigation asks for a file that no longer exists. That one is fixed by a
 * reload, so the reload control is offered first and the route is remembered.
 */

interface Props {
  children: ReactNode
  /** Changing this value clears a previous error — pass the pathname. */
  resetKey?: string
}

interface State {
  error: Error | null
}

/** A failed dynamic import reads differently in every engine; match broadly. */
function isChunkLoadError(error: Error): boolean {
  const text = `${error.name} ${error.message}`
  return /ChunkLoadError|Loading chunk|Importing a module script failed|Failed to fetch dynamically imported module|error loading dynamically imported module/i.test(text)
}

export default class RouteErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidUpdate(prev: Props) {
    // A new route is a fresh chance — clear the error so navigation recovers.
    if (this.state.error && prev.resetKey !== this.props.resetKey) {
      this.setState({ error: null })
    }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // No telemetry endpoint exists, so the console is the only record a
    // render failure leaves. Logged in production too — a reader reporting
    // "it went blank" is otherwise undiagnosable.
    console.error('[verlyse] route render failed', error, info.componentStack)
  }

  private reload = () => {
    window.location.reload()
  }

  render() {
    const { error } = this.state
    if (!error) return this.props.children

    const stale = isChunkLoadError(error)

    return (
      <section className="flex min-h-[70vh] items-center justify-center px-6 text-center" role="alert">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-gold">
            {stale ? 'A newer issue is on the press' : 'A page that would not settle'}
          </p>
          <h1 className="mt-6 font-serif text-[clamp(2.4rem,5vw,4rem)] font-light leading-[1.05] text-ivory">
            {stale ? (
              <>This page was <em className="italic text-gold">reset while you were reading</em></>
            ) : (
              <>Something in this page <em className="italic text-gold">did not print</em></>
            )}
          </h1>
          <p className="mx-auto mt-6 max-w-[42ch] font-serif text-lg font-light italic leading-[1.7] text-white/65">
            {stale
              ? 'The archive was republished while this tab was open, so the page could not finish loading. Reloading brings back the current issue.'
              : 'The rest of the magazine is unaffected. Reload this page, or step back into the room and take another door.'}
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6">
            <button type="button" onClick={this.reload} className="btn btn-gold">
              Reload this page
            </button>
            {/* A hard link, not a Link: the router itself may be the thing
                that failed, so this must not depend on it. */}
            <a
              href="/"
              className="border-b border-gold/60 pb-1 font-mono text-[10px] uppercase tracking-[0.28em] text-gold no-underline transition-colors hover:text-ivory"
            >
              Return to the magazine →
            </a>
          </div>
        </div>
      </section>
    )
  }
}
