import { useEffect, useState, type ReactNode } from 'react'
import Header from './Header'
import Footer from './Footer'
import Dock from './Dock'
import Preloader from './Preloader'
import SearchOverlay from './SearchOverlay'
import SavedDrawer from './SavedDrawer'
import PageProgress from '../ui/PageProgress'
import { useReadingMode } from '../ui/ReadingMode'

/** Site chrome: preloader, header, search, saved drawer, dock, footer. */
export default function Layout({ children }: { children: ReactNode }) {
  const { on: reading } = useReadingMode()
  const [progress, setProgress] = useState(0)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      setProgress(max > 0 ? window.scrollY / max : 0)
      setScrolled(window.scrollY > 40)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <Preloader />
      <a href="#main" className="skip-link">Skip to content</a>
      {/* Reading progress — a quiet hairline of leaves along the top edge.
          Text-free: the wordmark and folio were removed so nothing ever
          overlays the navigation below. */}
      <div className={`fixed inset-x-0 top-0 z-[1110] flex items-center justify-between border-b border-white/5 px-6 py-1 transition-all duration-1000 ${reading ? 'translate-y-[-100%] opacity-0' : scrolled ? 'translate-y-0 opacity-100' : 'translate-y-0 opacity-0'}`}>
        <PageProgress progress={progress} />
      </div>
      <div className={`transition-all duration-1000 ${reading ? 'pointer-events-none opacity-0' : 'opacity-100'}`}>
        <Header />
      </div>
      <SearchOverlay />
      <SavedDrawer />
      <main id="main">{children}</main>
      <div className={`transition-all duration-1000 ${reading ? 'pointer-events-none opacity-0' : 'opacity-100'}`}>
        <div className="max-lg:pb-[62px]">
          <Footer />
        </div>
        <Dock />
      </div>
    </>
  )
}
