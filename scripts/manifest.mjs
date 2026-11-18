#!/usr/bin/env node
/**
 * The manifest, generated so it cannot describe a site it no longer is.
 *
 * le.seo's install metadata arrived as le.ad's: the same copied `index.html`
 * referenced icons that were never drawn, named the desk's steelblue as the
 * theme, and had no manifest at all. This file is the fix, and the rule that
 * keeps it fixed: every field that could go stale is read from the thing that
 * owns it.
 *
 *   name / short_name / description   ← src/lib/self-card.json (the seed's card)
 *   theme_color / background_color    ← src/lib/palette.json (the wall)
 *   icons                             ← files scripts/icons.mjs just drew
 *
 * A manifest that names a missing icon is worse than no manifest, because the
 * browser reports the install as broken and the guard cannot see it.
 */
import { accessSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const card = JSON.parse(readFileSync('src/lib/self-card.json', 'utf8'))
const palette = JSON.parse(readFileSync('src/lib/palette.json', 'utf8'))

const token = (name) => {
  const found = palette.tokens.find((entry) => entry.name === name)
  if (!found) {
    console.error(`manifest: src/lib/palette.json has no "${name}"`)
    process.exit(1)
  }
  return found.hex
}

const icons = [
  { file: 'icons/icon-192.png', sizes: '192x192', purpose: 'any' },
  { file: 'icons/icon-512.png', sizes: '512x512', purpose: 'any' },
  { file: 'icons/maskable-512.png', sizes: '512x512', purpose: 'maskable' },
  { file: 'icons/apple-touch-icon.png', sizes: '180x180', purpose: 'any' },
]

for (const icon of icons) {
  try {
    accessSync(join('public', icon.file))
  } catch {
    console.error(`manifest: public/${icon.file} is named in the manifest but was never drawn`)
    process.exit(1)
  }
}

const wall = token('ink')

const manifest = {
  id: '/le.seo/',
  name: `${card.name} — ${card.verb}`,
  short_name: card.preferred,
  description: card.description,
  lang: 'en',
  dir: 'ltr',
  start_url: './',
  scope: './',
  display: 'standalone',
  display_override: ['standalone', 'minimal-ui'],
  orientation: 'any',
  background_color: wall,
  theme_color: wall,
  categories: ['business', 'productivity', 'developer'],
  icons: icons.map((icon) => ({
    src: icon.file,
    sizes: icon.sizes,
    type: 'image/png',
    purpose: icon.purpose,
  })),
  // The two front doors a link tree actually has. A shortcut that pointed at a
  // route without a prerendered shell would open the SPA and then 404.
  shortcuts: [
    { name: 'reader · try', short_name: 'reader', url: './v/reader/try/' },
    { name: 'grower · adopt', short_name: 'grower', url: './v/grower/adopt/' },
  ],
}

for (const shortcut of manifest.shortcuts) {
  if (!shortcut.url.startsWith('./')) {
    console.error(`manifest: shortcut ${shortcut.url} must be relative to the manifest`)
    process.exit(1)
  }
}

writeFileSync('public/manifest.json', `${JSON.stringify(manifest, null, 2)}\n`)
console.log(
  `manifest: public/manifest.json — "${manifest.name}", ${manifest.icons.length} icons, ` +
    `${manifest.shortcuts.length} shortcuts, theme ${manifest.theme_color}`,
)
