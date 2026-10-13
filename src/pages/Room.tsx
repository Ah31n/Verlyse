// The Keeping Room — full-screen spatial archive, mounted outside the
// canonical Layout (it has its own quiet chrome). Reading still hands off
// to /article/:id, which renders inside the normal publication shell.
//
// It is a real public page: linked from the footer, prerendered, and listed
// in the sitemap. It therefore carries its own metadata like every other
// route, rather than inheriting the home page's title.
import { useEffect } from 'react'
import Room from '../components/room/Room'
import { useSeo } from '../hooks/useSeo'
import { ARTICLES } from '../data/content'

export default function RoomPage() {
  useSeo({
    title: 'The Keeping Room',
    description: `A spatial walk through the archive — all ${ARTICLES.length} folios on one thread. Pull a plate, read it, return it.`,
    path: '/room',
  })

  useEffect(() => {
    // The room darkens the page behind its own canvas. Restore the previous
    // value on the way out, or every route visited after /room inherits it.
    const previous = document.documentElement.style.background
    document.documentElement.style.background = '#161412'
    return () => {
      document.documentElement.style.background = previous
    }
  }, [])

  return <Room />
}
