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
const cards = [...source.matchAll(/card: '([^']+)'/g)].map((match) => match[1])
if (!cards.length) {
  console.error('cards: the register names no cards')
  process.exit(1)
}

let stale = 0
for (const url of cards) {
  const id = /\/\/([^/]+)\//.exec(url)?.[1] ?? url
  const target = `src/cards/${id}.json`
  let fetched
  try {
    const response = await fetch(url)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    fetched = (await response.text()).trim()
  } catch (error) {
    if (check) {
      // The check runs in CI with network; if it cannot reach a card, say so
      // rather than pretending the copy is current.
      console.error(`cards: ${url} unreachable — ${error.message}`)
      stale += 1
    } else {
      console.error(`cards: ${url} unreachable — ${error.message}`)
    }
    continue
  }

  const parsed = JSON.parse(fetched)
  if (!parsed.id || !parsed.pitches || !Object.keys(parsed.pitches).length) {
    console.error(`cards: ${url} is not a seed card`)
    stale += 1
    continue
  }

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
