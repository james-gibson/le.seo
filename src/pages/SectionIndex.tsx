import { Link } from 'react-router-dom'
import { href, pagesIn, sectionMeta, type SectionId } from '../lib/content'
import { usePageMeta } from '../lib/use-page-meta'

export function SectionIndex({ section }: { section: SectionId }) {
  const meta = sectionMeta(section)
  const pages = pagesIn(section)
  usePageMeta(meta.label, meta.blurb)

  return (
    <div className="page page--section">
      <header className="doc__head">
        <p className="doc__kicker">{meta.id}</p>
        <h1 className="doc__title">{meta.label}</h1>
        <p className="doc__lede">{meta.blurb}</p>
      </header>

      <ol className="shelf">
        {pages.map((page, index) => (
          <li className="shelf__item" key={page.path}>
            <Link className="shelf__link" to={href(page)}>
              <span className="shelf__index">{String(index + 1).padStart(2, '0')}</span>
              <span className="shelf__body">
                <span className="shelf__title">{page.title}</span>
                <span className="shelf__desc">{page.description}</span>
              </span>
              <span className="shelf__meta">
                {page.headings.length} heading{page.headings.length === 1 ? '' : 's'}
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  )
}
