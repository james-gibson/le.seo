#!/usr/bin/env node
/**
 * Vendored cards, and the catch-up check.
 *
 * Each seed publishes `/seed.json`. This script copies every card the register
 * names into `src/cards/` — and with `--check` it only compares, failing when a
 * seed has moved. That is the same trade le.railhead makes with the starter's
 * rules: a copy with a check is a claim that can fail; fetching at build time
 * would make the build depend on eleven origins.
 *
 *   node scripts/cards.mjs           write the vendored copies
 *   node scripts/cards.mjs --check   fail if any card differs from what shipped
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises'

const check = process.argv.includes('--check')
const source = await readFile('src/lib/tree.ts', 'utf8')

// The site's own card cannot be fetched before the deploy that publishes it, so
// it is compared against the file the build just rendered instead.
const selfCard = JSON.parse(await readFile('src/lib/self-card.json', 'utf8'))
const selfUrl = `${selfCard.live}/seed.json`
const cards = [...source.matchAll(/card: '([^']+)'/g)].map((match) => match[1])
if (!cards.length) {
  console.error('cards: the register names no cards')
  process.exit(1)
}

let stale = 0
for (const url of cards) {
  const self = url === selfUrl
  let fetched
  if (self) {
    fetched = (await readFile('public/seed.json', 'utf8')).trim()
  } else {
    try {
      const response = await fetch(url)
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      fetched = (await response.text()).trim()
    } catch (error) {
      // An origin that is down is not a seed that moved. If a vendored copy
      // exists there is a sentence to quote and CI should not go red because
      // somebody else's deploy is restarting; if there is none, nothing can be
      // quoted and that is a failure.
      const guess = new URL(url)
      const guessId = guess.pathname.split('/').filter(Boolean)[0] ?? 'unknown'
      const existing = `src/cards/${guessId}.json`
      let present = false
      try {
        await readFile(existing, 'utf8')
        present = true
      } catch {
        present = false
      }
      if (!present) {
        console.error(`cards: ${url} unreachable and no vendored copy — ${error.message}`)
        stale += 1
      } else {
        console.warn(`cards: ${url} unreachable, vendored copy kept (${existing}) — ${error.message}`)
      }
      continue
    }
  }

  let parsed
  try {
    parsed = JSON.parse(fetched)
  } catch {
    console.error(`cards: ${url} is not JSON`)
    stale += 1
    continue
  }
  if (!parsed.id || !parsed.pitches || !Object.keys(parsed.pitches).length) {
    console.error(`cards: ${url} is not a seed card (no id or no pitches)`)
    stale += 1
    continue
  }

  const target = `src/cards/${parsed.id}.json`

  if (check) {
    let current = ''
    try {
      current = (await readFile(target, 'utf8')).trim()
    } catch {
      current = ''
    }
    // `generated` moves on every build; compare the content that matters.
    const strip = (text) => {
      const card = JSON.parse(text)
      delete card.generated
      return JSON.stringify(card)
    }
    if (!current || strip(current) !== strip(fetched)) {
      console.error(`cards: ${target} is stale — run npm run cards and commit the diff`)
      stale += 1
    } else {
      console.log(`cards: ${target} current`)
    }
    continue
  }

  await mkdir('src/cards', { recursive: true })
  await writeFile(target, `${fetched}\n`)
  console.log(`cards: ${target} — ${parsed.id}, ${Object.keys(parsed.pitches).length} pitches`)
}

if (check && stale) {
  console.error(`\ncards: ${stale} card(s) need attention`)
  process.exit(1)
}
