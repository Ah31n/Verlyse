import { clsx } from 'clsx'

interface ContactMethodsProps {
  className?: string
}

/**
 * ContactMethods — Truthful Contact Addresses & Office Information
 */
export function ContactMethods({ className = '' }: ContactMethodsProps) {
  return (
    <aside className={clsx('border border-white/10 bg-[#160309] p-6 md:p-8', className)}>
      <span className="font-mono text-[9px] uppercase tracking-[0.24em] text-gold">
        Official Channels
      </span>
      <h2 className="mt-2 font-serif text-2xl font-light text-ivory">
        Direct Inquiries
      </h2>

      <div className="mt-6 space-y-4 font-mono text-xs text-white/80">
        <div className="border-t border-white/10 pt-3">
          <span className="block text-[8px] uppercase tracking-wider text-white/40">General Correspondence</span>
          <a href="mailto:Verlysemedia.09@gmail.com" className="mt-1 block text-gold hover:underline">
            Verlysemedia.09@gmail.com
          </a>
        </div>

        <div className="border-t border-white/10 pt-3">
          <span className="block text-[8px] uppercase tracking-wider text-white/40">Editorial Office</span>
          <span className="mt-1 block text-ivory">Lahore, Punjab, Pakistan</span>
        </div>

        <div className="border-t border-white/10 pt-3">
          <span className="block text-[8px] uppercase tracking-wider text-white/40">Social Channels</span>
          <div className="mt-1 flex gap-3 text-gold">
            <a href="https://instagram.com/verlysemedia" target="_blank" rel="noreferrer" className="hover:underline">
              @verlysemedia
            </a>
          </div>
        </div>
      </div>
    </aside>
  )
}
