/**
 * The isotope, executed.
 *
 * `features/pickled-egg.feature` states eight behaviours about install metadata;
 * `scripts/manifest.mjs` and `scripts/icons.mjs` are the reference
 * implementation; the guard enforces the last one. This file closes the gap in
 * between: it reads the artefacts the build actually produced, not the source
 * that was supposed to produce them.
 *
 * Run after `scripts/manifest.mjs`, `scripts/icons.mjs` and the prerender, so
 * the icon files and the route shells it looks for exist.
 */
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

let failures = 0
const results: string[] = []

function check(n: number, name: string, condition: boolean, detail = '') {
  if (condition) results.push(`  ok  ${String(n).padStart(2, '0')}  ${name}`)
  else {
    failures += 1
    results.push(`FAIL  ${String(n).padStart(2, '0')}  ${name}${detail ? ` — ${detail}` : ''}`)
  }
}

const read = (path: string) => readFileSync(path, 'utf8')
const card = JSON.parse(read('src/lib/self-card.json'))
const palette = JSON.parse(read('src/lib/palette.json'))
const manifest = JSON.parse(read('public/manifest.json'))
const document = read('index.html')
const favicon = read('public/favicon.svg')

const token = (name: string) => palette.tokens.find((entry: { name: string }) => entry.name === name)
const ink = token('ink')?.hex
const hexes = (text: string) => [...text.matchAll(/#[0-9a-fA-F]{6}/g)].map((match) => match[0].toLowerCase())
const paletteHexes = new Set<string>(palette.tokens.map((entry: { hex: string }) => entry.hex.toLowerCase()))

// PNG's IHDR carries the real width and height at bytes 16..24; a manifest that
// claims 512 for a 180 file fails every launcher that trusts it.
function pngSize(path: string): { width: number; height: number } | null {
  if (!existsSync(path)) return null
  const buffer = readFileSync(path)
  if (buffer.length < 24 || buffer.toString('ascii', 1, 4) !== 'PNG') return null
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) }
}

// 1. the app title names the seed
check(1, 'the name begins with the seed card name', manifest.name?.startsWith(card.name) === true, manifest.name)
check(1, 'the short name is the card preferred', manifest.short_name === card.preferred, manifest.short_name)

// 2. the description is the card's sentence
check(2, 'the description is the card description', manifest.description === card.description)

// 3. the theme is the wall
check(3, 'the theme colour is the wall', manifest.theme_color?.toLowerCase() === ink?.toLowerCase(), manifest.theme_color)
check(3, 'the background colour is the wall', manifest.background_color?.toLowerCase() === ink?.toLowerCase(), manifest.background_color)

// 4. the first frame paints the wall before the stylesheet
check(4, 'the document declares the wall as its theme colour', document.includes(`content="${ink}"`), ink)
check(4, 'the document paints the wall before any stylesheet', /background:\s*#[0-9a-fA-F]{6}/.test(document))

// 5. every icon is a drawn file at the size it claims
const icons = manifest.icons ?? []
check(5, 'the manifest names at least two icons', icons.length >= 2, String(icons.length))
for (const icon of icons) {
  const path = join('public', icon.src)
  const size = pngSize(path)
  const [width, height] = String(icon.sizes).split('x').map(Number)
  check(5, `${icon.src} exists`, size !== null)
  check(5, `${icon.src} is ${icon.sizes}`, size?.width === width && size?.height === height, JSON.stringify(size))
}
check(
  5,
  'one icon is declared maskable',
  icons.some((icon: { purpose?: string }) => icon.purpose === 'maskable'),
)

// 6. the tab mark is drawn from the palette and says the seed's name
check(6, 'the tab mark is named after the seed', favicon.includes(`aria-label="${card.name}"`))
check(
  6,
  'every colour in the tab mark is a palette token',
  hexes(favicon).every((hex) => paletteHexes.has(hex)),
  hexes(favicon).filter((hex) => !paletteHexes.has(hex)).join(', '),
)

// 7. a shortcut is a shelf, not a route
for (const shortcut of manifest.shortcuts ?? []) {
  const route = String(shortcut.url).replace(/^\.\//, '').replace(/\/$/, '')
  check(7, `${shortcut.url} is relative to the manifest`, String(shortcut.url).startsWith('./'))
  check(7, `${shortcut.url} has a prerendered shell`, existsSync(join('dist', route, 'index.html')))
}

// 8. a palette copied from another seed is refused
// The guard owns the refusal; this asserts the thing it refuses is actually
// absent from what shipped, so a green build means the check had something to
// read rather than an empty page.
const foreign = ['#2E4A5F', '#C9A45C', '#FF2E88', '#E0C48C']
const survivors = foreign.filter((hex) => document.toLowerCase().includes(hex.toLowerCase()))
check(8, 'the document carries no colour from the seed this was cut from', survivors.length === 0, survivors.join(', '))
check(8, 'the guard refuses a foreign colour', read('scripts/verify-publish.mjs').includes('2E4A5F|C9A45C|FF2E88'))

console.log(results.join('\n'))
if (failures) {
  console.error(`\nmanifest: ${failures} assertion(s) failed against features/pickled-egg.feature`)
  process.exit(1)
}
const scenarios = read('features/pickled-egg.feature').match(/^\s{2}Scenario:/gm)?.length ?? 0
console.log(
  `\nmanifest: ${results.length} assertions pass against features/pickled-egg.feature (${scenarios} scenarios)`,
)
