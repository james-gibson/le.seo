import { NavLink } from 'react-router-dom'
import { SECTIONS } from '../lib/content'

export function SiteHeader() {
  return (
    <header className="masthead">
      <a className="skip" href="#main">
        skip to the tree
      </a>
      <NavLink to="/" className="brand" aria-label="le.seo — the tree">
        <span className="brand__mark" aria-hidden="true">
          <span className="brand__desk" />
          <span className="brand__lamp" />
        </span>
        <span className="brand__name">
          le<span className="brand__dot">.</span>seo
        </span>
        <span className="brand__sub">a tree, not a list</span>
      </NavLink>

      <nav aria-label="Sections" className="nav">
        {SECTIONS.map((section) => (
          <NavLink
            key={section.id}
            to={`/${section.id}`}
            className={({ isActive }) => `nav__link ${isActive ? 'is-active' : ''}`}
          >
            {section.label}
          </NavLink>
        ))}
        <NavLink to="/v/reader/try" className={({ isActive }) => `nav__link ${isActive ? 'is-active' : ''}`}>
          A tree
        </NavLink>
      </nav>
    </header>
  )
}
