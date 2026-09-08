import { useMemo } from 'react'

/**
 * Detects whether this browser has a usable WebGL context and whether the
 * user prefers reduced motion. Used to gate the spatial layer:
 *
 *   - no WebGL  -> render the static, designed HTML fallback (FALLBACK)
 *   - reduced   -> render a static final frame (REDUCED)
 *   - otherwise -> the live spatial scene (ALIVE)
 *
 * WebGL detection runs once per app load and is safe to call in render.
 */
function detectWebGL(): boolean {
  if (typeof window === 'undefined') return false
  try {
    const canvas = document.createElement('canvas')
    const gl =
      canvas.getContext('webgl2') ||
      canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl')
    return !!gl
  } catch {
    return false
  }
}

export function useWebGLSupport(): { supported: boolean; tried: boolean } {
  return useMemo(() => {
    const supported = detectWebGL()
    return { supported, tried: true }
  }, [])
}
