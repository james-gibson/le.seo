/**
 * The isotope, executed.
 *
 * `features/giardiniera.feature` states ten behaviours; `src/lib/tree.ts` is the
 * reference implementation; the page renders it. This file closes the last gap:
 * it runs the implementation against the same statements.
 */
import { GOALS, LINKS, tree, treePath, treeRecord, type Link } from '../src/lib/tree'

let failures = 0
const results: string[] = []

function check(n: number, name: string, condition: boolean, detail = '') {
  if (condition) results.push(`  ok  ${String(n).padStart(2, '0')}  ${name}`)
  else {
    failures += 1
    results.push(`FAIL  ${String(n).padStart(2, '0')}  ${name}${detail ? ` — ${detail}` : ''}`)
  }
}

const link = (over: Partial<Link> & Pick<Link, 'id'>): Link => ({
  name: over.id,
  url: `https://example.org/${over.id}`,
  pitch: 'a link',
  kind: 'seed',
  voices: ['reader'],
  goals: ['try'],
  rung: 2,
  ...over,
})

// 1. an exact tree keeps only the links that answer both questions
{
  const register = [
    link({ id: 'a', voices: ['reader'], goals: ['try'] }),
    link({ id: 'b', voices: ['maintainer'], goals: ['verify'] }),
  ]
  const result = tree('reader', 'try', register)
  check(1, 'exact tree holds only the link that answers both', result.links.length === 1 && result.links[0].id === 'a')
  check(1, 'exact tree does not hold the other link', !result.links.some((entry) => entry.id === 'b'))
  check(1, 'basis is exact', result.basis === 'exact')
}

// 2. falls back to the voice when the goal has no match
{
  const register = [link({ id: 'a', voices: ['packager'], goals: ['adopt'] })]
  const result = tree('packager', 'fund', register)
  check(2, 'voice fallback keeps the link', result.links.length === 1)
  check(2, 'basis is voice', result.basis === 'voice')
}

// 3. falls back to everything when the voice has nothing either
{
  const register = [link({ id: 'a', voices: ['maintainer'], goals: ['verify'] })]
  const result = tree('grower', 'fund', register)
  check(3, 'all fallback keeps the link', result.links.length === 1)
  check(3, 'basis is all', result.basis === 'all')
}

// 4. never empty
{
  const empty = tree('reader', 'try', [link({ id: 'only', voices: ['packager'], goals: ['fund'] })])
  check(4, 'a register with one link always yields at least one', empty.links.length >= 1)
}

// 5. ordered by readiness, then name
{
  const register = [
    link({ id: 'late', rung: 3 }),
    link({ id: 'early', rung: 1 }),
    link({ id: 'zebra', rung: 1 }),
    link({ id: 'alpha', rung: 1 }),
  ]
  const result = tree('reader', 'try', register)
  const ids = result.links.map((entry) => entry.id)
  check(5, 'rung 1 comes before rung 3', ids.indexOf('early') < ids.indexOf('late'))
  check(5, 'same rung sorts by name', ids.join(',') === 'alpha,early,zebra,late', ids.join(','))
}

// 6. never repeats
{
  const result = tree('reader', 'try')
  const ids = result.links.map((entry) => entry.id)
  check(6, 'no destination appears twice', new Set(ids).size === ids.length)
  check(6, 'the register is not empty', ids.length > 0)
}

// 7. one destination may serve two trees
{
  const both = link({ id: 'both', voices: ['reader', 'grower'], goals: ['try'] })
  check(7, 'appears for the reader', tree('reader', 'try', [both]).links.some((entry) => entry.id === 'both'))
  check(7, 'appears for the grower', tree('grower', 'try', [both]).links.some((entry) => entry.id === 'both'))
}

// 8. the same record pitches a project
{
  const project = link({ id: 'proj', kind: 'project', voices: ['grower'], goals: ['adopt'] })
  const result = tree('grower', 'adopt', [project])
  check(8, 'a project is in the tree', result.links.some((entry) => entry.id === 'proj'))
  check(8, 'the basis does not change with kind', result.basis === 'exact')
  check(8, 'the register already carries a project', LINKS.some((entry) => entry.kind === 'project'))
}

// 9. a tree published twice is the same tree
{
  const a = treeRecord(tree('reader', 'try'))
  const b = treeRecord(tree('reader', 'try'))
  check(9, 'two records are identical', a === b)
  check(9, 'the record carries the voice and the goal', a.includes('"voice"') && a.includes('"goal"'))
}

// 10. a tree address carries both values
{
  const path = treePath('reader', 'try')
  check(10, 'the address names the voice', path.startsWith('/v/reader/'))
  check(10, 'the address names the goal', path.endsWith('/try'))
}

// every voice/goal pair is renderable — the site publishes all of them
let pairs = 0
for (const voice of ['reader', 'grower', 'maintainer', 'packager'] as const) {
  for (const goal of GOALS) {
    const result = tree(voice, goal.id)
    if (result.links.length === 0) {
      failures += 1
      results.push(`FAIL  pair ${voice}/${goal.id} yields an empty tree`)
    }
    pairs += 1
  }
}
check(0, `all ${pairs} voice/goal pairs yield a tree`, true)

console.log(results.join('\n'))
console.log(
  failures
    ? `\ntree: ${failures} assertion(s) failed — the page may not claim the isotope`
    : `\ntree: ${results.length} assertions pass against features/giardiniera.feature (10 scenarios)`,
)
process.exit(failures ? 1 : 0)
