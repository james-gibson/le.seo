import { Link } from 'react-router-dom'
import { SITE } from '../lib/site'

export function SiteFooter() {
  return (
    <footer className="footer">
      <div className="footer__row">
        <p className="footer__line footer__cta">
          <Link to="/v/reader/try" className="footer__cta-link">
            {SITE.verb} ↗
          </Link>{' '}
          <span className="footer__cta-dim">every tree is an address:</span>{' '}
          <code>/v/&lt;voice&gt;/&lt;goal&gt;</code>
        </p>
        <p className="footer__line">
          <span className="footer__key">le.seo</span> — marketing optimisation for a collection of
          seeds. One voice, one goal, one order.
        </p>
      </div>
      <div className="footer__row">
        <nav aria-label="Elsewhere" className="footer__links">
          <a href={SITE.repo}>source</a>
          <Link to="/isotope/giardiniera">the isotope</Link>
          <Link to="/tree/voices-and-goals">voices and goals</Link>
          <a href={`${import.meta.env.BASE_URL}llms.txt`}>llms.txt</a>
        </nav>
        <p className="footer__line footer__line--dim">{SITE.handoff}</p>
      </div>
    </footer>
  )
}
