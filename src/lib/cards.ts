/**
 * Cards other seeds publish about themselves.
 *
 * A pitch site should quote a seed, not describe it. Each seed publishes
 * `/seed.json` — name, verb, one pitch per voice, live origin, isotopes — and
 * this site **vendors** the card it was built against. Vendored, not fetched:
 * the build is offline and has to stay that way.
 *
 * The copy is pinned by `scripts/cards.mjs`, which re-fetches every card and
 * compares it with the vendored file. `npm run cards:check` fails when a seed
 * has moved, which is the same trade le.railhead makes with the starter's rules:
 * a copy with a catch-up check is a claim that can fail; a fetch at build time is
 * a claim that cannot be tested offline.
 */
export type SeedCard = {
  version: number
  id: string
  name: string
  preferred: string
  verb: string
  kind: 'seed' | 'site' | 'lab' | 'project' | 'isotope'
  live: string
  repo: string
  rung: number
  description: string
  pitches: Record<string, string>
  voices: string[]
  goals: string[]
  ships: string[]
  builtFrom: string[]
  generated: string
  card: string
}

const files = import.meta.glob('../cards/*.json', {
  eager: true,
  import: 'default',
}) as Record<string, SeedCard>

const VENDORED = new Map<string, SeedCard>(
  Object.values(files).map((card) => [card.id, card]),
)

export function cardFor(id: string): SeedCard | undefined {
  return VENDORED.get(id)
}

export function vendoredIds(): string[] {
  return [...VENDORED.keys()].sort()
}

/**
 * The sentence a destination gets in a tree for this voice.
 *
 * The seed's own card wins; a register row's `pitch` is the fallback for a
 * destination that has not published one yet. That ordering is the point: a
 * pitch site may hold the link, but the seed holds the copy.
 */
export function pitchFor(link: { id: string; pitch: string }, voice: string): string {
  const card = cardFor(link.id)
  return card?.pitches[voice] ?? card?.description ?? link.pitch
}
