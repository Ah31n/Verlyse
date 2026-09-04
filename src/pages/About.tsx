import { motion } from 'framer-motion'
import { useSeo } from '../hooks/useSeo'
import { Link } from 'react-router-dom'
import { BRAND, COMMUNITY_STATS } from '../data/content'

/**
 * THE COLOPHON — the quiet institutional record of Verlyse Media, from the
 * approved Penpot board P27 / THE COLOPHON.
 *
 * BACK  · quiet dim room — the least wash of any space
 * MID   · three layered editorial sheets: THE MISSION · PRINCIPLES ·
 *         MILESTONES (offset paper, brass hairline, no dashboard boxes)
 * FRONT · the colophon imprint — VERLYSE MEDIA · WHERE VISION BECOMES A
 *         VOICE · set by hand in the keeping room · the door is open
 *
 * The quietest room in the publication. States: READ · RETURN.
 */
export default function About() {
  useSeo({
    path: '/about',
    title: 'About',
    description: 'About Verlyse Media — where vision becomes a voice. Submissions presented with credit, care and transparency.',
  })

  const principles = [
    { n: 'I', t: 'Creator credit', d: 'All 19 features name their writers, by name and handle. The byline is not a courtesy; it is the point.' },
    { n: 'II', t: 'The conversation', d: `${COMMUNITY_STATS[2].value} comments beneath the features, all of them read, several quoted on the community page.` },
    { n: 'III', t: 'Tools disclosed', d: BRAND.disclosure },
    { n: 'IV', t: 'The door is open', d: 'Every feature began as a submission. The next one could be yours.' },
  ]

  const milestones = [
    { date: 'Before', title: 'The reason', desc: 'Alina worked where her effort went unrecognised — she built the platform she wished existed.' },
    { date: '26.06.2026', title: 'The feed opens', desc: '“Their Voices Matter” — a call for Afghan women’s rights, written by the founder.' },
    { date: '30.06.2026', title: 'The first submitted feature', desc: 'Shaza Fatima’s essay on why the arts deserve respect.' },
    { date: '07.07.2026', title: '“Meet Alina Javed”', desc: 'A feature on the founder, at sixteen.' },
    { date: 'Now', title: 'The record', desc: '19 features · 15 creators · 1281 appreciations · 585 conversations.' },
  ]

  return (
    <div className="relative overflow-hidden bg-wine-deep">
      {/* ——— BACK · quiet dim room — the least wash of any space ——— */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(110%_80%_at_50%_0%,rgba(92,18,36,0.30),transparent_60%),radial-gradient(80%_60%_at_88%_100%,rgba(184,145,70,0.07),transparent_60%),linear-gradient(175deg,#3E0D17_0%,#2A0F18_55%,#17060C_100%)]" />
      </div>

      <div className="relative mx-auto max-w-[1080px] px-[clamp(1.25rem,4vw,4.75rem)] pb-[clamp(4rem,9vh,7rem)] pt-[clamp(7rem,15vh,9.5rem)]">
        {/* ——— header — ghost COLOPHON, quiet ——— */}
        <div className="text-center">
          <h1 className="relative font-serif text-[clamp(2.6rem,7vw,5.5rem)] font-light leading-[0.92] tracking-[-0.02em] text-ivory">
            <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 select-none font-serif text-[clamp(4rem,11vw,8.5rem)] font-semibold leading-none text-transparent [-webkit-text-stroke:1px_rgba(184,145,70,0.13)]">
              COLOPHON
            </span>
            <span className="relative">The <em className="italic text-gold">colophon</em></span>
          </h1>
          <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.34em] text-gold/80">
            The colophon — the institutional record of Verlyse Media
          </p>
        </div>

        {/* ——— MID · the layered editorial sheets ——— */}
        <div className="mt-[clamp(3rem,8vh,5rem)] space-y-6">
          {/* Sheet I — The Mission */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '0px 0px -6% 0px' }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="relative border border-gold/20 bg-[#F8F6F2]/[0.05] p-7 backdrop-blur-[1px] md:p-10"
          >
            <span aria-hidden="true" className="absolute inset-0 translate-x-2 translate-y-2 border border-gold/10" />
            <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-gold">The mission — Sheet I</p>
            <p className="mt-5 max-w-[68ch] font-serif text-[clamp(1.15rem,2vw,1.5rem)] font-light italic leading-[1.8] text-ivory/90">
              {BRAND.mission}
            </p>
          </motion.section>

          {/* Sheet II — Principles */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '0px 0px -6% 0px' }}
            transition={{ duration: 0.9, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="relative border border-gold/20 bg-[#F8F6F2]/[0.05] p-7 md:p-10"
          >
            <span aria-hidden="true" className="absolute inset-0 -translate-x-2 translate-y-2 border border-gold/10" />
            <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-gold">Principles — Sheet II</p>
            <div className="mt-6 grid grid-cols-1 gap-x-10 gap-y-7 md:grid-cols-2">
              {principles.map((p) => (
                <div key={p.n} className="border-l border-gold/40 pl-5">
                  <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-gold/90">{p.n} · {p.t}</p>
                  <p className="mt-2 max-w-[46ch] text-sm leading-[1.8] text-white/70">{p.d}</p>
                </div>
              ))}
            </div>
          </motion.section>

          {/* Sheet III — Milestones */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '0px 0px -6% 0px' }}
            transition={{ duration: 0.9, delay: 0.14, ease: [0.16, 1, 0.3, 1] }}
            className="relative border border-gold/20 bg-[#F8F6F2]/[0.05] p-7 md:p-10"
          >
            <span aria-hidden="true" className="absolute inset-0 translate-x-1 -translate-y-2 border border-gold/10" />
            <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-gold">Milestones — Sheet III</p>
            <div className="mt-6 border-t border-white/10">
              {milestones.map((m) => (
                <div key={m.date} className="grid grid-cols-1 items-baseline gap-1 border-b border-white/10 py-5 sm:grid-cols-[110px_1fr] sm:gap-6">
                  <p className="font-mono text-[9px] uppercase tracking-[0.26em] text-gold/90">{m.date}</p>
                  <p className="text-[15px] leading-[1.75] text-white/75">
                    <span className="font-serif italic text-ivory/90">{m.title}</span> — {m.desc}
                  </p>
                </div>
              ))}
            </div>
          </motion.section>
        </div>

        {/* ——— FRONT · the colophon imprint ——— */}
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '0px 0px -6% 0px' }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="mt-[clamp(3.5rem,9vh,6rem)] border-t border-gold/20 pt-12 text-center"
          aria-label="The colophon imprint"
        >
          <p className="font-mono text-[9px] uppercase tracking-[0.34em] text-gold/80">The colophon imprint</p>
          <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.34em] text-gold">
            Verlyse Media — Where Vision Becomes A Voice
          </p>
          <p className="mx-auto mt-6 max-w-[40ch] font-serif text-[clamp(1.3rem,2.2vw,1.7rem)] font-light italic leading-[1.7] text-ivory/85">
            Set by hand in the keeping room — every voice credited, every tool disclosed, nothing invented.
          </p>
          <p className="mt-3 font-mono text-[8px] uppercase tracking-[0.3em] text-white/45">
            Set in Cormorant Garamond, Inter, and IBM Plex Mono
          </p>
          <div className="mx-auto mt-8 h-px w-24 bg-gold/50" aria-hidden="true" />
          <p className="mt-6 font-mono text-[9px] uppercase tracking-[0.3em] text-white/55">
            Alina Javed — founder, sixteen · the door is open
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-8">
            <Link to="/submit" className="btn btn-gold">Send your work</Link>
            <Link to="/contact" className="border-b border-gold/60 pb-1 font-mono text-[10px] uppercase tracking-[0.28em] text-gold no-underline transition-colors hover:text-ivory">
              Write to the desk →
            </Link>
          </div>
        </motion.section>
      </div>
    </div>
  )
}
