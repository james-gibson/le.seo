#!/usr/bin/env node
/**
 * The stylesheet and the measurement have to agree.
 *
 * `palette.json` is what the contrast gate reads. `theme.css` is what paints
 * the page. Two files that describe the same colour is a bug waiting for a
 * quiet Tuesday, so this compares them name by name and hex by hex, in both
 * directions: a token with no custom property is a colour the page cannot use,
 * and a custom property with no token is a colour nobody measured.
 */
import { readFileSync } from 'node:fs'

const palette = JSON.parse(readFileSync('src/lib/palette.json', 'utf8'))
const css = readFileSync('src/ui/theme.css', 'utf8')

const declarations = new Map()
for (const match of css.matchAll(/--le-([a-z0-9-]+)\s*:\s*(#[0-9a-fA-F]{6})\s*;/g)) {
  declarations.set(match[1], match[2].toUpperCase())
}

const tokens = new Map()
for (const token of palette.tokens) {
  if (token.hex) tokens.set(token.name, token.hex.toUpperCase())
}

const failures = []

for (const [name, hex] of tokens) {
  if (!declarations.has(name)) {
    failures.push(`--le-${name} is a token with no custom property in src/ui/theme.css`)
    continue
  }
  if (declarations.get(name) !== hex) {
    failures.push(
      `--le-${name} paints ${declarations.get(name)} but src/lib/palette.json declares ${hex}`,
    )
  }
}

for (const [name] of declarations) {
  if (!tokens.has(name)) {
    failures.push(`--le-${name} paints a colour that is not in src/lib/palette.json`)
  }
}

if (failures.length) {
  console.error('tokens: the stylesheet and the palette disagree\n')
  for (const failure of failures) console.error(`  ${failure}`)
  process.exit(1)
}

console.log(`tokens: ${tokens.size} tokens agree between src/ui/theme.css and src/lib/palette.json`)
