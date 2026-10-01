import { useEffect, useState } from 'react'
import { clsx } from 'clsx'

interface ReadingProgressLineProps {
  className?: string
}

/**
 * ReadingProgressLine — Pinned Brass Hairline Reading Indicator
 */
export function ReadingProgressLine({ className = '' }: ReadingProgressLineProps) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight
      if (totalScroll <= 0) {
        setProgress(0)
        return
      }
      const currentScroll = window.scrollY
      setProgress(Math.min(100, Math.max(0, (currentScroll / totalScroll) * 100)))
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div
      aria-hidden="true"
      className={clsx('fixed top-0 left-0 right-0 z-[600] h-[2px] bg-white/10 pointer-events-none', className)}
    >
      <div
        className="h-full bg-gold transition-all duration-100 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}
