/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      /* ---- R08 motion tokens -------------------------------------------
         One vocabulary for the whole publication. Six durations, three
         easings. New motion uses a token; a raw duration in a class is a
         review comment. Existing call sites are migrated opportunistically,
         not in a single sweeping diff.
           instant  90ms   state flips, checkbox, pressed
           quick    240ms  hover, focus ring, small reveals
           settle   520ms  panels, drawers, page furniture
           unfold   900ms  editorial reveals, plates entering
           ink      1400ms slow image/scale moves, the archival veil
           breathe  4000ms ambient, never attention-seeking
      ------------------------------------------------------------------- */
      transitionDuration: {
        instant: '90ms',
        quick: '240ms',
        settle: '520ms',
        unfold: '900ms',
        ink: '1400ms',
        breathe: '4000ms',
      },
      transitionTimingFunction: {
        /* the house curve — everything decelerates into place */
        editorial: 'cubic-bezier(0.22, 1, 0.36, 1)',
        /* entrances that must feel pressed, not floated */
        press: 'cubic-bezier(0.65, 0.05, 0.36, 1)',
        /* ambient only */
        drift: 'cubic-bezier(0.37, 0, 0.63, 1)',
      },
      colors: {
        wine: { DEFAULT: '#5C1224', deep: '#3B0D17', ink: '#2E0913', night: '#1C1C1C' },
        ivory: '#F8F6F2',
        cream: '#EFE8DD',
        gold: '#B89146',
        charcoal: '#1C1C1C',
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      letterSpacing: {
        editorial: '0.32em',
        wide2: '0.24em',
      },
      maxWidth: {
        page: '1480px',
      },
      transitionDuration: { '400': '400ms' },
      transitionTimingFunction: {
        out: 'cubic-bezier(.22,1,.36,1)',
        out2: 'cubic-bezier(.65,.05,.36,1)',
      },
      keyframes: {
        /* ——— per-article vibes ——— */
        flicker: {
          '0%, 100%': { opacity: '1' },
          '8%': { opacity: '0.55' },
          '12%': { opacity: '1' },
          '38%': { opacity: '0.75' },
          '44%': { opacity: '1' },
          '70%': { opacity: '0.85' },
        },
        kenburns: {
          '0%': { transform: 'scale(1.02)' },
          '100%': { transform: 'scale(1.14)' },
        },
        breathe: {
          '0%, 100%': { opacity: '0.55' },
          '50%': { opacity: '0.95' },
        },
        /* ——— symbol motions ——— */
        tick: {
          to: { transform: 'rotate(360deg)' },
        },
        sway: {
          '0%, 100%': { transform: 'rotate(-4deg)' },
          '50%': { transform: 'rotate(4deg)' },
        },
        ascend: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '25%': { opacity: '0.7' },
          '100%': { transform: 'translateY(-30px)', opacity: '0' },
        },
        petal: {
          '0%': { transform: 'translateY(-8px) translateX(0) rotate(0deg)', opacity: '0' },
          '20%': { opacity: '0.75' },
          '100%': { transform: 'translateY(36px) translateX(10px) rotate(40deg)', opacity: '0' },
        },
        write: {
          '0%': { strokeDashoffset: '120' },
          '70%, 100%': { strokeDashoffset: '0' },
        },
        blink: {
          '0%, 49%': { opacity: '1' },
          '50%, 100%': { opacity: '0' },
        },
      },
      animation: {
        'vm-flicker': 'flicker 7s ease-in-out infinite',
        'vm-kenburns': 'kenburns 16s ease-out infinite alternate',
                'vm-breathe': 'breathe 5s ease-in-out infinite',
                                        'vm-tick': 'tick 60s linear infinite',
        'vm-sway': 'sway 6s ease-in-out infinite',
        'vm-ascend': 'ascend 5s ease-in infinite',
        'vm-petal': 'petal 9s ease-in-out infinite',
                'vm-write': 'write 3.4s ease-in-out infinite',
        'vm-blink': 'blink 1.4s steps(1) infinite',
      },
    },
  },
  plugins: [],
}
