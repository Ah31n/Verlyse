import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  ARTICLES,
  AUTHORS,
  CATEGORIES,
  LEDGER,
} from '../data/content'
import {
  EditorialFolio,
  EditorialLabel,
  EditorialRule,
  FolioCard,
  PullQuotePlate,
  ArticleHero,
} from '../components/editorial'
import {
  ArchiveObject,
} from '../components/archive'
import {
  ContributorCard,
} from '../components/contributors'
import {
  SpotlightCard,
  MagneticControl,
} from '../components/interaction'
import {
  ArchivalSeal,
  ChapterDivider,
} from '../components/editorial/GenerativeGraphics'
import {
  MotifDivider,
} from '../components/ui/ArticleClosing'
import {
  MOTION_SPEED,
  MOTION_DISTANCE,
  MOTION_EASE,
  MAGNETIC_STRENGTH,
  SPOTLIGHT_CONFIG,
} from '../components/interaction/physics'

/**
 * Verlyse Media — Design Lab & Component Sandbox
 * Development-only testbed for evaluating interaction intelligence, compound components,
 * typography hierarchy, cursor modes, and physics.
 * (Excluded from SEO, sitemap, and public navigation).
 */
export default function Lab() {
  const [activeTab, setActiveTab] = useState<
    | 'typography'
    | 'buttons'
    | 'compound'
    | 'cursor'
    | 'spotlight'
    | 'portraits'
    | 'graphics'
    | 'forms'
    | 'motion'
  >('compound')

  const [testDimmed, setTestDimmed] = useState<number | null>(null)
  const [reducedMotionSim, setReducedMotionSim] = useState(false)
  const [formSubmitted, setFormSubmitted] = useState(false)
  const [inputText, setInputText] = useState('')

  const sampleArticle = ARTICLES[0]

  useEffect(() => {
    document.title = 'Design Lab — Verlyse Component System'
    // Ensure lab is excluded from indexing
    const meta = document.createElement('meta')
    meta.name = 'robots'
    meta.content = 'noindex, nofollow'
    document.head.appendChild(meta)
    return () => {
      document.head.removeChild(meta)
    }
  }, [])

  return (
    <div className="min-h-screen bg-[#1A060C] text-ivory py-16 px-4 sm:px-8">
      {/* Top Lab Header */}
      <div className="mx-auto max-w-7xl border-b border-gold/30 pb-8 mb-12">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-gold">
              <span className="inline-block h-2 w-2 rounded-full bg-gold animate-pulse" />
              <span>Verlyse Design Intelligence Lab</span>
              <span className="text-white/30">/</span>
              <span className="text-white/50">Internal Component System</span>
            </div>
            <h1 className="mt-2 font-serif text-3xl md:text-5xl font-light text-ivory">
              Component Composition <em className="italic text-gold">&amp; Interaction Lab</em>
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setReducedMotionSim(!reducedMotionSim)}
              className={`px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.2em] border transition-colors ${
                reducedMotionSim
                  ? 'border-gold bg-gold text-[#1E0B12]'
                  : 'border-white/20 text-white/60 hover:border-gold/50'
              }`}
            >
              Simulate Reduced Motion: {reducedMotionSim ? 'ON' : 'OFF'}
            </button>
            <Link
              to="/"
              className="border border-gold/40 px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-gold hover:bg-gold/10"
            >
              ← Back to Cover
            </Link>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mt-8 flex flex-wrap gap-2 border-t border-white/10 pt-4">
          {[
            { id: 'compound', label: '1. Compound Objects' },
            { id: 'typography', label: '2. Typography Voices' },
            { id: 'cursor', label: '3. Contextual Cursor' },
            { id: 'buttons', label: '4. Buttons & Magnetic' },
            { id: 'spotlight', label: '5. Key-Lighting & Spotlight' },
            { id: 'portraits', label: '6. Contributor Portraits' },
            { id: 'graphics', label: '7. Generative Graphics' },
            { id: 'forms', label: '8. Tactile Forms' },
            { id: 'motion', label: '9. Motion Tokens' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.22em] transition-all ${
                activeTab === tab.id
                  ? 'bg-gold/20 text-gold border-b-2 border-gold font-semibold'
                  : 'text-white/60 hover:text-ivory hover:bg-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <main className="mx-auto max-w-7xl">
        {/* TAB 1: COMPOUND OBJECTS */}
        {activeTab === 'compound' && (
          <section className="space-y-16">
            <div>
              <EditorialLabel variant="kicker">Compound Object 01</EditorialLabel>
              <h2 className="font-serif text-2xl text-ivory mt-1 mb-6">
                Editorial Folio Card (<code className="font-mono text-sm text-gold">&lt;FolioCard /&gt;</code>)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FolioCard article={ARTICLES[0]} folioIndex={0} variant="standard" />
                <FolioCard article={ARTICLES[1]} folioIndex={1} variant="standard" />
                <FolioCard article={ARTICLES[2]} folioIndex={2} variant="standard" />
              </div>

              <div className="mt-8">
                <EditorialLabel variant="marginalia">Horizontal Layout Variant</EditorialLabel>
                <div className="mt-4">
                  <FolioCard article={ARTICLES[3]} folioIndex={3} variant="horizontal" />
                </div>
              </div>
            </div>

            <EditorialRule variant="brass" fleuron />

            <div>
              <EditorialLabel variant="kicker">Compound Object 02</EditorialLabel>
              <h2 className="font-serif text-2xl text-ivory mt-1 mb-6">
                Archive Matrix Item (<code className="font-mono text-sm text-gold">&lt;ArchiveObject /&gt;</code>) with Hover Recession
              </h2>
              <p className="font-serif text-sm italic text-white/60 mb-6">
                Hovering an archive tile focuses it while gracefully receding neighboring stories.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {ARTICLES.slice(4, 7).map((art, idx) => (
                  <ArchiveObject
                    key={art.id}
                    article={art}
                    folioIndex={idx + 4}
                    isDimmed={testDimmed !== null && testDimmed !== idx}
                    onMouseEnter={() => setTestDimmed(idx)}
                    onMouseLeave={() => setTestDimmed(null)}
                  />
                ))}
              </div>
            </div>

            <EditorialRule variant="brass" fleuron />

            <div>
              <EditorialLabel variant="kicker">Compound Object 03</EditorialLabel>
              <h2 className="font-serif text-2xl text-ivory mt-1 mb-6">
                Pull-Quote Plate (<code className="font-mono text-sm text-gold">&lt;PullQuotePlate /&gt;</code>)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <PullQuotePlate
                  variant="wine"
                  quote="The arts are not a luxury of the comfortable; they are the record of our consciousness."
                  attribution="Shaza Fatima"
                  role="Essayist"
                  folioRef="FOLIO № 04"
                />
                <PullQuotePlate
                  variant="paper"
                  quote="At 3:13 in the morning, the silence carries a weight that daylight never confesses."
                  attribution="Anshujit Singh"
                  role="Writer"
                  folioRef="FOLIO № 02"
                />
              </div>
            </div>

            <EditorialRule variant="brass" fleuron />

            <div>
              <EditorialLabel variant="kicker">Compound Object 04</EditorialLabel>
              <h2 className="font-serif text-2xl text-ivory mt-1 mb-6">
                Master Article Hero (<code className="font-mono text-sm text-gold">&lt;ArticleHero /&gt;</code>)
              </h2>
              <div className="border border-gold/30 bg-[#25070F]/50 p-8 rounded-sm">
                <ArticleHero article={sampleArticle} folioNumber="01" />
              </div>
            </div>
          </section>
        )}

        {/* TAB 2: TYPOGRAPHY VOICES */}
        {activeTab === 'typography' && (
          <section className="space-y-12">
            <div className="border border-white/10 bg-[#25070F]/80 p-8">
              <EditorialLabel variant="kicker">Voice 01 · Editorial Authority</EditorialLabel>
              <h3 className="font-mono text-xs uppercase tracking-[0.24em] text-gold mt-1 mb-4">
                Cormorant Garamond (Literature, Philosophy, Titles, Pullquotes)
              </h3>
              <p className="font-serif text-4xl md:text-6xl font-light text-ivory leading-tight">
                Where vision becomes a voice.
              </p>
              <p className="mt-4 font-serif text-2xl italic font-light text-gold/90">
                “Every page in this magazine began as an empty one.”
              </p>
            </div>

            <div className="border border-white/10 bg-[#25070F]/80 p-8">
              <EditorialLabel variant="kicker">Voice 02 · Clarity &amp; Navigation</EditorialLabel>
              <h3 className="font-mono text-xs uppercase tracking-[0.24em] text-gold mt-1 mb-4">
                Inter (Function, Interface, Body, Buttons)
              </h3>
              <p className="font-sans text-base text-white/80 leading-relaxed max-w-2xl">
                The reading experience is built with meticulous attention to line length, optical kerning, and rhythmic baseline pacing to ensure longform literature remains effortless.
              </p>
            </div>

            <div className="border border-white/10 bg-[#25070F]/80 p-8">
              <EditorialLabel variant="kicker">Voice 03 · Institutional Ledger</EditorialLabel>
              <h3 className="font-mono text-xs uppercase tracking-[0.24em] text-gold mt-1 mb-4">
                IBM Plex Mono (Ledger, Dates, Coordinates, Taxonomy)
              </h3>
              <p className="font-mono text-sm text-gold/90 tracking-[0.26em] uppercase">
                FOLIO № {LEDGER.issueNo} · ISSUE {LEDGER.issueNo} · {LEDGER.features} FEATURES · {LEDGER.departments} WINGS · {LEDGER.creators} WRITERS
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                {CATEGORIES.map((c) => (
                  <span key={c.slug} className="border border-gold/30 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.2em] text-gold">
                    {c.motif} {c.name} ({c.count})
                  </span>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* TAB 3: CONTEXTUAL CURSOR */}
        {activeTab === 'cursor' && (
          <section className="space-y-8">
            <div className="border border-white/10 bg-[#25070F]/80 p-8">
              <EditorialLabel variant="kicker">Contextual Affordance Sandbox</EditorialLabel>
              <h2 className="font-serif text-2xl text-ivory mt-1 mb-4">
                Hover over the interactive targets below to test contextual cursor morphing
              </h2>
              <p className="font-serif text-sm italic text-white/60 mb-8">
                The cursor adapts its shape, scale, and mono label to communicate exact intent.
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div
                  data-cursor="article"
                  data-cursor-label="READ"
                  className="aspect-square border border-gold/40 bg-wine-deep/80 flex flex-col items-center justify-center p-4 text-center cursor-pointer hover:border-gold transition-colors"
                >
                  <span className="font-mono text-xs text-gold">data-cursor="article"</span>
                  <span className="font-serif text-lg text-ivory mt-2">Read Folio</span>
                </div>

                <div
                  data-cursor="room"
                  data-cursor-label="ENTER"
                  className="aspect-square border border-gold/40 bg-wine-deep/80 flex flex-col items-center justify-center p-4 text-center cursor-pointer hover:border-gold transition-colors"
                >
                  <span className="font-mono text-xs text-gold">data-cursor="room"</span>
                  <span className="font-serif text-lg text-ivory mt-2">Enter Spatial Room</span>
                </div>

                <div
                  data-cursor="image"
                  data-cursor-label="VIEW"
                  className="aspect-square border border-gold/40 bg-wine-deep/80 flex flex-col items-center justify-center p-4 text-center cursor-pointer hover:border-gold transition-colors"
                >
                  <span className="font-mono text-xs text-gold">data-cursor="image"</span>
                  <span className="font-serif text-lg text-ivory mt-2">Inspect Plate</span>
                </div>

                <div
                  data-cursor="archive"
                  data-cursor-label="OPEN"
                  className="aspect-square border border-gold/40 bg-wine-deep/80 flex flex-col items-center justify-center p-4 text-center cursor-pointer hover:border-gold transition-colors"
                >
                  <span className="font-mono text-xs text-gold">data-cursor="archive"</span>
                  <span className="font-serif text-lg text-ivory mt-2">Open Archive</span>
                </div>

                <div
                  data-cursor="drag"
                  data-cursor-label="DRAG"
                  className="aspect-square border border-gold/40 bg-wine-deep/80 flex flex-col items-center justify-center p-4 text-center cursor-pointer hover:border-gold transition-colors"
                >
                  <span className="font-mono text-xs text-gold">data-cursor="drag"</span>
                  <span className="font-serif text-lg text-ivory mt-2">3D Orbit / Drag</span>
                </div>

                <div
                  data-cursor="magnetic"
                  className="aspect-square border border-gold/40 bg-wine-deep/80 flex flex-col items-center justify-center p-4 text-center cursor-pointer hover:border-gold transition-colors"
                >
                  <span className="font-mono text-xs text-gold">data-cursor="magnetic"</span>
                  <span className="font-serif text-lg text-ivory mt-2">Magnetic Attraction</span>
                </div>

                <div
                  data-cursor="link"
                  className="aspect-square border border-gold/40 bg-wine-deep/80 flex flex-col items-center justify-center p-4 text-center cursor-pointer hover:border-gold transition-colors"
                >
                  <span className="font-mono text-xs text-gold">data-cursor="link"</span>
                  <span className="font-serif text-lg text-ivory mt-2">Standard Anchor</span>
                </div>

                <div
                  data-cursor="default"
                  className="aspect-square border border-white/20 bg-charcoal/80 flex flex-col items-center justify-center p-4 text-center cursor-pointer hover:border-white/40 transition-colors"
                >
                  <span className="font-mono text-xs text-white/50">data-cursor="default"</span>
                  <span className="font-serif text-lg text-white/70 mt-2">Resting State</span>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* TAB 4: BUTTONS & MAGNETIC */}
        {activeTab === 'buttons' && (
          <section className="space-y-12">
            <div className="border border-white/10 bg-[#25070F]/80 p-8">
              <EditorialLabel variant="kicker">Magnetic Physics Testing</EditorialLabel>
              <h2 className="font-serif text-2xl text-ivory mt-1 mb-6">
                3-Axis Spring Magnetic Triggers (<code className="font-mono text-sm text-gold">&lt;MagneticControl /&gt;</code>)
              </h2>

              <div className="flex flex-wrap items-center gap-8 py-8">
                <MagneticControl strength={MAGNETIC_STRENGTH.standard}>
                  <button className="btn btn-gold text-xs">
                    Primary Magnetic Button
                  </button>
                </MagneticControl>

                <MagneticControl strength={MAGNETIC_STRENGTH.hero}>
                  <button className="border border-gold px-6 py-3 font-mono text-[10px] uppercase tracking-[0.28em] text-gold hover:bg-gold/10 transition-colors">
                    Hero Magnetic Trigger (0.45x)
                  </button>
                </MagneticControl>

                <MagneticControl strength={MAGNETIC_STRENGTH.subtle}>
                  <span className="inline-block border-b border-gold/60 pb-1 font-mono text-[10px] uppercase tracking-[0.24em] text-gold cursor-pointer">
                    Subtle Magnetic Link →
                  </span>
                </MagneticControl>
              </div>
            </div>
          </section>
        )}

        {/* TAB 5: SPOTLIGHT */}
        {activeTab === 'spotlight' && (
          <section className="space-y-8">
            <div className="border border-white/10 bg-[#25070F]/80 p-8">
              <EditorialLabel variant="kicker">Radial Key-Lighting</EditorialLabel>
              <h2 className="font-serif text-2xl text-ivory mt-1 mb-6">
                StringTune Spotlight Surface (<code className="font-mono text-sm text-gold">&lt;SpotlightCard /&gt;</code>)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <SpotlightCard theme="dark" className="border border-gold/30 bg-[#20050B] p-8">
                  <span className="font-mono text-[9px] uppercase tracking-[0.24em] text-gold">Dark Wine Keylight</span>
                  <h3 className="font-serif text-3xl text-ivory mt-2">Warm 2800K Brass Ray</h3>
                  <p className="font-serif text-sm italic text-white/60 mt-3">
                    Tracks cursor coordinates across the element surface, dynamically casting a soft radiant brass beam.
                  </p>
                </SpotlightCard>

                <SpotlightCard theme="paper" className="border border-[#7C6338]/40 bg-[#F8F6F2] text-[#241D18] p-8">
                  <span className="font-mono text-[9px] uppercase tracking-[0.24em] text-[#7C6338]">Ivory Paper Keylight</span>
                  <h3 className="font-serif text-3xl text-[#241D18] mt-2">Subtle Wine Shadow</h3>
                  <p className="font-serif text-sm italic text-[#5C1224] mt-3">
                    Inverted light-beam algorithm calibrated for archival cream paper textures.
                  </p>
                </SpotlightCard>
              </div>
            </div>
          </section>
        )}

        {/* TAB 6: PORTRAITS */}
        {activeTab === 'portraits' && (
          <section className="space-y-8">
            <div className="border border-white/10 bg-[#25070F]/80 p-8">
              <EditorialLabel variant="kicker">Human Authorship</EditorialLabel>
              <h2 className="font-serif text-2xl text-ivory mt-1 mb-6">
                Contributor Cards &amp; Interactive Portraits
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {AUTHORS.slice(0, 3).map((author) => (
                  <ContributorCard key={author.id} author={author} articlesCount={2} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* TAB 7: GENERATIVE GRAPHICS */}
        {activeTab === 'graphics' && (
          <section className="space-y-8">
            <div className="border border-white/10 bg-[#25070F]/80 p-8">
              <EditorialLabel variant="kicker">Haikei-Style Generative SVGs</EditorialLabel>
              <h2 className="font-serif text-2xl text-ivory mt-1 mb-6">
                Archival Seals, Chapter Dividers, and Botanical Fleuron Motifs
              </h2>

              <div className="flex flex-wrap items-center justify-center gap-12 py-8">
                <div className="text-center">
                  <ArchivalSeal size={100} />
                  <p className="mt-3 font-mono text-[9px] uppercase tracking-[0.2em] text-gold">ArchivalSeal</p>
                </div>
                <div className="text-center">
                  <MotifDivider motif="❦" />
                  <p className="mt-3 font-mono text-[9px] uppercase tracking-[0.2em] text-gold">MotifDivider</p>
                </div>
              </div>

              <div className="mt-8 border-t border-white/10 pt-8">
                <EditorialLabel variant="marginalia">Generative Chapter Contour Divider</EditorialLabel>
                <div className="my-6">
                  <ChapterDivider />
                </div>
              </div>
            </div>
          </section>
        )}

        {/* TAB 8: FORMS */}
        {activeTab === 'forms' && (
          <section className="space-y-8">
            <div className="border border-white/10 bg-[#25070F]/80 p-8 max-w-2xl mx-auto">
              <EditorialLabel variant="kicker">Letters to the Desk</EditorialLabel>
              <h2 className="font-serif text-2xl text-ivory mt-1 mb-6">
                Tactile Letterpress Input Testing
              </h2>

              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  setFormSubmitted(true)
                }}
                className="space-y-6"
              >
                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-[0.24em] text-gold mb-2">
                    Writer's Name or Monogram
                  </label>
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="e.g. Alina Javed"
                    className="w-full border-b border-white/20 bg-transparent py-2 font-serif text-xl text-ivory placeholder:text-white/20 focus:border-gold focus:outline-none transition-colors"
                  />
                </div>

                <EditorialFolio number={1} issue="LETTER 01" date="26.06.2026" />

                <button
                  type="submit"
                  className="btn btn-gold text-xs w-full py-3"
                >
                  Send Manuscript Dispatch →
                </button>

                {formSubmitted && (
                  <p className="font-mono text-[9px] uppercase tracking-[0.24em] text-gold text-center animate-fade-in">
                    ✓ Dispatch recorded in ledger
                  </p>
                )}
              </form>
            </div>
          </section>
        )}

        {/* TAB 9: MOTION TOKENS */}
        {activeTab === 'motion' && (
          <section className="space-y-8">
            <div className="border border-white/10 bg-[#25070F]/80 p-8">
              <EditorialLabel variant="kicker">Interaction Token Registry</EditorialLabel>
              <h2 className="font-serif text-2xl text-ivory mt-1 mb-6">
                Shared Motion &amp; Spatial Constants
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-xs">
                <div className="border border-white/10 p-4">
                  <h4 className="text-gold uppercase tracking-[0.2em] mb-2">MOTION_SPEED</h4>
                  <pre className="text-white/70">{JSON.stringify(MOTION_SPEED, null, 2)}</pre>
                </div>

                <div className="border border-white/10 p-4">
                  <h4 className="text-gold uppercase tracking-[0.2em] mb-2">MOTION_DISTANCE</h4>
                  <pre className="text-white/70">{JSON.stringify(MOTION_DISTANCE, null, 2)}</pre>
                </div>

                <div className="border border-white/10 p-4">
                  <h4 className="text-gold uppercase tracking-[0.2em] mb-2">MOTION_EASE</h4>
                  <pre className="text-white/70">{JSON.stringify(MOTION_EASE, null, 2)}</pre>
                </div>

                <div className="border border-white/10 p-4">
                  <h4 className="text-gold uppercase tracking-[0.2em] mb-2">SPOTLIGHT_CONFIG</h4>
                  <pre className="text-white/70">{JSON.stringify(SPOTLIGHT_CONFIG, null, 2)}</pre>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
