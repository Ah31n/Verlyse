/* ------------------------------------------------------------------ */
/* THE ATTRIBUTE LAYER                                                  */
/*                                                                      */
/* StringTune is configured declaratively through `string-*` attributes.*/
/* Hand-writing those strings in twenty components is how a design      */
/* system rots, so every attribute set the publication uses is built    */
/* here, typed, from the tokens. Components spread the result:          */
/*                                                                      */
/*   <figure {...drift('standard')}>                                    */
/*                                                                      */
/* Each helper returns plain data attributes, so an element carrying    */
/* them is inert and perfectly readable when the runtime never starts   */
/* (reduced motion, no JS, failed chunk).                               */
/* ------------------------------------------------------------------ */

import { DRIFT, GLIDE, INTENSITY, MAGNETIC, type Intensity } from './tokens'

type Attrs = Record<string, string>

/**
 * Scroll progress across the element's own travel through the viewport.
 * Publishes `--progress` (0 → 1) for CSS to consume.
 */
export function progress(
  enter: 'top' | 'center' | 'bottom' = 'bottom',
  exit: 'top' | 'center' | 'bottom' = 'top',
): Attrs {
  return { string: 'progress', 'string-enter-vp': enter, 'string-exit-vp': exit }
}

/** Progress that also re-fires `.-inview` each time the element re-enters. */
export function progressRepeating(
  enter: 'top' | 'center' | 'bottom' = 'bottom',
  exit: 'top' | 'center' | 'bottom' = 'top',
): Attrs {
  return { ...progress(enter, exit), 'string-repeat': '' }
}

/** Shallow parallax. Desktop only — the module is not registered on touch. */
export function drift(intensity: Intensity = 'standard'): Attrs {
  return { string: 'parallax[]', 'string-parallax': String(DRIFT[intensity]) }
}

/** Scroll lag, for staggering neighbours in a row or reel. */
export function glide(intensity: Intensity = 'standard'): Attrs {
  return { string: 'glide[]', 'string-glide': String(GLIDE[intensity]) }
}

/** Signed scroll-velocity value as `--lerp`, for slight skew or scale. */
export function lerp(): Attrs {
  return { string: 'lerp[]' }
}

/** Split a heading into lines or words. The parent keeps its aria-label. */
export function split(by: 'char' | 'word' | 'line' = 'word'): Attrs {
  return { string: 'split', 'string-split': by }
}

/** Progress-scrubbed split — the reveal is tied to scroll, not to time. */
export function splitOnProgress(by: 'word' | 'line' = 'line'): Attrs {
  return { ...progress('bottom', 'center'), string: 'progress|split', 'string-split': by }
}

/** Proximity pull on a single control. Restrained by default, always. */
export function magnetic(strength: number = MAGNETIC.strength): Attrs {
  return {
    string: 'magnetic',
    'string-radius': String(MAGNETIC.radius),
    'string-strength': String(strength),
  }
}

/** Cursor-following light. Publishes `--spotlight-angle` / `-distance`. */
export function spotlight(): Attrs {
  return { string: 'spotlight' }
}

/** Combine: a plate that both catches the light and lags the scroll. */
export function spotlitGlide(intensity: Intensity = 'restrained'): Attrs {
  return { string: 'glide[]|spotlight', 'string-glide': String(GLIDE[intensity]) }
}

export { INTENSITY }
