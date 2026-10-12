# “The Quiet Grief” — editorial feature handoff

**State:** development-only source preview; not published, not approved for an archive folio, and not deployed.

**Working preview route:** `/article/the-quiet-grief?preview=draft` on the Vite development server only.

**Source record:** Instagram `DeUZFPTCjPU`, posted by `@verlyse.media` at `2026-10-10T15:20:30.000Z`.

## Editorial record and publication safeguards

| Field | Verified value / treatment |
| --- | --- |
| Source format | Instagram Sidecar / carousel container; five slides |
| Working title and slug | “The Quiet Grief” / `the-quiet-grief` — provisional, inferred from `#TheQuietGrief`; visibly labeled working title |
| Classification | Carousel-led editorial feature; “Art” is a visible provisional classification, not a final taxonomy decision |
| Publisher/byline | Verlyse Media; no individual author profile or writer signature was invented |
| Source date | 2026-10-10; retained as source provenance, not presented as an approved publication date |
| Structured source hashtags | `verlysemedia`, `TheQuietGrief`, `LostPassions`, `ArtAndWords` |
| Engagement | JSON reports `likesCount: -1`, so stored as `null` and not shown. Nine comment records match `commentsCount: 9`, but neither the count nor any commenter data is displayed/imported. |
| Public discovery | Draft is outside the published article registry; excluded from feeds, search, counts, public route shells, canonical metadata, structured Article data, and production assets |

### Source-caption fidelity

The caption words, paragraph breaks, punctuation, capitalization, em dash and hashtags below match the source. Markdown omits a non-rendering trailing space before the first blank line; the TypeScript `originalCaption` string retains it exactly.

```text
Somewhere along the way, we stopped reaching for the things that once made us feel alive.

Not because we stopped loving them, but because life got louder, time grew scarce, and the dreams we once held so close slowly became memories we revisited instead of realities we lived.

Perhaps the saddest part of growing up is watching a passion become a stranger to us.

The colours never faded. We just stopped reaching for them.

— Verlyse Media

#verlysemedia #TheQuietGrief #LostPassions #ArtAndWords CreativeExpression
```

**Source discrepancy to preserve:** the caption ends with the unprefixed token `CreativeExpression`; the source JSON’s structured hashtag array does not contain that value. A prior brief listed `#CreativeExpression` among associated hashtags, but the attached JSON is the source of truth for this integration. It is not silently promoted into normalized tags.

### Original-image mapping

All five original images were fetched from the supplied source URLs, visually checked, converted to high-quality WebP without crop/recolor/overlaid replacement lettering, and self-hosted. The carousel grid and hero use verified intrinsic dimensions. Combined WebP size: **1,229,906 bytes**.

| Slide | Source child shortcode | Self-hosted file | Source dimensions | Verified visual description |
| --- | --- | --- | --- | --- |
| 1 | `DeUZAdGKvqt` | `DeUZFPTCjPU-1.webp` | 603 × 619 | Pink ballet flats on ochre; pale banner reads “Once it was the thing i ran towards”. |
| 2 | `DeUZAc0K-DS` | `DeUZFPTCjPU-2.webp` | 1080 × 1108 | Figure holding a camera toward a bright light; banner reads “Then, somewhere along the way, the joy became an obligation”. |
| 3 | `DeUZAgrKhxG` | `DeUZFPTCjPU-3.webp` | 1200 × 1231 | Black glasses atop books on sage; banner reads “Until the things i loved became, the things I no longer had time for”. |
| 4 | `DeUZAnkqU5G` | `DeUZFPTCjPU-4.webp` | 1080 × 1108 | Cosmetics, perfume and jewelry on cream; banner reads “And So, i became a stranger to the very thing that once made me feel alive”. |
| 5 | `DeUZArjqUA8` | `DeUZFPTCjPU-5.webp` | 585 × 600 | Pink flip-phone and point-and-shoot cameras; banner reads “Nobody talks about grieving a version of yourself that you had to leave behind”. |

The source artwork itself carries the hand-lettering; the site does not duplicate that text in HTML. The existing portrait cover treatment initially cropped the near-square lead slide. It was corrected: the gallery hero and grid now use the original slide ratio. At 390px and 375px the full cover and caption sit above the fixed mobile dock with measured clearance, rather than under it.

### Presentation and scope

- Keep the five-slide sequence intact, source captions legible, and viewing controls optional. The grid opens the selected plate in a focus-managed modal lightbox.
- Reproduces the caption after the five original plates and attributes the source post. No invented essay, conclusion, creator biography, award, or extra quotation was added.
- The development preview has visible “working title / provisional classification / not published” language, an unnumbered preview label, and no public save/share controls, synthetic ending, engagement, or related-publication links.
- `publicationStatus` is explicit. The canonical public `ARTICLES` projection contains published entries only; the draft is a separately stored sidecar imported dynamically only when both `import.meta.env.DEV` and the exact preview query are true.
- Draft SEO is `noindex,nofollow,noarchive`, has no canonical URL and emits no Article JSON-LD. The production build contains no draft caption, slug/module, or source images.
- Final decisions still belong to the editor: title, formal classification/category, byline, publication date, folio number, archive placement, and whether/when to publish.

## Visual direction and UI references

The presentation keeps Verlyse’s existing wine/ivory/brass palette, editorial serif typography, generous reading measure, gallery frame, and quiet Motion reveals. It uses the five original paintings as the primary visual story; no generated substitute art or additional product/dashboard-style UI was introduced. Reduced-motion mode removes the reveal/zoom movement.

Five official interaction references were opened and evaluated in detail:

| Official reference | Finding and decision |
| --- | --- |
| [Radix Dialog](https://www.radix-ui.com/primitives/docs/components/dialog) | Used as accessibility guidance for modal semantics, title/description, focus, Escape and modal isolation. No Radix dependency added. |
| [shadcn/ui Base Carousel](https://ui.shadcn.com/docs/components/base/carousel) | Embla-based horizontal/vertical carousel is available, but the editorial grid/lightbox is a better fit and adds no package. |
| [ReactBits Circular Gallery](https://reactbits.dev/components/circular-gallery) | Official named page verified; useful implementation detail did not render in this session, so no pattern was claimed or copied. |
| [Bklit UI](https://bklit.com/docs) | Official docs describe a shadcn-based charts/data-visualization library; not relevant to the artwork sequence. |
| [StringTune Reveal on Scroll](https://string-tune.fiddle.digital/skill-hub/basics/01-reveal-on-scroll) | Module reviewed but not downloaded, installed or executed; it overlaps existing Motion reveals. See StringTune assessment below. |

A concurrent homepage identity/availability sweep checked all **21** sites named in the brief (HTTP/final URL/title; not a full usability audit):

| Site | Observed result |
| --- | --- |
| 21st.dev | HTTP 200; title “21st” |
| Superdesign | HTTP 200; title “Superdesign” |
| Watermelon | HTTP 200; title “Watermelon” |
| Kokonut UI | HTTP 200; title “KokonutUI” |
| Origin UI | Redirect to `coss.com/ui`; title describes a Base UI component library |
| shadcn/ui | HTTP 200; title “shadcn/ui” |
| Radix | HTTP 200; title “Radix UI” |
| Aceternity UI | HTTP 200; title “Aceternity UI” |
| Magic UI | HTTP 200; no title exposed by the fetch |
| ReactBits | HTTP 200; title “React Bits” |
| Motion Primitives | HTTP 200; animated-interface UI kit title |
| Cult UI | HTTP 200; title “Cult UI” |
| Animata | HTTP 200; title “Animata” |
| Fancy Components | HTTP 200; title “Fancy Components” |
| Smooth UI | HTTP 200; title “SmoothUI” |
| UI Layouts | HTTP 200 after redirect to `ui-layouts.com`; title “Ui-Layouts | Your Frontend Universe” |
| Codrops | HTTP 200; title “Codrops” |
| Awwwards | Request timed out; identity not verified in this check |
| Godly | Redirect to `recent.design/?ref=godly`; title “Recent — Design Inspiration” |
| SiteInspire | HTTP 429; identity not verified in this check |
| Motion Sites | DNS/request error at `www.motion.sites`; identity not verified in this check |

Timeouts, rate limits and request errors are **unverified outcomes**, not evidence that a site is offline. No unverified site was adopted; no external UI component, image or motion package was copied into this feature.

## Motion and library ownership

No animation dependency was added. The feature continues to use the repository’s existing runtime responsibilities:

| Library / system | Existing version and responsibility | Feature use |
| --- | --- | --- |
| Motion (`motion/react`) | `motion@13.2.0`; DOM/page transitions, reveals, reduced-motion behavior | Lazy gallery reveal and modal presence/scale only; native DOM handles focus trapping, portal, `inert`, keyboard navigation and scroll locking. |
| GSAP + ScrollTrigger | `gsap@3.15.0`; isolated cinematic camera choreography on `/about` | None. |
| Anime.js | `animejs@4.5.0`; one isolated SVG ornament, `src/components/ui/BrassRule.tsx` | None. |
| Three.js / React Three Fiber | `three@0.185.1`, `@react-three/fiber@8.18.0`; isolated Canvas/WebGL archive and ending scenes | None; direct route QA confirmed the Three chunk was not requested. |
| React Spring / Lenis / Drei | Not present in the inspected installed dependency tree | No spring/physics interaction, smooth-scroll controller or additional 3D helper is needed; native scrolling remains the fallback. |
| Native browser / CSS | layout, focus, accessible dialog behavior and non-motion fallbacks | Source-ratio dimensions; focus/inert/keyboard/scroll state for lightbox; reduced-motion class path. |

Existing detailed ownership notes: [animation decisions](../ANIMATION-DECISIONS.md) and [per-surface ownership map](verlyse/animation-ownership.md).

### StringTune assessment

The official Skill Hub listed version **1.2.6**. Registry metadata identifies `@fiddle-digital/string-tune` as MIT, with root exports and type declarations; unpacked package size is **7,265,153 bytes** (not a measured production bundle). Its documented API has a shared singleton, module registration, global settings, `start(fps)`, event subscription, resize invalidation and a public scroll API. It is a global runtime/scroll owner, not an isolated reveal drop-in. The Reveal on Scroll module was inspected but not downloaded or run. The existing Motion stack already covers the requested reveal, so integration would duplicate ownership without a concrete feature benefit. **Not installed; no StringTune code or registry module is in the repository.**

The Skill Hub inventory reviewed at [string-tune.fiddle.digital/skill-hub](https://string-tune.fiddle.digital/skill-hub) listed: **Basics** — Reveal on Scroll (“Scroll to reveal”), Parallax, Progress, Lerp, Glide, Cursor, Magnetic, Spotlight, Impulse, Split, FPS Tracker, Position Tracker, Sequence; **Typography** — Text w/ Progress 1/2, Kinetic Text 1, Split and Lerp 1; **Layouts** — Footer Shifting, Masonry Orchestrated; **Specials** — Xmas Tree; **Forms** — Forms 1/2/3. These exact catalog names were inventoried; no module code was downloaded, installed, or activated. The separately inspected developer guides ([Dev Guides](https://string-tune.fiddle.digital/dev-guides/)) describe an early-access developer layer and do not establish a React-specific lifecycle integration contract.

## Manus skill register

The following system-provided instructions were read from `/home/ubuntu/skills/<skill>/SKILL.md` and actually used. They are Manus workflow guidance, not vendored project dependencies; no skill implementation files were copied into the repository.

All six were already available in the active Manus environment, read and used in-session; none was downloaded or installed into the repository.

| Exact skill | Official in-session location | Instructions reviewed / work performed | Limitations or result |
| --- | --- | --- | --- |
| `webdev` | `/home/ubuntu/skills/webdev/SKILL.md` | Existing-repository workflow, route manifest, preview and delivery rules | Used existing project stack; no new website scaffold. |
| `deep-research` | `/home/ubuntu/skills/deep-research/SKILL.md` | Source validation, citations and research notes | Used for official-source checks; network failures remain marked unverified. |
| `workflow-composer` | `/home/ubuntu/skills/workflow-composer/SKILL.md` | Required parallel research approach | Used to coordinate a bounded comparison of five selected official UI sources. |
| `image-processing` | `/home/ubuntu/skills/image-processing/SKILL.md` | Original-image inspection and safe conversion | Used to verify/download/convert source artwork; no AI-replacement art. |
| `webdev-seo` | `/home/ubuntu/skills/webdev-seo/SKILL.md` | Metadata, canonical and indexing guidance | Used to isolate and noindex the local-only draft preview. |
| `read-special-images` | `/home/ubuntu/skills/read-special-images/SKILL.md` | Readability-first handling of tall screenshots | Used only for focused original-scale mobile screenshot crops where the full-page preview was unreadable. |
| React/TypeScript, responsive composition, accessibility, browser testing, performance, GitHub release | No separate specialized Manus skill activated for these tasks | Followed the repository’s patterns; TypeScript, Playwright/Chromium, reduced-motion and build/test tooling provide the direct evidence | No external tool/library was added for these categories. |

**Separate from Manus skills:** StringTune’s “Reveal on Scroll” is an external downloadable module, not an activated Manus skill; it was reviewed only. Radix/shadcn/ReactBits are component references, not skills. None was downloaded or executed.

## Verification record

### Commands and outcomes

| Command | Observed result |
| --- | --- |
| `npm run build` | PASS — TypeScript + Vite, 4.18s; 50 registry-backed metadata routes prerendered. |
| `npm test` | PASS — 51 routes × 3 viewports; 0 console/page/network errors, 0 horizontal overflow, all footers at true bottom; interaction audit 12/12; assets 40/40; flags check passed. |
| `npm run typecheck:api` | PASS. |
| `npm run test:metadata` | PASS — 50 generated routes. |
| `npm run test:newsletter` | PASS — 11 synthetic checks; no provider contacted. |
| `npm run test:smoke` | PASS — 19 route/page smoke checks. |
| `npm run check:secrets` | PASS — no sensitive filenames or obvious secret patterns. |

The full `npm test` command invokes the full route matrix (also available as `test:audit`), interaction audit and asset audit; it was run on the final code state. Direct draft-route checks were also performed against source-fidelity/mobile/accessibility changes:

- exact caption comparison against the JSON; five slide mappings, dimensions, loaded images and alt text verified;
- `noindex,nofollow,noarchive`; no canonical; no Article JSON-LD on the draft route;
- 1440px desktop, 768px tablet, 390px phone and 375px narrow-phone widths; no horizontal overflow;
- mobile lead image rendered at the source ratio (~0.974) and the whole cover/figure caption clears the fixed dock by **17px at 390px and 18px at 375px**;
- requesting `/article/the-quiet-grief` without `?preview=draft` yields the not-found page and no source caption; the visible “Back to the archive” link returns to `/articles`, where the draft title is absent;
- lightbox: keyboard focus trap, Escape close, inert background, body scroll lock, and trigger focus restoration all pass;
- reduced-motion path passes; no Three chunk requested; zero console errors and zero failed requests;
- the final built `dist` excludes the caption, slug/module marker, and all five draft image files; `public/manus-routes.json` is valid and contains no draft-specific route;
- the temporary development preview shell and first source slide both returned HTTP 200; preview remains un-deployed.

The build had an existing, separate warning for `three` (**770.49 kB minified / 203.48 kB gzip**, above Vite’s 700 kB warning threshold). The draft route does not request it. This is not introduced by the feature; it remains an unrelated future bundle-splitting opportunity.

**Release boundary:** prepared on `arena/verlyse-editorial-upgrade`, based on verified `origin/main` commit `2ea7839a456831042bf63964c5d40c4a8445dcd9`. The live site was not deployed or altered. The pull request and final full-suite outcome are reported in the task completion message.
