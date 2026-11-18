/**
 * The tree: a link tree with one voice and one goal.
 *
 * Marketing optimisation for a collection of seeds is a small problem with a
 * big failure mode: a page that offers everything to everyone and therefore
 * says nothing. The fix this seed proposes is a *tree* — a short, ordered set
 * of destinations chosen for **one voice** (who is reading) and **one goal**
 * (what the visit should achieve). Everything else on the site is a way to
 * choose those two values.
 *
 * The function below is pure, like a desk: same inputs, same tree. That is what
 * lets a tree be a URL (`/v/<voice>/<goal>`) and a citation — two people who
 * open the same address see the same order.
 *
 * The same record pitches things that are not seeds. `kind` says what a link
 * is, and the rules do not change: one voice, one goal, live destinations.
 */

/** Who is reading. The shelf's four, because a pitch is for a person. */
export const VOICES = [
  {
    id: 'reader',
    label: 'reader',
    asks: 'reads the concepts; will not run anything',
  },
  {
    id: 'grower',
    label: 'grower',
    asks: 'wants to run one, or start one from a template',
  },
  {
    id: 'maintainer',
    label: 'maintainer',
    asks: 'keeps a site true to the rules it claims',
  },
  {
    id: 'packager',
    label: 'packager',
    asks: 'designs the next seed, or the isotope it should ship',
  },
] as const

export type Voice = (typeof VOICES)[number]['id']

/**
 * What the visit should achieve. A goal is a verb, in the same sense as a
 * seed's verb — it says what the reader does next, not what the page says.
 */
export const GOALS = [
  { id: 'try', label: 'try', asks: 'open one and use it' },
  { id: 'adopt', label: 'adopt', asks: 'take it into something you already run' },
  { id: 'verify', label: 'verify', asks: 'check a claim against its source' },
  { id: 'fund', label: 'fund', asks: 'decide whether the cost is worth it' },
] as const

export type Goal = (typeof GOALS)[number]['id']

import { pitchFor } from './cards'

export type LinkKind = 'seed' | 'site' | 'isotope' | 'lab' | 'project'

export type Link = {
  id: string
  name: string
  /** absolute, https, no trailing slash unless the host needs one */
  url: string
  /**
   * One line: what this is. A fallback — if the seed publishes a card, the
   * card's pitch for this voice wins, because the seed owns its own copy.
   */
  pitch: string
  /** the seed's own /seed.json, when it publishes one */
  card?: string
  kind: LinkKind
  voices: Voice[]
  goals: Goal[]
  /** the readiness its front door assumes, 1–4 — the order a tree is printed in */
  rung: number
}

/**
 * The register. Every row is a destination someone could be sent to.
 *
 * A tree never invents a link; it chooses among these. That is the difference
 * between a pitch and a brainstorm.
 */
export const LINKS: Link[] = [
  {
    id: 'le.gume',
    name: 'le.gume',
    url: 'https://james-gibson.github.io/le.gume',
    pitch: 'The starter: a documentation site that documents itself, and the shape every seed is cut from.',
    kind: 'seed',
    voices: ['reader', 'grower', 'maintainer', 'packager'],
    goals: ['try', 'adopt', 'verify'],
    rung: 2,
  },
  {
    id: 'le.plot',
    name: 'le.plot',
    url: 'https://james-gibson.github.io/le.plot',
    pitch: 'The whole family as entity tables on one page — what runs, what was cut, and who checks it.',
    kind: 'site',
    voices: ['reader', 'maintainer'],
    goals: ['try', 'verify'],
    rung: 1,
  },
  {
    id: 'le.ad',
    name: 'le.ad',
    url: 'https://james-gibson.github.io/le.ad',
    card: 'https://james-gibson.github.io/le.ad/seed.json',
    pitch: 'An empty hot desk: six desks, one claim at a time, a lease that returns them.',
    kind: 'seed',
    voices: ['reader', 'packager'],
    goals: ['try', 'verify'],
    rung: 1,
  },
  {
    id: 'le.railhead',
    name: 'le.railhead',
    url: 'https://james-gibson.github.io/le.railhead',
    pitch: 'Somebody else’s environment, kept to the rules — and one rule behind, on the record.',
    kind: 'seed',
    voices: ['maintainer'],
    goals: ['verify', 'adopt'],
    rung: 3,
  },
  {
    id: 'le.gume-energy',
    name: 'le.gume-energy',
    url: 'https://james-gibson.github.io/le.gume-energy',
    pitch: 'A household’s solar record: exports, charts and the interventions that explain the gaps.',
    kind: 'seed',
    voices: ['reader'],
    goals: ['try', 'fund'],
    rung: 1,
  },
  {
    id: 'le.gume-shell',
    name: 'le.gume-shell',
    url: 'https://james-gibson.github.io/le.gume-shell',
    pitch: 'The cluster, made visual: what runs, what it costs, and what happens if you stop it.',
    kind: 'seed',
    voices: ['maintainer'],
    goals: ['verify', 'fund'],
    rung: 3,
  },
  {
    id: 'le.go',
    name: 'le.go',
    url: 'https://james-gibson.github.io/le.go',
    pitch: 'The 42i system explained through citations — distance made concrete.',
    kind: 'seed',
    voices: ['reader', 'packager'],
    goals: ['try', 'verify'],
    rung: 1,
  },
  {
    id: 'lemon-x-files',
    name: 'lemon-x-files',
    url: 'https://github.com/gibsunas/lemon-x-files',
    pitch: 'The start agents and CI install instead of writing a workspace; spawn.json holds the slots.',
    kind: 'project',
    voices: ['grower', 'packager'],
    goals: ['adopt', 'try'],
    rung: 3,
  },
  {
    id: 'ade-stand',
    name: '@lemon/ade-stand',
    url: 'https://github.com/gibsunas/lemon-ade-stand',
    pitch: 'One command to install a ready-made workspace: npm create @lemon/ade-stand.',
    kind: 'project',
    voices: ['grower'],
    goals: ['try', 'adopt'],
    rung: 3,
  },
  {
    id: 'fire-marshall',
    name: 'fire-marshall',
    url: 'https://github.com/james-gibson/fire-marshall',
    pitch: 'The counter display: every protection the lab declares, against the state it is in.',
    kind: 'lab',
    voices: ['maintainer', 'packager'],
    goals: ['verify'],
    rung: 4,
  },
  {
    id: 'isotope',
    name: 'isotope',
    url: 'https://github.com/james-gibson/isotope',
    pitch: 'The 42i trust protocol as a library: distance, rungs, and what a caller may read.',
    kind: 'lab',
    voices: ['packager'],
    goals: ['adopt', 'verify'],
    rung: 4,
  },
  {
    id: 'that-train-dashboard',
    name: 'that-train-dashboard',
    url: 'https://james-gibson.github.io/that-train-dashboard',
    pitch: 'A research team reading a simulation as a dashboard, with its studies register behind it.',
    kind: 'seed',
    voices: ['reader', 'packager'],
    goals: ['try', 'fund'],
    rung: 1,
  },
]

export const DEFAULT_VOICE: Voice = 'reader'
export const DEFAULT_GOAL: Goal = 'try'

export function isVoice(value: string | undefined): value is Voice {
  return !!value && VOICES.some((voice) => voice.id === value)
}

export function isGoal(value: string | undefined): value is Goal {
  return !!value && GOALS.some((goal) => goal.id === value)
}

/** A link as it appears in a tree: the seed's own pitch, if it published one. */
export type TreeLink = Link & { pitch: string }

export type Tree = {
  voice: Voice
  goal: Goal
  links: TreeLink[]
  /**
   * How the set was chosen: `exact` when at least one row answers both
   * questions, `voice` when the goal has no match and the tree falls back to
   * the voice, `all` when neither does. A tree is never empty, because an empty
   * pitch page is a worse answer than a broad one.
   */
  basis: 'exact' | 'voice' | 'all'
}

/** Order is deliberate: the least demanding front door first, then by name. */
function order(a: Link, b: Link): number {
  return a.rung - b.rung || a.name.localeCompare(b.name)
}

function resolve(links: Link[], voice: Voice): TreeLink[] {
  return links
    .sort(order)
    .map((link) => ({ ...link, pitch: pitchFor(link, voice) }))
}

export function tree(voice: Voice, goal: Goal, links: Link[] = LINKS): Tree {
  const exact = links.filter((link) => link.voices.includes(voice) && link.goals.includes(goal))
  if (exact.length) return { voice, goal, links: resolve(exact, voice), basis: 'exact' }

  const byVoice = links.filter((link) => link.voices.includes(voice))
  if (byVoice.length) return { voice, goal, links: resolve(byVoice, voice), basis: 'voice' }

  return { voice, goal, links: resolve([...links], voice), basis: 'all' }
}

/**
 * The tree as a citation: two people opening this address must see the same
 * order. The record is the links' ids and the two values that chose them.
 */
export function treeRecord(result: Tree): string {
  return JSON.stringify({
    voice: result.voice,
    goal: result.goal,
    basis: result.basis,
    links: result.links.map((link) => link.id),
  })
}

/** A tree address, for a link, a QR code or a paste. */
export function treePath(voice: Voice, goal: Goal): string {
  return `/v/${voice}/${goal}`
}
