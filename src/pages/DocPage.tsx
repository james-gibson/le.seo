import { Link } from 'react-router-dom'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { href, neighbours, sectionMeta, type Page } from '../lib/content'
import { markdownComponents } from '../lib/markdown'
import { usePageMeta } from '../lib/use-page-meta'

export function DocPage({ page }: { page: Page }) {
  usePageMeta(page.title, page.description)
  const section = sectionMeta(page.section)
  const { prev, next } = neighbours(page)

  return (
    <div className="page page--doc">
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link to={`/${section.id}`}>{section.label.toLowerCase()}</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{page.slug}</span>
      </nav>

      <header className="doc__head">
        <h1 className="doc__title">{page.title}</h1>
        {page.description ? <p className="doc__lede">{page.description}</p> : null}
        {page.tags.length ? (
          <p className="doc__tags">
            {page.tags.map((tag) => (
              <span className="tag" key={tag}>
                {tag}
              </span>
            ))}
          </p>
        ) : null}
      </header>

      {page.headings.length > 1 ? (
        <nav className="toc" aria-label="On this page">
          <p className="toc__label">on this page</p>
          <ul>
            {page.headings.map((heading) => (
              <li key={heading.id} className={`toc__item toc__item--d${heading.depth}`}>
                <a href={`#${heading.id}`}>{heading.text}</a>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}

      <article className="prose">
        <Markdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
          {page.body}
        </Markdown>
      </article>

      <nav className="rail" aria-label="Section pages">
        {prev ? (
          <Link className="rail__link" to={href(prev)}>
            <span className="rail__dir">← previous</span>
            <span className="rail__name">{prev.title}</span>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link className="rail__link rail__link--next" to={href(next)}>
            <span className="rail__dir">next →</span>
            <span className="rail__name">{next.title}</span>
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </div>
  )
}
