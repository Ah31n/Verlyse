// The Keeping Room — the brass thread.
// A single restrained horizontal rule that binds the plates in reading order.
// It dims in the room and brightens toward the focused plate. No glow, no bloom.
import { motion } from 'framer-motion'
import type { RoomState } from '../../lib/room/state'

export default function BrassThread({ state, reduced, mobile }: { state: RoomState; reduced: boolean; mobile: boolean }) {
  const bright = state === 'focus' || state === 'settle' || state === 'next'
  const hidden = state === 'arrival' || state === 'entry' || state === 'ending'
  return (
    <motion.div
      aria-hidden
      className={`pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 ${mobile ? '-translate-y-1/2 h-[60vh] w-px' : '-translate-y-[70px] h-px w-[78vw] max-w-[1200px]'}`}
      initial={false}
      animate={{
        opacity: hidden ? 0 : bright ? 0.9 : 0.34,
        scaleX: bright && !mobile ? 0.34 : 1,
        scaleY: bright && mobile ? 0.4 : 1,
      }}
      transition={{ duration: reduced ? 0 : 0.9, ease: [0.22, 1, 0.36, 1] }}
      style={{
        background: mobile
          ? 'linear-gradient(180deg, transparent, #B89146 18%, #D9B978 50%, #B89146 82%, transparent)'
          : 'linear-gradient(90deg, transparent, #B89146 18%, #D9B978 50%, #B89146 82%, transparent)',
        transformOrigin: 'center',
      }}
    />
  )
}
