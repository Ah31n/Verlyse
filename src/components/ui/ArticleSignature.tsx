import { motion, useReducedMotion } from 'framer-motion'
import { useRef, type ReactNode } from 'react'
import type { Article } from '../../data/content'
import { useNearViewport } from '../../hooks/useNearViewport'

/**
 * THE ARTICLE SIGNATURE — the final shot of every publication.
 *
 * Not the last slide of a carousel: each signature is an original scene
 * drawn in the magazine's own language (wine, ivory, gold, fine line),
 * built around the ONE symbolic element a reader remembers from that
 * story. Only that element moves — a bead travelling a tasbih, a flame
 * breathing, a cat blinking, a petal passing a lit window — and it moves
 * almost invisibly, after a long silence. Everything else stays still.
 *
 * One-time entrances (a brushstroke painting itself, a letter folding
 * shut, a chandelier swaying once) happen on arrival, then hold. Loops
 * run on long, slow cycles. Under prefers-reduced-motion every scene
 * rests in its final frame. All of it is aria-hidden.
 */

/* a shared reveal hook: returns true once the scene is near the viewport */
function useShow(anim: boolean) {
  const ref = useRef<HTMLDivElement>(null)
  const near = useNearViewport(ref)
  return { ref, show: anim && near }
}

/* the stage — deep wine ground, a soft lamp above, generous silence */
function Stage({ children, label }: { children: ReactNode; label: string }) {
  return (
    <div className="relative flex min-h-[56vh] flex-col items-center justify-center overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(58%_52%_at_50%_4%,rgba(184,145,70,0.07),transparent_72%)]"
      />
      {children}
      <p aria-hidden="true" className="mt-12 text-center font-mono text-[9px] uppercase tracking-[0.30em] text-white/35">{label}</p>
    </div>
  )
}

function Fin() {
  return <p aria-hidden="true" className="mt-12 text-center font-mono text-[10px] uppercase tracking-[0.34em] text-white/35">fin.</p>
}

/* ================================================================== */
/* 1 · THEIR VOICES MATTER — the raised hand with the sign.           */
/* Only the hand and sign appear, from the bottom-left; the elbow      */
/* sways 1°, the wrist gives a whisper. Nothing else moves.            */
/* ================================================================== */
function SceneVoices({ anim }: { anim: boolean }) {
  const { ref, show } = useShow(anim)
  return (
    <div ref={ref} className="relative flex min-h-[72vh] items-end justify-center overflow-hidden">
      {/* the hero — the supplied transparent PNG, rendered exactly as
          uploaded: the hand and the protest sign, nothing else. Pixels
          untouched. It rises from below the viewport once, as though
          someone outside the page is raising the sign; then only the
          faintest sway. Only transforms are animated — no filters. */}
      <motion.div
        initial={anim ? { y: '104%' } : false}
        animate={show ? { y: '0%' } : undefined}
        transition={{ delay: 1, duration: 1.3, ease: [0.16, 1, 0.3, 1] }}
        className={`relative ${show ? 'vm-live' : ''}`}
      >
        {/* the ink accents — floating strokes that appear during the rise, then fade */}
        <svg
          viewBox="0 0 900 1125"
          className="pointer-events-none absolute inset-0 z-10 h-full w-full"
          aria-hidden="true"
        >
          <path className="sig-ink-a1" d="M 120 190 C 138 180, 162 178, 180 184" fill="none" stroke="#1A0408" strokeWidth="3.4" strokeLinecap="round" opacity="0.6" />
          <path className="sig-ink-a2" d="M 790 470 C 806 488, 810 514, 800 536" fill="none" stroke="#1A0408" strokeWidth="2.8" strokeLinecap="round" opacity="0.55" />
          <path className="sig-ink-a3" d="M 560 840 C 580 848, 596 862, 600 884" fill="none" stroke="#5C1224" strokeWidth="3.2" strokeLinecap="round" opacity="0.5" />
          <path className="sig-ink-a4" d="M 70 700 C 56 716, 54 738, 64 754" fill="none" stroke="#1A0408" strokeWidth="2.4" strokeLinecap="round" opacity="0.5" />
        </svg>
        {/* the artwork itself — unmodified */}
        <div className="sig-tvm-sway">
          <img
            src="/img/signatures/tvm-hero.webp"
            alt=""
            aria-hidden="true"
            loading="lazy"
            decoding="async"
            draggable={false}
            className="block h-[clamp(340px,58vh,620px)] w-auto select-none"
          />
        </div>
      </motion.div>
      {/* fin. — fades in once the figure has settled */}
      <motion.p
        aria-hidden="true"
        initial={anim ? { opacity: 0 } : false}
        animate={show ? { opacity: 1 } : undefined}
        transition={{ delay: 6, duration: 2, ease: 'easeOut' }}
        className="absolute inset-x-0 bottom-6 text-center font-mono text-[10px] uppercase tracking-[0.34em] text-white/35"
      >
        fin.
      </motion.p>
    </div>
  )
}


/* ================================================================== */
/* 2 · 3:13 — the clock. The hands rest at 3:13; only the second hand  */
/* sweeps through the wait.                                            */
/* ================================================================== */
function SceneClock() {
  return (
    <Stage label="the wait">
      <div className="flex flex-col items-center gap-6">
        <svg viewBox="0 0 120 120" className="h-[clamp(190px,32vh,330px)] w-auto" aria-hidden="true">
          <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(184,145,70,0.45)" strokeWidth="1.4" />
          <circle cx="60" cy="60" r="46" fill="none" stroke="rgba(184,145,70,0.15)" strokeWidth="1" />
          {[0, 90, 180, 270].map((a) => (
            <line key={a} x1="60" y1="12" x2="60" y2="19" stroke="rgba(184,145,70,0.55)" strokeWidth="1.6" transform={`rotate(${a} 60 60)`} />
          ))}
          {/* the hour hand, still at 3:13 */}
          <line x1="60" y1="60" x2="60" y2="32" stroke="rgba(248,246,242,0.5)" strokeWidth="1.8" transform="rotate(97 60 60)" strokeLinecap="round" />
          {/* the minute hand, still at 13 minutes */}
          <line x1="60" y1="60" x2="60" y2="22" stroke="rgba(248,246,242,0.6)" strokeWidth="1.3" transform="rotate(78 60 60)" strokeLinecap="round" />
          {/* the second hand — the only life in the room */}
          <g className="sig-clock-hand">
            <line x1="60" y1="66" x2="60" y2="20" stroke="#B89146" strokeWidth="0.9" strokeLinecap="round" />
          </g>
          <circle cx="60" cy="60" r="2" fill="#B89146" />
        </svg>
        <p aria-hidden="true" className="font-serif text-2xl font-light italic text-gold/80">3:13</p>
      </div>
    </Stage>
  )
}

/* ================================================================== */
/* 3 · THE EMPTY WALTZ — the chandelier of the empty ballroom. It      */
/* sways once, gently, and becomes still.                              */
/* ================================================================== */
function SceneWaltz({ anim }: { anim: boolean }) {
  const { ref, show } = useShow(anim)
  return (
    <Stage label="one, two, three">
      <div ref={ref} style={{ perspective: 900 }}>
        <motion.div
          initial={anim ? { rotate: 0 } : false}
          animate={show ? { rotate: [0, -2.2, 1.4, -0.6, 0.25, 0] } : undefined}
          transition={{ duration: 18, times: [0, 0.18, 0.36, 0.54, 0.72, 1], ease: 'easeInOut' }}
          style={{ transformOrigin: '50% 0%' }}
        >
          <svg viewBox="0 0 420 380" className="h-[clamp(220px,38vh,400px)] w-auto" aria-hidden="true">
            {/* the chain */}
            <line x1="210" y1="6" x2="210" y2="58" stroke="rgba(184,145,70,0.5)" strokeWidth="1.2" />
            {/* the crown */}
            <path d="M 150 64 L 270 64 L 258 84 L 162 84 Z" fill="none" stroke="rgba(184,145,70,0.6)" strokeWidth="1.4" />
            {/* the arms */}
            <path d="M 210 84 C 210 130, 210 150, 210 168" fill="none" stroke="rgba(184,145,70,0.5)" strokeWidth="1.2" />
            <path d="M 210 100 C 140 120, 110 150, 102 196" fill="none" stroke="rgba(184,145,70,0.5)" strokeWidth="1.2" />
            <path d="M 210 100 C 280 120, 310 150, 318 196" fill="none" stroke="rgba(184,145,70,0.5)" strokeWidth="1.2" />
            {/* the three flames — the only lights in the room */}
            {[
              [210, 176], [102, 204], [318, 204],
            ].map(([x, y], i) => (
              <g key={i}>
                <path d={`M ${x} ${y + 26} q -6 -12 0 -24 q 6 12 0 24 z`} fill="rgba(184,145,70,0.8)" />
                <path d={`M ${x} ${y + 22} q -3 -8 0 -16 q 3 8 0 16 z`} fill="rgba(248,246,242,0.7)" />
                <circle cx={x} cy={y + 6} r="26" fill="rgba(184,145,70,0.07)" />
              </g>
            ))}
            {/* the drops */}
            {[148, 272].map((x, i) => (
              <path key={i} d={`M ${x} 84 l 4 22`} stroke="rgba(184,145,70,0.45)" strokeWidth="1" />
            ))}
            <path d="M 158 84 l 3 16 M 262 84 l 3 16" stroke="rgba(184,145,70,0.45)" strokeWidth="1" />
          </svg>
        </motion.div>
      </div>
    </Stage>
  )
}

/* ================================================================== */
/* 4 · THE ARTS DESERVE RESPECT — the candle. Only its flame breathes. */
/* ================================================================== */
function SceneArts() {
  return (
    <Stage label="the candle">
      <svg viewBox="0 0 220 300" className="h-[clamp(230px,40vh,420px)] w-auto" aria-hidden="true">
        {/* the books beneath */}
        <rect x="52" y="246" width="116" height="16" rx="2" fill="rgba(92,18,36,0.75)" />
        <rect x="60" y="230" width="100" height="16" rx="2" fill="rgba(92,18,36,0.55)" />
        <line x1="60" y1="238" x2="152" y2="238" stroke="rgba(184,145,70,0.3)" strokeWidth="1" />
        {/* the saucer */}
        <ellipse cx="110" cy="262" rx="46" ry="8" fill="none" stroke="rgba(184,145,70,0.4)" strokeWidth="1.2" />
        {/* the candle */}
        <rect x="96" y="140" width="28" height="104" rx="3" fill="#EFE8DD" />
        <rect x="96" y="140" width="28" height="104" rx="3" fill="none" stroke="rgba(59,13,23,0.35)" strokeWidth="1" />
        <path d="M 100 208 q 2 10 4 24 M 120 212 q -1 8 -2 20" stroke="rgba(184,145,70,0.5)" strokeWidth="1.4" fill="none" />
        {/* the wick */}
        <line x1="110" y1="140" x2="110" y2="130" stroke="#3B0D17" strokeWidth="2" />
        {/* the flame — the arts, burning */}
        <g className="sig-flame2">
          <path d="M 110 128 C 100 112, 108 96, 110 86 C 112 96, 120 112, 110 128 Z" fill="rgba(184,145,70,0.85)" />
          <path d="M 110 124 C 104 114, 108 102, 110 96 C 112 102, 116 114, 110 124 Z" fill="rgba(248,246,242,0.75)" />
          <circle cx="110" cy="104" r="34" fill="rgba(184,145,70,0.07)" />
        </g>
      </svg>
    </Stage>
  )
}

/* ================================================================== */
/* 5 · HOPE BECOMES MYTHOLOGY — a single light across dark water,      */
/* guttering like the dream that was never real.                       */
/* ================================================================== */
function SceneHope() {
  return (
    <Stage label="the light">
      <div className="relative h-[clamp(180px,30vh,320px)] w-[min(78vw,480px)]">
        {/* the water */}
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1/2 bg-[linear-gradient(180deg,rgba(28,28,28,0.2),rgba(8,3,7,0.92))]" />
        <span aria-hidden="true" className="absolute inset-x-10 bottom-1/2 h-px bg-[linear-gradient(90deg,transparent,rgba(184,145,70,0.35),transparent)]" />
        {/* the light and its reflection — one object, breathing */}
        <div className="sig-farlight absolute left-1/2 top-[30%] -translate-x-1/2">
          <span aria-hidden="true" className="block h-2 w-2 rounded-full bg-gold shadow-[0_0_18px_5px_rgba(184,145,70,0.55)]" />
          <span aria-hidden="true" className="mx-auto mt-2 block h-10 w-px bg-[linear-gradient(180deg,rgba(184,145,70,0.7),rgba(184,145,70,0.05))]" />
        </div>
        {/* a thread of smoke, still */}
        <svg viewBox="0 0 40 30" className="absolute bottom-[46%] left-1/2 h-20 w-14 -translate-x-1/2" aria-hidden="true">
          <path d="M2 26 C 8 18, 12 28, 18 20 C 24 12, 28 22, 34 14" fill="none" stroke="rgba(184,145,70,0.35)" strokeWidth="1" strokeLinecap="round" />
        </svg>
      </div>
    </Stage>
  )
}

/* ================================================================== */
/* 6 · A STUDENT'S WORTH — a canvas in a gold frame; one brushstroke   */
/* paints itself slowly — worth, made visible.                        */
/* ================================================================== */
function ScenePainting({ anim }: { anim: boolean }) {
  const { ref, show } = useShow(anim)
  return (
    <Stage label="the painting">
      <div ref={ref} className="relative">
        {/* the spotlight, still */}
        <span aria-hidden="true" className="pointer-events-none absolute -top-14 left-1/2 h-36 w-64 -translate-x-1/2 bg-[radial-gradient(50%_60%_at_50%_0%,rgba(248,246,242,0.1),transparent_72%)]" />
        <svg viewBox="0 0 260 300" className="h-[clamp(220px,38vh,400px)] w-auto" aria-hidden="true">
          {/* the frame */}
          <rect x="30" y="30" width="200" height="240" fill="none" stroke="rgba(184,145,70,0.7)" strokeWidth="4" />
          <rect x="38" y="38" width="184" height="224" fill="rgba(248,246,242,0.06)" />
          {/* the brush, resting against the frame */}
          <line x1="212" y1="270" x2="240" y2="120" stroke="#C98A6B" strokeWidth="5" strokeLinecap="round" />
          <line x1="240" y1="120" x2="245" y2="104" stroke="rgba(184,145,70,0.9)" strokeWidth="4" strokeLinecap="round" />
          {/* the stroke — paints itself once, then holds */}
          <motion.path
            d="M 62 180 C 100 150, 140 210, 200 150"
            fill="none"
            stroke="#B89146"
            strokeWidth="3"
            strokeLinecap="round"
            initial={anim ? { pathLength: 0, opacity: 0 } : false}
            animate={show ? { pathLength: 1, opacity: 1 } : undefined}
            transition={{ duration: 9, ease: 'easeInOut' }}
          />
        </svg>
      </div>
    </Stage>
  )
}

/* ================================================================== */
/* 7 · TASBIH-E-FATIMA — the string of beads; one bead travels it,     */
/* counting the prayer in the dark.                                    */
/* ================================================================== */
function SceneTasbih() {
  return (
    <Stage label="the beads">
      <svg viewBox="0 0 480 300" className="h-[clamp(180px,30vh,320px)] w-auto" aria-hidden="true">
        {/* the string */}
        <path id="tasbih-arc" d="M 70 150 Q 240 30 410 150" fill="none" stroke="rgba(184,145,70,0.35)" strokeWidth="1.4" />
        {/* the fixed beads */}
        {[
          [85, 142], [116, 112], [150, 86], [186, 68], [224, 62], [262, 68], [298, 86], [332, 112], [363, 142],
        ].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={i === 4 ? 5 : 3.6} fill={i === 4 ? 'rgba(184,145,70,0.85)' : 'rgba(184,145,70,0.45)'} />
        ))}
        {/* the tassel */}
        <path d="M 240 66 l 0 22 M 234 86 l 12 0 M 232 88 l 16 0 M 232 92 l 16 0" stroke="rgba(184,145,70,0.5)" strokeWidth="1.2" />
        {/* the travelling bead — the only motion */}
        <circle className="sig-bead2" cx="70" cy="150" r="6" fill="#B89146" style={{ offsetPath: 'path("M 70 150 Q 240 30 410 150")', filter: 'drop-shadow(0 0 6px rgba(184,145,70,0.9))' }} />
      </svg>
    </Stage>
  )
}

/* ================================================================== */
/* 8 · INTELLECT LOST TO CODE — a blank page, ruled and waiting; a     */
/* caret blinks at the top. The machine has nothing you need.          */
/* ================================================================== */
function SceneCode() {
  return (
    <Stage label="the blank page">
      <div className="flex flex-col items-center gap-7">
        <p aria-hidden="true" className="font-mono text-[11px] tracking-[0.24em] text-white/40">// think beyond</p>
        <svg viewBox="0 0 240 300" className="h-[clamp(190px,32vh,340px)] w-auto" aria-hidden="true">
          <rect x="20" y="20" width="200" height="260" fill="rgba(248,246,242,0.05)" stroke="rgba(184,145,70,0.4)" strokeWidth="1.2" />
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <line key={i} x1="40" y1={64 + i * 34} x2="200" y2={64 + i * 34} stroke="rgba(184,145,70,0.16)" strokeWidth="1" />
          ))}
          {/* the caret — the imagination, waiting to return */}
          <rect className="sig-caret" x="40" y="56" width="2" height="24" fill="#B89146" />
        </svg>
      </div>
    </Stage>
  )
}

/* ================================================================== */
/* 9 · FORGIVE ME, MOTHER — the letter folds shut, once, slowly.       */
/* ================================================================== */
function SceneLetter({ anim }: { anim: boolean }) {
  const { ref, show } = useShow(anim)
  return (
    <Stage label="the letter">
      <div ref={ref} style={{ perspective: 1100 }}>
        <svg viewBox="0 0 360 300" className="h-[clamp(200px,34vh,360px)] w-auto" aria-hidden="true">
          {/* the desk */}
          <line x1="30" y1="252" x2="330" y2="252" stroke="rgba(184,145,70,0.2)" strokeWidth="1" />
          {/* the letter's body */}
          <rect x="80" y="96" width="200" height="150" fill="#F2EADA" stroke="rgba(59,13,23,0.3)" strokeWidth="1" />
          {/* the fold crease */}
          <line x1="80" y1="96" x2="280" y2="96" stroke="rgba(59,13,23,0.4)" strokeWidth="1" />
          {/* the flap — folds down once */}
          <motion.g
            initial={anim ? { rotateX: 0 } : false}
            animate={show ? { rotateX: -172 } : undefined}
            transition={{ duration: 12, ease: [0.45, 0.05, 0.55, 0.95] }}
            style={{ transformOrigin: '50% 0%', transformStyle: 'preserve-3d' }}
          >
            <path d="M 80 96 L 280 96 L 180 148 Z" fill="#EFE8DD" stroke="rgba(59,13,23,0.3)" strokeWidth="1" />
          </motion.g>
          {/* the address, still */}
          <text x="180" y="140" textAnchor="middle" fontFamily="Georgia, serif" fontStyle="italic" fontSize="15" fill="rgba(59,13,23,0.55)">to my mother</text>
          <line x1="120" y1="162" x2="240" y2="162" stroke="rgba(59,13,23,0.25)" strokeWidth="1" />
          <line x1="120" y1="180" x2="230" y2="180" stroke="rgba(59,13,23,0.2)" strokeWidth="1" />
          <line x1="120" y1="198" x2="236" y2="198" stroke="rgba(59,13,23,0.2)" strokeWidth="1" />
          {/* the wax seal */}
          <circle cx="180" cy="246" r="12" fill="#5C1224" stroke="rgba(242,234,218,0.4)" strokeWidth="1.4" />
          <text x="180" y="250" textAnchor="middle" fontFamily="Georgia, serif" fontStyle="italic" fontSize="10" fill="#F2EADA">VM</text>
        </svg>
      </div>
    </Stage>
  )
}

/* ================================================================== */
/* 10 · WATER CAT — the cat above the water. It blinks once, and       */
/* flicks one ear. Nothing else moves.                                 */
/* ================================================================== */
function SceneCat() {
  return (
    <Stage label="the cat">
      <svg viewBox="0 0 360 300" className="h-[clamp(190px,32vh,340px)] w-auto" aria-hidden="true">
        {/* the water line */}
        <line x1="40" y1="248" x2="320" y2="248" stroke="rgba(184,145,70,0.35)" strokeWidth="1.2" />
        {/* the cat */}
        <g>
          {/* the body */}
          <path d="M 130 248 C 120 200, 150 178, 180 176 C 210 178, 240 200, 230 248 Z" fill="none" stroke="rgba(248,246,242,0.6)" strokeWidth="1.6" />
          {/* the tail */}
          <path d="M 222 244 C 260 236, 262 210, 246 200" fill="none" stroke="rgba(248,246,242,0.5)" strokeWidth="1.4" />
          {/* the head */}
          <circle cx="180" cy="158" r="30" fill="none" stroke="rgba(248,246,242,0.6)" strokeWidth="1.6" />
          {/* the ears */}
          <g className="sig-cat-ear">
            <path d="M 158 134 L 166 106 L 178 128 Z" fill="none" stroke="rgba(248,246,242,0.6)" strokeWidth="1.5" strokeLinejoin="round" />
          </g>
          <path d="M 188 130 L 200 104 L 206 134 Z" fill="none" stroke="rgba(248,246,242,0.6)" strokeWidth="1.5" strokeLinejoin="round" />
          {/* the eyes — they blink, once, slowly */}
          <g className="sig-cat-eye">
            <ellipse cx="170" cy="156" rx="3.4" ry="4" fill="rgba(184,145,70,0.9)" />
          </g>
          <g className="sig-cat-eye" style={{ animationDelay: '0.4s' }}>
            <ellipse cx="190" cy="156" rx="3.4" ry="4" fill="rgba(184,145,70,0.9)" />
          </g>
          {/* the nose */}
          <path d="M 178 164 l 4 4 l 4 -4" fill="none" stroke="rgba(184,145,70,0.7)" strokeWidth="1.2" strokeLinejoin="round" />
        </g>
        {/* the reflection, faint and still */}
        <path d="M 130 254 C 140 268, 220 268, 230 254" fill="none" stroke="rgba(248,246,242,0.16)" strokeWidth="1" />
      </svg>
    </Stage>
  )
}

/* ================================================================== */
/* 11 · IF HOPE WERE A FEATHER — the feather drifts down, rests, and   */
/* is lifted again by a breeze.                                        */
/* ================================================================== */
function SceneFeather() {
  return (
    <Stage label="hope">
      <div className="relative h-[clamp(200px,34vh,360px)] w-[min(70vw,300px)] overflow-hidden">
        <svg viewBox="0 0 40 48" className="sig-feather h-16 w-auto text-gold/80" aria-hidden="true">
          <path d="M18 2 C 26 14, 28 28, 14 46" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M20 10 L6 14 M22 18 L8 22 M22 26 L10 30 M20 34 L12 36" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round" />
          <path d="M20 10 L30 12 M22 18 L32 20 M22 26 L30 28 M18 34 L24 34" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round" />
        </svg>
      </div>
    </Stage>
  )
}

/* ================================================================== */
/* 12 · THE HORRORS OF CSA — two hands cup a small light. The hands    */
/* stay still; the light breathes. Never the child's fault.            */
/* ================================================================== */
function SceneHands() {
  return (
    <Stage label="never the child's fault">
      <div className="relative h-[clamp(180px,30vh,320px)] w-[min(74vw,420px)]">
        {/* the hands — cupped, still */}
        <svg viewBox="0 0 420 240" className="h-full w-full" aria-hidden="true">
          <path d="M 40 220 C 90 120, 180 70, 210 84 C 240 70, 330 120, 380 220" fill="none" stroke="rgba(248,246,242,0.55)" strokeWidth="2" strokeLinecap="round" />
          <path d="M 84 214 C 120 150, 178 116, 210 120 C 242 116, 300 150, 336 214" fill="none" stroke="rgba(248,246,242,0.4)" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
        {/* the light — the only life */}
        <div className="sig-protect absolute left-1/2 top-[38%] -translate-x-1/2">
          <span aria-hidden="true" className="block h-4 w-4 rounded-full bg-gold shadow-[0_0_26px_10px_rgba(184,145,70,0.55)]" />
        </div>
      </div>
    </Stage>
  )
}

/* ================================================================== */
/* 13 · KHAGEENA — a resting bowl; the steam of the pause rises.       */
/* ================================================================== */
function SceneSteam() {
  return (
    <Stage label="the pause">
      <svg viewBox="0 0 260 260" className="h-[clamp(190px,32vh,340px)] w-auto" aria-hidden="true">
        {/* the steam — the pause, rising */}
        {[0, 1, 2].map((i) => (
          <path
            key={i}
            className="sig-steam2"
            d={['M 92 128 C 100 108, 88 96, 96 76', 'M 130 128 C 138 108, 126 96, 134 76', 'M 168 128 C 176 108, 164 96, 172 76'][i]}
            fill="none" stroke="rgba(248,246,242,0.5)" strokeWidth="1.2" strokeLinecap="round"
          />
        ))}
        {/* the bowl */}
        <path d="M 40 128 C 40 172, 220 172, 220 128 Z" fill="none" stroke="rgba(184,145,70,0.5)" strokeWidth="1.4" />
        <ellipse cx="130" cy="128" rx="90" ry="12" fill="none" stroke="rgba(184,145,70,0.35)" strokeWidth="1" />
        {/* the rim of the pause */}
        <line x1="130" y1="128" x2="130" y2="140" stroke="rgba(184,145,70,0.3)" strokeWidth="1" />
      </svg>
    </Stage>
  )
}

/* ================================================================== */
/* 14 · BEHIND EVERY HEADLINE — the single photograph.
   The Kashmir photo from the dispatch — the people protesting. It fades
   in, holds, then the whole scene fades away; FIN. Quiet, respectful:
   behind every headline are real people. — */
function SceneHeadline({ anim }: { anim: boolean }) {
  const { ref, show } = useShow(anim)
  return (
    <div ref={ref} className={`relative flex min-h-[70vh] flex-col items-center justify-center overflow-hidden ${show ? 'vm-live' : ''}`}>
      {/* the headline — the article's own line, one unbroken sentence */}
      <motion.p
        aria-hidden="true"
        initial={anim ? { opacity: 0 } : false}
        animate={show ? { opacity: 1 } : undefined}
        transition={{ delay: 0.5, duration: 1.6, ease: 'easeOut' }}
        className="mb-10 max-w-[min(86vw,720px)] text-center font-serif text-[clamp(1.15rem,2.3vw,1.7rem)] font-light italic leading-[1.5] tracking-[0.04em] text-ivory"
      >
        Behind every headline are real people
      </motion.p>

      {/* the photograph — Kashmir, the people protesting */}
      <motion.div
        className="relative h-[clamp(240px,40vh,420px)] w-[min(80vw,600px)]"
        initial={anim ? { opacity: 1 } : false}
        animate={show ? { opacity: [1, 1, 0] } : undefined}
        transition={{ delay: 1, duration: 12, times: [0, 0.7, 1], ease: 'easeInOut' }}
      >
        <motion.figure
          className="absolute inset-0"
          initial={anim ? { opacity: 0 } : false}
          animate={show ? { opacity: 1 } : undefined}
          transition={{ delay: 1, duration: 2, ease: 'easeOut' }}
        >
          <img
            src="/img/inner/kashmir-photo.webp"
            alt=""
            aria-hidden="true"
            loading="lazy"
            decoding="async"
            draggable={false}
            className="h-full w-full border border-white/12 object-cover"
          />
          <figcaption className="mt-3 text-center font-mono text-[9px] uppercase tracking-[0.30em] text-white/50">
            Kashmir — the people protesting
          </figcaption>
        </motion.figure>
      </motion.div>

      {/* FIN — appears once the photograph has faded */}
      <motion.p
        aria-hidden="true"
        initial={anim ? { opacity: 0 } : false}
        animate={show ? { opacity: 1 } : undefined}
        transition={{ delay: 14, duration: 2, ease: 'easeOut' }}
        className="mt-12 text-center font-mono text-[10px] uppercase tracking-[0.34em] text-white/35"
      >
        fin.
      </motion.p>
    </div>
  )
}


/* ================================================================== */
/* 15 · JALDI — the word draws itself and fades; the light in the      */
/* window stays on. The action words can't reach.                      */
/* ================================================================== */
function SceneJaldi({ anim }: { anim: boolean }) {
  const { ref, show } = useShow(anim)
  return (
    <Stage label="the word that reaches">
      <div ref={ref} className="flex flex-col items-center gap-10">
        <motion.div
          className="flex flex-col items-center"
          initial={anim ? { opacity: 0 } : false}
          animate={show ? { opacity: 1 } : undefined}
          transition={{ duration: 3, ease: 'easeOut' }}
        >
          <p aria-hidden="true" className="font-serif text-5xl font-light italic text-ivory/90">jaldi</p>
          <svg viewBox="0 0 120 16" className="mt-2 h-4 w-28" aria-hidden="true">
            <motion.path
              d="M6 8 C 40 2, 80 14, 114 6"
              fill="none" stroke="#B89146" strokeWidth="1.6" strokeLinecap="round"
              initial={anim ? { pathLength: 0 } : false}
              animate={show ? { pathLength: 1 } : undefined}
              transition={{ duration: 4, delay: 2.2, ease: 'easeInOut' }}
            />
          </svg>
        </motion.div>
        {/* the window — the act that words can't reach */}
        <div className="relative h-20 w-20 border border-gold/40">
          <span aria-hidden="true" className="sig-window2 absolute inset-2 bg-[radial-gradient(70%_70%_at_50%_50%,rgba(184,145,70,0.5),rgba(184,145,70,0.08))]" />
        </div>
      </div>
    </Stage>
  )
}

/* ================================================================== */
/* 16 · FAILURE — a small light climbs three steps, resting on each,   */
/* and waits at the top.                                               */
/* ================================================================== */
function SceneSteps() {
  return (
    <Stage label="one step at a time">
      <div className="relative h-[clamp(180px,30vh,320px)] w-[min(60vw,240px)]">
        {/* the steps, still */}
        {[0, 1, 2].map((i) => (
          <svg key={i} viewBox="0 0 120 12" className="absolute left-0 w-24" style={{ bottom: i * 52 + 14 }} aria-hidden="true">
            <path d="M 4 10 L 116 10" stroke="rgba(184,145,70,0.45)" strokeWidth="1.4" />
          </svg>
        ))}
        {/* the climber */}
        <span aria-hidden="true" className="sig-climber2 absolute bottom-[26px] left-1/2 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-gold shadow-[0_0_14px_4px_rgba(184,145,70,0.55)]" />
      </div>
    </Stage>
  )
}

/* ================================================================== */
/* 17 · MY LAST BREATH — the bud opens; a bird crosses the sky.        */
/* Then the dark. Let me fly away.                                     */
/* ================================================================== */
function SceneCycle() {
  return (
    <Stage label="the cycle">
      <div className="relative h-[clamp(180px,30vh,320px)] w-[min(76vw,420px)] overflow-hidden">
        {/* the bud, opening */}
        <svg viewBox="0 0 60 56" className="sig-cycle-bud absolute left-1/2 top-1/2 h-20 w-auto -translate-x-1/2 -translate-y-1/2" aria-hidden="true">
          <path d="M30 4 C 48 14, 48 36, 30 52 C 12 36, 12 14, 30 4 Z" fill="rgba(184,145,70,0.5)" />
          <path d="M30 10 C 40 18, 40 34, 30 46 C 20 34, 20 18, 30 10 Z" fill="rgba(248,246,242,0.35)" />
        </svg>
        {/* the bird, crossing once */}
        <svg viewBox="0 0 60 24" className="sig-cycle-bird absolute left-1/2 top-1/3 h-10 w-24 -translate-x-1/2" aria-hidden="true">
          <path d="M6 18 C 14 8, 24 6, 30 13 C 36 6, 46 8, 54 18" fill="none" stroke="rgba(248,246,242,0.65)" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </div>
    </Stage>
  )
}

/* ================================================================== */
/* 18 · THE GARDEN BEYOND MY TOWER — the tower's window stays lit;     */
/* petals drift past it. She prays.                                    */
/* ================================================================== */
function SceneGarden() {
  return (
    <Stage label="she prays">
      <div className="relative flex h-[clamp(200px,34vh,360px)] w-[min(76vw,360px)] items-end justify-center overflow-hidden">
        {/* the tower, still */}
        <svg viewBox="0 0 120 200" className="h-full w-auto" aria-hidden="true">
          <path d="M45 190 L45 74 L60 56 L75 74 L75 190 Z" fill="none" stroke="rgba(248,246,242,0.4)" strokeWidth="1.4" />
          <rect x="52" y="80" width="16" height="20" fill="none" stroke="rgba(248,246,242,0.3)" strokeWidth="1" />
          {/* the lit window — steady, never blinking; only the petals move */}
          <rect x="54" y="83" width="12" height="14" fill="rgba(184,145,70,0.65)" />
        </svg>
        {/* the petals, passing the window */}
        <div className="pointer-events-none absolute inset-0">
          {[0, 1, 2].map((i) => (
            <span key={i} aria-hidden="true" className="sig-petal2 absolute left-1/2 top-0 block h-4 w-2 -translate-x-1/2 rounded-[50%] bg-gold/40" style={{ marginLeft: (i - 1) * 44 }} />
          ))}
        </div>
        {/* the garden, blooming below */}
        <div className="absolute bottom-4 flex items-end gap-4">
          {[0, 1, 2, 3, 4].map((i) => (
            <span key={i} aria-hidden="true" className="block h-1.5 w-1.5 rounded-full bg-gold/60" style={{ marginBottom: i % 2 ? 7 : 0 }} />
          ))}
        </div>
      </div>
    </Stage>
  )
}

const SIGNATURES: Record<string, { name: string; ownFin?: boolean; scene: (anim: boolean) => ReactNode }> = {
  'their-voices-matter': { name: 'the voice', ownFin: true, scene: (anim) => <SceneVoices anim={anim} /> },
  '3-13': { name: 'the wait', scene: () => <SceneClock /> },
  'the-empty-waltz': { name: 'one, two, three', scene: (anim) => <SceneWaltz anim={anim} /> },
  'the-arts-deserve-respect': { name: 'the candle', scene: () => <SceneArts /> },
  'hope-becomes-mythology': { name: 'the light', scene: () => <SceneHope /> },
  'a-students-worth': { name: 'the painting', scene: (anim) => <ScenePainting anim={anim} /> },
  'tasbih-e-fatima': { name: 'the beads', scene: () => <SceneTasbih /> },
  'intellect-lost-to-code': { name: 'the blank page', scene: () => <SceneCode /> },
  'forgive-me-mother': { name: 'the letter', scene: (anim) => <SceneLetter anim={anim} /> },
  'water-cat': { name: 'the cat', scene: () => <SceneCat /> },
  'if-hope-were-a-feather': { name: 'hope', scene: () => <SceneFeather /> },
  'the-horrors-of-child-sexual-abuse': { name: "never the child's fault", scene: () => <SceneHands /> },
  khageena: { name: 'the pause', scene: () => <SceneSteam /> },
  'behind-every-headline': { name: 'the people', ownFin: true, scene: (anim) => <SceneHeadline anim={anim} /> },
  jaldi: { name: 'the word that reaches', scene: (anim) => <SceneJaldi anim={anim} /> },
  failure: { name: 'one step at a time', scene: () => <SceneSteps /> },
  'my-last-breath': { name: 'the cycle', scene: () => <SceneCycle /> },
  'the-garden-beyond-my-tower': { name: 'she prays', scene: () => <SceneGarden /> },
}

export default function ArticleSignature({ article }: { article: Article }) {
  const reduce = useReducedMotion()
  const sig = SIGNATURES[article.id]
  if (!sig) return null
  const anim = !reduce
  return (
    <section
      aria-hidden="true"
      data-signature={article.id}
      className="relative overflow-hidden border-t border-white/10"
    >
      <div className="mx-auto max-w-page px-[clamp(1.75rem,5.5vw,4.75rem)] py-[clamp(8rem,18vh,14rem)]">
        <div className={anim ? 'sig-anim' : ''}>
          {sig.scene(anim)}
          {!sig.ownFin && <Fin />}
        </div>
      </div>
    </section>
  )
}
