import { useNavigate } from 'react-router-dom'
import { GOALS, VOICES, tree, treePath, type Goal, type Voice } from '../lib/tree'
import { TreeBoard } from '../components/TreeBoard'
import { usePageMeta } from '../lib/use-page-meta'

export function TreePage({ voice, goal }: { voice: Voice; goal: Goal }) {
  const navigate = useNavigate()
  const result = tree(voice, goal)
  const voiceMeta = VOICES.find((entry) => entry.id === voice)!
  const goalMeta = GOALS.find((entry) => entry.id === goal)!

  usePageMeta(
    `${voice} · ${goal}`,
    `A tree for the ${voiceMeta.label} who wants to ${goalMeta.label}: ${result.links.length} destinations in order.`,
  )

  return (
    <div className="page page--tree">
      <header className="doc__head">
        <p className="doc__kicker">a tree</p>
        <h1 className="doc__title">
          {voiceMeta.label} <span className="doc__sep">/</span> {goalMeta.label}
        </h1>
        <p className="doc__lede">
          {result.links.length} destinations, in the order a {voiceMeta.label} should meet them.
          The address is the tree: send it, or change either value.
        </p>
      </header>

      <TreeBoard
        voice={voice}
        goal={goal}
        onVoice={(next) => navigate(treePath(next, goal))}
        onGoal={(next) => navigate(treePath(voice, next))}
      />
    </div>
  )
}
