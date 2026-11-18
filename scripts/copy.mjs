#!/usr/bin/env node
/**
 * The copy gate.
 *
 * The only creative act on this site is the sentence, so the sentence is the
 * thing worth checking. These are the rules a person cannot be trusted to keep
 * on a hurried afternoon: length, a banned list of words that promise more than
 * a repository can keep, a full stop, and the rule that a carded destination's
 * register line must not silently override the seed's own copy.
 *
 * It reads the source, not the built page, so it fails before a render can hide
 * the problem.
 */
import { readFile } from 'node:fs/promises'

const BANNED = [
  'seamless',
  'seamlessly',
  'powerful',
  'revolutionary',
  'cutting-edge',
  'best-in-class',
  'world-class',
  'game-changing',
  'effortless',
  'blazing',
  'ultimate',
  'unleash',
]
const MIN_WORDS = 8
const MAX_WORDS = 34

const failures = []

const tree = await readFile('src/lib/tree.ts', 'utf8')
const registerSource = tree.slice(tree.indexOf('export const LINKS'), tree.indexOf('export const DEFAULT_VOICE'))
const entries = [...registerSource.matchAll(/\n  \{\n(.*?)\n  \},/gs)].map((match) => match[1])

if (entries.length < 6) failures.push(`the register holds ${entries.length} entries — that is not a collection`)

let carded = 0
for (const entry of entries) {
  const id = /id: '([^']+)'/.exec(entry)?.[1] ?? '(unknown)'
  const pitch = /\n\s{4}pitch:\s*'((?:[^'\\]|\\.)*)'/.exec(entry)?.[1]
  const hasCard = /card: 'https?:\/\//.test(entry)
  if (hasCard) carded += 1
  if (!pitch) {
    failures.push(`${id} has no pitch`)
    continue
  }

  const words = pitch.split(/\s+/).filter(Boolean).length
  if (words < MIN_WORDS) failures.push(`${id}: pitch is ${words} words, under ${MIN_WORDS} — a line, not a sentence`)
  if (words > MAX_WORDS) failures.push(`${id}: pitch is ${words} words, over ${MAX_WORDS} — cut it`)
  if (!pitchesAsSentence(pitch)) failures.push(`${id}: pitch does not end with a full stop`)
  if (/!/.test(pitch)) failures.push(`${id}: pitch contains an exclamation mark`)
  for (const word of BANNED) {
    if (new RegExp(`\\b${word}\\b`, 'i').test(pitch)) failures.push(`${id}: pitch uses "${word}"`)
  }
  if (/^(le\.[a-z-]+ is|this is)/i.test(pitch)) {
    failures.push(`${id}: pitch starts with the name — say what the reader gets`)
  }
}

// A carded seed's register line is a fallback; it must not claim to be the copy.
let own = 0
try {
  const cards = await import('node:fs/promises').then((fs) => fs.readdir('src/cards'))
  for (const file of cards.filter((name) => name.endsWith('.json'))) {
    const card = JSON.parse(await readFile(`src/cards/${file}`, 'utf8'))
    if (!card.pitches || !Object.keys(card.pitches).length) failures.push(`${file} carries no pitches`)
    if (!card.verb) failures.push(`${file} has no verb`)
    own += 1
  }
} catch {
  // no vendored cards yet is not a failure; the register falls back
}

if (failures.length) {
  console.error('copy: refused\n')
  for (const failure of failures) console.error(`  ${failure}`)
  console.error('\nThe sentence is the product. Fix the copy or say why the rule is wrong.')
  process.exit(1)
}

console.log(
  `copy: ${entries.length} pitches pass · ${carded} destinations quote a seed's card · ${own} vendored card(s)`,
)

function pitchesAsSentence(text) {
  return /[.!?]$/.test(text.trim())
}
