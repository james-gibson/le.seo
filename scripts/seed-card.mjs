#!/usr/bin/env node
/**
 * Render the seed's own card to /seed.json.
 *
 * The source is src/lib/self-card.json — the same file the site imports — so the
 * published card and the rendered page cannot disagree about a string. This
 * script only adds the two fields that are facts about the build rather than
 * about the seed: the date, and the URL a consumer should cite.
 */
import { readFile, writeFile } from 'node:fs/promises'

const card = JSON.parse(await readFile('src/lib/self-card.json', 'utf8'))

for (const required of ['id', 'name', 'live', 'repo', 'verb', 'description', 'pitches']) {
  if (!card[required]) {
    console.error(`seed-card: src/lib/self-card.json has no ${required}`)
    process.exit(1)
  }
}
if (!card.live.startsWith('https://')) {
  console.error('seed-card: live must be https')
  process.exit(1)
}

const published = {
  ...card,
  generated: new Date().toISOString().slice(0, 10),
  card: `${card.live}/seed.json`,
}

await writeFile('public/seed.json', `${JSON.stringify(published, null, 2)}\n`)
console.log(
  `seed-card: public/seed.json — ${published.id}, ${Object.keys(published.pitches).length} pitches, verb "${published.verb}"`,
)
