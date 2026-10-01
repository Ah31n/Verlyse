import { Link } from 'react-router-dom'
import { clsx } from 'clsx'

const DEPARTMENTS = [
  { name: 'Stories', count: 6, slug: 'stories', desc: 'Narrative prose, literary fiction, and character studies.' },
  { name: 'Poetry', count: 4, slug: 'poetry', desc: 'Verses on devotion, longing, and delicate truths.' },
  { name: 'Essays', count: 3, slug: 'essays', desc: 'Critical cultural discourse, pedagogy, and modern dilemmas.' },
  { name: 'Art', count: 2, slug: 'art', desc: 'Visual monograph galleries and creative reflections.' },
  { name: 'Social Issues', count: 2, slug: 'social-issues', desc: 'Courageous reporting on structural realities and advocacy.' },
  { name: 'Lifestyle', count: 1, slug: 'lifestyle', desc: 'Modern living, memory, and culinary literature.' },
  { name: 'Horror', count: 1, slug: 'horror', desc: 'Atmospheric psychological tension and visceral shadows.' },
]

interface HomeDepartmentIndexProps {
  className?: string
}

/**
 * HomeDepartmentIndex — The Seven Editorial Wings
 */
export function HomeDepartmentIndex({ className = '' }: HomeDepartmentIndexProps) {
  return (
    <section className={clsx('my-24 md:my-32', className)}>
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-gold/30 pb-4">
        <div>
          <span className="font-mono text-[9px] uppercase tracking-[0.28em] text-gold">
            Curatorial Departments
          </span>
          <h2 className="mt-2 font-serif text-3xl md:text-4xl font-light text-ivory">
            The Seven Wings
          </h2>
        </div>
        <Link
          to="/categories"
          className="mt-4 md:mt-0 font-mono text-[10px] uppercase tracking-[0.2em] text-gold hover:underline flex items-center gap-1.5"
        >
          <span>Explore All Wings</span>
          <span>→</span>
        </Link>
      </div>

      <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {DEPARTMENTS.map((dept) => (
          <Link
            key={dept.slug}
            to={`/categories/${dept.slug}`}
            className="group flex flex-col justify-between border border-white/10 bg-[#160309] p-6 transition-all duration-500 hover:border-gold hover:bg-[#20050E]"
          >
            <div>
              <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                <span className="font-mono text-[9px] uppercase tracking-wider text-gold">
                  Wing
                </span>
                <span className="font-mono text-[9px] text-white/50">
                  {dept.count} Folio{dept.count === 1 ? '' : 's'}
                </span>
              </div>
              <h3 className="mt-4 font-serif text-2xl font-light text-ivory group-hover:text-gold transition-colors">
                {dept.name}
              </h3>
              <p className="mt-2 font-serif text-xs italic text-white/60 line-clamp-2">
                {dept.desc}
              </p>
            </div>
            <div className="mt-6 flex items-center gap-1 font-mono text-[9px] uppercase tracking-widest text-gold/80 group-hover:text-gold">
              <span>Enter Wing</span>
              <span>→</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
