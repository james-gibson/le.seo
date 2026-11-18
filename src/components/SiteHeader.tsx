import { NavLink } from 'react-router-dom'
import { SECTIONS } from '../lib/content'

export function SiteHeader() {
  return (
    <header className="masthead">
      <a className="skip" href="#main">
        skip to the tree
      </a>
      <NavLink to="/" className="brand" aria-label="le.seo — the tree">
        {/* The same tree the launcher gets, redrawn at tab size: the 64-unit
            icon's strokes fall under a pixel at 20px, so this mark carries its
            own geometry and the same four tokens. */}
        <svg className="brand__mark" viewBox="0 0 32 32" aria-hidden="true" focusable="false">
          <rect x="5" y="27" width="22" height="1.2" fill="var(--le-line)" opacity=".85" />
          <rect x="15" y="12" width="2" height="15" fill="var(--le-lilac)" />
          <rect x="7" y="19" width="8" height="2" fill="var(--le-lilac)" />
          <rect x="17" y="15" width="8" height="2" fill="var(--le-lilac)" />
          <circle cx="8" cy="16.6" r="2.6" fill="var(--le-pink)" />
          <circle cx="24.5" cy="12.6" r="2.2" fill="var(--le-butter)" />
          <circle cx="16" cy="9.4" r="2" fill="var(--le-mint)" />
        </svg>
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
