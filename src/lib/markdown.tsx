import type { Components } from 'react-markdown'
import { slugify } from './content'

/**
 * Markdown -> the desk. A page is styled by the same tokens as the chrome, so
 * the prose cannot drift from the frame around it. There is no prose theme and
 * no component stylesheet: the classes here are the same ones the parts use.
 */
export const markdownComponents: Components = {
  h2: ({ children, ...props }) => (
    <h2 id={slugify(String(children))} className="prose-h2" {...props}>
      {children}
    </h2>
  ),
  h3: ({ children, ...props }) => (
    <h3 id={slugify(String(children))} className="prose-h3" {...props}>
      {children}
    </h3>
  ),
  p: ({ ...props }) => <p className="prose-p" {...props} />,
  a: ({ href, ...props }) => {
    const external = !!href && (/^[a-z][a-z0-9+.-]*:/i.test(href) || href.startsWith('//'))
    // Content links are written root-absolute ("/desk/claiming") because that
    // is how an author thinks about the site. Production serves from /le.ad/,
    // so the mount has to be prefixed here or every internal link 404s.
    const to =
      !external && href?.startsWith('/')
        ? `${import.meta.env.BASE_URL.replace(/\/$/, '')}${href}`
        : href
    return (
      <a
        href={to}
        {...(external ? { target: '_blank', rel: 'noreferrer noopener' } : {})}
        className="prose-a"
        {...props}
      />
    )
  },
  ul: ({ ...props }) => <ul className="prose-ul" {...props} />,
  ol: ({ ...props }) => <ol className="prose-ol" {...props} />,
  li: ({ ...props }) => <li className="prose-li" {...props} />,
  strong: ({ ...props }) => <strong className="prose-strong" {...props} />,
  blockquote: ({ ...props }) => <blockquote className="prose-quote" {...props} />,
  // A table is the one block that cannot wrap: it gets a box that scrolls, so
  // the page does not scroll sideways at 320px.
  table: ({ ...props }) => (
    <div className="table-wrap">
      <table {...props} />
    </div>
  ),
  hr: () => <hr />,
  code: ({ className, children, ...props }) => {
    const isBlock = typeof className === 'string' && className.includes('language-')
    return (
      <code className={isBlock ? 'prose-code-block' : 'prose-code'} {...props}>
        {children}
      </code>
    )
  },
  img: ({ alt, ...props }) => <img alt={alt ?? ''} loading="lazy" {...props} />,
}
