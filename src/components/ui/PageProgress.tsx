/**
 * READING PROGRESS AS TURNING PAGES — the top hairline becomes a stack of
 * thin leaves that fill one by one as the reader moves through the issue,
 * like the pages already turned. Text-free so it never collides with the
 * navigation beneath it.
 */
export default function PageProgress({ progress }: { progress: number }) {
  const pages = 12
  const filled = Math.round(progress * pages)

  return (
    <div className="flex items-center gap-3" aria-hidden="true">
      {/* the leaves — each lights as its page is turned */}
      <div className="flex items-end gap-[2px]">
        {Array.from({ length: pages }).map((_, i) => (
          <span
            key={i}
            className={`w-[3px] rounded-t-[1px] transition-colors duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              i < filled ? 'bg-gold' : 'bg-white/20'
            }`}
            style={{ height: 4 + (i % 3) * 2 }}
          />
        ))}
      </div>
    </div>
  )
}
