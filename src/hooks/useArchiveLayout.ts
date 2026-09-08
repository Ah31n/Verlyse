import { useEffect, useState } from 'react'
import { archiveLayoutForWidth, type ArchiveLayout } from '../lib/archive/geometry'

/** Responsive archive layout — desktop arc / tablet shelf / mobile one-plate. */
export function useArchiveLayout(): ArchiveLayout {
  const [layout, setLayout] = useState<ArchiveLayout>(() =>
    typeof window !== 'undefined' ? archiveLayoutForWidth(window.innerWidth) : 'desktop',
  )
  useEffect(() => {
    const onResize = () => setLayout(archiveLayoutForWidth(window.innerWidth))
    window.addEventListener('resize', onResize)
    onResize()
    return () => window.removeEventListener('resize', onResize)
  }, [])
  return layout
}
