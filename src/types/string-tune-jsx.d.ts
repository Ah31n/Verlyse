import 'react'

declare module 'react' {
  interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
    string?: string
    'string-id'?: string
    'string-factor'?: string | number
    'string-parallax'?: string | number
    'string-parallax-bias'?: string | number
    'string-magnetic'?: string | boolean
    'string-cursor-target'?: string
    'string-strength'?: string | number
    'string-radius'?: string | number
    'string-spotlight'?: string | boolean
    'string-lerp'?: string | number
    'string-tilt'?: string | boolean
    'string-tilt-max'?: string | number
    'string-tilt-tension'?: string | number
    'string-tilt-friction'?: string | number
    'string-progress'?: string | boolean
    'string-easing'?: string
    'string-masonry'?: string | boolean
    'string-masonry-cols'?: string
    'string-masonry-gap'?: string
    'string-masonry-mode'?: string
    'string-split'?: string
    'string-lazy'?: string | boolean
    'string-src'?: string
    'string-copy-from'?: string
    'string-sequence'?: string
    'string-sequence-trigger'?: string
    'string-marquee'?: string | boolean
    'string-marquee-direction'?: string
    'string-marquee-speed'?: string | number
    'string-marquee-gap'?: string | number
    'string-marquee-pause-on-hover'?: string | boolean
    'string-glide'?: string | number
  }
}
