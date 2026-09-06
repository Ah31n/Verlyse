// The Keeping Room — full-screen spatial archive, mounted outside the
// canonical Layout (it has its own quiet chrome). Reading still hands off
// to /article/:id, which renders inside the normal publication shell.
import { useEffect } from 'react'
import Room from '../components/room/Room'

export default function RoomPage() {
  useEffect(() => {
    document.documentElement.style.background = '#161412'
  }, [])
  return <Room />
}
