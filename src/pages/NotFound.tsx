import { Link } from 'react-router-dom'
import { GOALS, VOICES, treePath } from '../lib/tree'
import { usePageMeta } from '../lib/use-page-meta'

export function NotFound() {
  usePageMeta('Not found', 'That tree is not here.')

  return (
    <div className="page page--404">
      <p className="doc__kicker">404</p>
      <h1 className="doc__title">No tree here.</h1>
      <p className="doc__lede">
        A tree is <code>/v/&lt;voice&gt;/&lt;goal&gt;</code>, and one of those two values is not on
        the shelf. Start from a reader who wants to try:
      </p>
      <p>
        <Link to={treePath('reader', 'try')}>reader / try</Link>
      </p>
      <ul className="notfound__list">
        {VOICES.map((voice) => (
          <li key={voice.id}>
            {voice.label}: {GOALS.map((goal, index) => (
              <span key={goal.id}>
                {index ? ' · ' : ' '}
                <Link to={treePath(voice.id, goal.id)}>{goal.label}</Link>
              </span>
            ))}
          </li>
        ))}
      </ul>
    </div>
  )
}
