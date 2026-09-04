import { useEffect } from 'react'

interface SeoProps {
  title: string
  description: string
  path?: string
  image?: string
}

/** Lightweight SEO manager — sets title, meta description and OG tags per page. */
export function useSeo({ title, description, path = '/', image = '/img/poster-3-13-1.webp' }: SeoProps) {
  useEffect(() => {
    const url = `${window.location.origin}${path}`
    document.title = `${title} — Verlyse Media`
    const setMeta = (selector: string, attr: string, value: string) => {
      let el = document.head.querySelector<HTMLMetaElement>(selector)
      if (!el) {
        el = document.createElement('meta')
        el.setAttribute(attr, '')
        document.head.appendChild(el)
      }
      el.setAttribute(attr, value)
    }
    setMeta('meta[name="description"]', 'content', description)
    setMeta('meta[property="og:title"]', 'content', `${title} — Verlyse Media`)
    setMeta('meta[property="og:description"]', 'content', description)
    setMeta('meta[property="og:url"]', 'content', url)
    setMeta('meta[property="og:image"]', 'content', `${window.location.origin}${image}`)

    // canonical link
    let canon = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (!canon) {
      canon = document.createElement('link')
      canon.rel = 'canonical'
      document.head.appendChild(canon)
    }
    canon.href = url

    // JSON-LD: WebPage + Organization site
    let ld = document.getElementById('ld-webpage') as HTMLScriptElement | null
    if (!ld) {
      ld = document.createElement('script')
      ld.id = 'ld-webpage'
      ld.type = 'application/ld+json'
      document.head.appendChild(ld)
    }
    ld.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebSite',
          '@id': `${window.location.origin}/#site`,
          name: 'Verlyse Media',
          url: window.location.origin,
          slogan: 'Where Vision Becomes A Voice',
        },
        {
          '@type': 'WebPage',
          '@id': url + '#webpage',
          name: `${title} — Verlyse Media`,
          description,
          url,
          isPartOf: { '@id': `${window.location.origin}/#site` },
        },
      ],
    })
  }, [title, description, path, image])
}

/** Article-level structured data */
export function useArticleSeo(article: { title: string; excerpt: string; date: string; readingTime: string; category: string; author: string; tags: string[]; cover: string }) {
  useEffect(() => {
    if (!article) return
    const url = window.location.href.split('?')[0]
    document.title = `${article.title} — Verlyse Media`
    const desc = article.excerpt.length > 158 ? article.excerpt.slice(0, 155).trimEnd() + '…' : article.excerpt
    const setMeta = (selector: string, attr: string, value: string) => {
      const el = document.head.querySelector<HTMLMetaElement>(selector)
      if (el) el.setAttribute(attr, value)
    }
    setMeta('meta[name="description"]', 'content', desc)
    setMeta('meta[property="og:title"]', 'content', `${article.title} — Verlyse Media`)
    setMeta('meta[property="og:description"]', 'content', desc)
    setMeta('meta[property="og:image"]', 'content', `${window.location.origin}/${article.cover}`)

    let canon = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (!canon) {
      canon = document.createElement('link')
      canon.rel = 'canonical'
      document.head.appendChild(canon)
    }
    canon.href = url

    let ld = document.getElementById('ld-article') as HTMLScriptElement | null
    if (!ld) {
      ld = document.createElement('script')
      ld.id = 'ld-article'
      ld.type = 'application/ld+json'
      document.head.appendChild(ld)
    }
    ld.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebSite',
          '@id': `${window.location.origin}/#site`,
          name: 'Verlyse Media',
          url: window.location.origin,
          slogan: 'Where Vision Becomes A Voice',
        },
        {
          '@type': 'Article',
          '@id': url + '#article',
          headline: article.title,
          description: article.excerpt,
          datePublished: article.date,
          timeRequired: article.readingTime,
          articleSection: article.category,
          author: { '@type': 'Person', name: article.author },
          publisher: { '@type': 'Organization', name: 'Verlyse Media' },
          keywords: article.tags.join(', '),
          image: `${window.location.origin}/${article.cover}`,
          mainEntityOfPage: url,
        },
      ],
    })
  }, [article])
}
