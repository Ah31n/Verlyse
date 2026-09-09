/**
 * The cinematic layer — GSAP ScrollTrigger camera moves.
 *
 * SCOPE: mounted on the six unprotected pages (/about, /ambassadors, /community,
 * /creators, /submit, /contact) as the site-wide camera signature. It is
 * deliberately NOT wired into the protected pages (Home, Articles, Categories,
 * ArticleDetail) or /room, and it must not be, without an explicit decision per
 * route and a re-baseline of the protected manifest.
 *
 * LICENSE: this layer depends on `gsap`, which is NOT open source. Its package
 * metadata declares `Standard 'no charge' license: https://gsap.com/standard-license`
 * and the tarball ships no LICENSE file. It is used here by explicit decision,
 * recorded in docs/ANIMATION-DECISIONS.md. Do not add further GSAP surfaces
 * without re-reading that note.
 */
export { CrashZoom, DepthStage, DepthLayer, OrbitalDrift, PushIn, Magnetic, LineMaskReveal, MaskReveal, Tilt3D, Rise3D, Slate, DollyIn } from './primitives'
export { useCinematic, prefersReducedMotion } from './useCinematic'
