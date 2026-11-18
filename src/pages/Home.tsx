import { Link, useNavigate } from 'react-router-dom'
import { TreeBoard } from '../components/TreeBoard'
import { GOALS, LINKS, VOICES, treePath } from '../lib/tree'
import { usePageMeta } from '../lib/use-page-meta'
import { Rule, Text } from '../ui/parts'

export function Home() {
  usePageMeta(
    'le.seo',
    'Marketing optimisation for a collection of seeds: one voice, one goal, one ordered tree of links.',
  )
  const navigate = useNavigate()

  return (
    <div className="page page--home">
      <section className="plate">
        <p className="plate__eyebrow">
          <span className="dot dot--live" aria-hidden="true" /> {LINKS.length} destinations ·{' '}
          {VOICES.length} voices · {GOALS.length} goals
        </p>
        <h1 className="plate__title">
          A link tree,
          <br />
          <span className="plate__accent">not a list of everything.</span>
        </h1>
        <p className="plate__lede">
          Marketing a collection of seeds fails the same way every time: offer everything to
          everyone and the page says nothing. A tree is short, ordered, and chosen for one reader
          and one purpose. Pick the two values below — the address changes, so the tree you are
          looking at is a link you can send.
        </p>
        <p className="plate__meta">
          <a href={`${import.meta.env.BASE_URL}llms.txt`}>llms.txt</a> ·{' '}
          <Link to="/isotope/giardiniera">the isotope</Link> ·{' '}
          <a href="#tree-heading">the tree</a>
        </p>
      </section>

      <section aria-labelledby="tree-heading">
        <h2 className="section-title" id="tree-heading">
          the tree
        </h2>
        <TreeBoard
          voice="reader"
          goal="try"
          onVoice={(voice) => navigate(treePath(voice, 'try'))}
          onGoal={(goal) => navigate(treePath('reader', goal))}
        />
      </section>

      <Rule />

      <section aria-labelledby="why-heading">
        <h2 className="section-title" id="why-heading">
          why a tree
        </h2>
        <div className="prose">
          <p className="prose-p">
            A link tree is the smallest marketing artifact that is still honest. It claims a
            reader, it claims a purpose, and it puts the destinations in an order. Everything it
            leaves out is a decision somebody made, and the address records it.
          </p>
          <p className="prose-p">
            It is also the same artifact for things that are not seeds. This seed pitches a
            template, a generator and a protocol library alongside its own family; the kind in the
            record is a label, and the rules do not change with it.
          </p>
          <p className="prose-p">
            <Text tone="muted" size="small" as="span">
              <Link to="/isotope/giardiniera">giardiniera</Link> is the isotope behind it — a mixed
              assortment served in one order. It is built from{' '}
              <a href="https://james-gibson.github.io/le.gume/isotopes/silverskin/">silverskin</a>{' '}
              and <a href="https://james-gibson.github.io/le.gume/isotopes/cornichon/">cornichon</a>
              , the shape and the recurring check, because a tree is a site with a scheduled audit.
            </Text>
          </p>
        </div>
      </section>
    </div>
  )
}
