import { Link } from 'react-router-dom'
import { GOALS, VOICES, isGoal, isVoice, tree, type Goal, type Tree, type Voice } from '../lib/tree'
import { Button } from '../ui/controls'
import { Badge, Row, Text } from '../ui/parts'

/**
 * The tree board.
 *
 * Two controls, one address. Changing either value navigates, so the tree a
 * reader is looking at is always a URL they can copy — and the controls are
 * real controls: they change the list, they are not decoration inherited from
 * another seed.
 */
export function TreeBoard({
  voice,
  goal,
  onVoice,
  onGoal,
}: {
  voice: Voice
  goal: Goal
  onVoice: (voice: Voice) => void
  onGoal: (goal: Goal) => void
}) {
  const result: Tree = tree(voice, goal)
  const voiceMeta = VOICES.find((entry) => entry.id === result.voice)!
  const goalMeta = GOALS.find((entry) => entry.id === result.goal)!

  return (
    <>
      <div className="board">
        <div className="board__pickers">
          <div className="picker" role="group" aria-label="Who is reading">
            <p className="picker__label">voice</p>
            <div className="picker__options">
              {VOICES.map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  className={`chip ${entry.id === voice ? 'is-on' : ''}`}
                  aria-pressed={entry.id === voice}
                  onClick={() => onVoice(entry.id)}
                  title={entry.asks}
                >
                  {entry.label}
                </button>
              ))}
            </div>
          </div>

          <div className="picker" role="group" aria-label="What the visit should achieve">
            <p className="picker__label">goal</p>
            <div className="picker__options">
              {GOALS.map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  className={`chip ${entry.id === goal ? 'is-on' : ''}`}
                  aria-pressed={entry.id === goal}
                  onClick={() => onGoal(entry.id)}
                  title={entry.asks}
                >
                  {entry.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="board__note">
          <Text tone="muted" size="small" as="p">
            <span className="board__voice">{voiceMeta.label}</span> — {voiceMeta.asks}. Wants to{' '}
            <span className="board__goal">{goalMeta.label}</span>: {goalMeta.asks}.{' '}
            {result.basis === 'exact'
              ? `${result.links.length} destination${result.links.length === 1 ? '' : 's'} answer both.`
              : result.basis === 'voice'
                ? 'Nothing answers that goal for this voice, so the tree falls back to the voice.'
                : 'Nothing answers either, so the tree falls back to everything.'}
          </Text>
        </div>
      </div>

      <ol className="tree">
        {result.links.map((link, index) => (
          <li className="tree__item" key={link.id}>
            <span className="tree__index" aria-hidden="true">
              {String(index + 1).padStart(2, '0')}
            </span>
            <div className="tree__body">
              <div className="tree__head">
                <a className="tree__name" href={link.url}>
                  {link.name}
                  <span aria-hidden="true"> ↗</span>
                </a>
                <Badge label={link.kind} intent={link.kind === 'seed' ? 'accent' : 'muted'} />
                <span className="tree__rung" title={`readiness ${link.rung}`}>
                  rung {link.rung}
                </span>
              </div>
              <p className="tree__pitch">{link.pitch}</p>
            </div>
          </li>
        ))}
      </ol>

      <Row gap={2} wrap>
        <Button
          variant="ghost"
          onClick={() => {
            void navigator.clipboard?.writeText(window.location.href)
          }}
        >
          copy this tree
        </Button>
        <Text tone="muted" size="small" as="span">
          order is rung, then name — the same address shows the same list
        </Text>
      </Row>

      <p className="tree__all">
        <Link to="/tree/voices-and-goals">How a voice and a goal choose an order</Link>
        {' · '}
        <Link to="/tree/a-seed-describes-itself">Where the pitch copy comes from</Link>
      </p>
    </>
  )
}
