#!/usr/bin/env node
/**
 * The palette gate, and the ink audit.
 *
 * Adapted from le.gume: the same gate, reading le.seo's palette and ink names.
 * `src/lib/palette.json` declares the pairs the site actually paints and the
 * minimum each must clear. The colour page renders the same numbers, so the
 * page and the build cannot disagree about what passes.
 *
 * That check alone is not enough, and this file used to stop there. It compared
 * every ink to the *background* and never to another ink, so a chart could paint
 * two series in shades 1.45:1 apart and pass: each was legible on white, and
 * neither was legible against the other. It also read the class name, not the
 * colour that reaches the screen, so `text-muted/70` counted as `muted`.
 *
 * The audit below is the part that would have caught it. It reads the built
 * SVGs, resolves every `currentColor` to the token its class names, applies the
 * alpha that class and that element actually carry, and then checks the three
 * things a reader needs:
 *
 *   1. every painted ink is a declared token (no ink by inheritance),
 *   2. an ink and the ground it sits on clear the token's floor *after* alpha,
 *   3. two marks that touch clear 3:1 against each other, and text anchored
 *      inside a mark clears 4.5:1 against that mark (WCAG 1.4.11 and 1.4.3).
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const channel = (value) => {
  const v = value / 255
  return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
}

const luminance = (hex) => {
  const n = parseInt(hex.replace('#', ''), 16)
  return (
    0.2126 * channel((n >> 16) & 255) +
    0.7152 * channel((n >> 8) & 255) +
    0.0722 * channel(n & 255)
  )
}

const contrast = (a, b) => {
  const la = luminance(a)
  const lb = luminance(b)
  const [hi, lo] = la > lb ? [la, lb] : [lb, la]
  return (hi + 0.05) / (lo + 0.05)
}

/** The colour a reader sees: `fg` at `alpha` over `bg`. */
const blend = (fg, bg, alpha) => {
  if (alpha >= 1) return fg
  const f = parseInt(fg.replace('#', ''), 16)
  const b = parseInt(bg.replace('#', ''), 16)
  const mix = (shift) =>
    Math.round(((f >> shift) & 255) * alpha + ((b >> shift) & 255) * (1 - alpha))
  return `#${[16, 8, 0].map((shift) => mix(shift).toString(16).padStart(2, '0')).join('')}`
}

const palette = JSON.parse(readFileSync('src/lib/palette.json', 'utf8'))
const tokens = new Map(palette.tokens.map((token) => [token.name, token]))
const hexOf = (name) => tokens.get(name)?.hex
const decorative = (name) => tokens.get(name)?.decorative === true

/** The floor a token promised, taken as the weakest pair it declared as ink. */
const floorOf = (name) => {
  const floors = palette.pairs.filter((pair) => pair.fg === name).map((pair) => pair.min)
  return floors.length ? Math.min(...floors) : null
}

let failures = 0
let painted = 0
const worst = { ratio: Infinity }

// One line per distinct finding, with how often it occurs. A chart with 150
// bars and the same wrong pair in all of them is one defect, not 150.
const findings = new Map()
const fail = (message) => {
  failures += 1
  const entry = findings.get(message)
  if (entry) entry.count += 1
  else findings.set(message, { count: 1 })
}

// --- 1. the declared pairs -------------------------------------------------
for (const pair of palette.pairs) {
  const fg = hexOf(pair.fg)
  const bg = hexOf(pair.bg)
  if (!fg || !bg) {
    fail(`${pair.fg} on ${pair.bg} names an unknown token`)
    continue
  }
  const ratio = contrast(fg, bg)
  if (!decorative(pair.fg) && ratio < worst.ratio) {
    worst.ratio = ratio
    worst.label = `${pair.fg} on ${pair.bg}`
  }
  if (ratio < pair.min) {
    fail(`${pair.fg} on ${pair.bg} is ${ratio.toFixed(2)}:1, below its floor of ${pair.min}`)
  }
}

// --- 2. the series ladder --------------------------------------------------
// Two inks that mean different things have to be told apart. The ladder is the
// declared series order, so adding a series cannot skip the measurement.
const series = palette.series ?? []
// Each seed names its own grounds: the child paints on page/surface, the parent
// on ink/surface. The script is shared, the palette is not.
const grounds = (palette.grounds ?? ['page', 'surface']).filter(hexOf)
for (let i = 0; i < series.length; i += 1) {
  for (let j = i + 1; j < series.length; j += 1) {
    const a = hexOf(series[i])
    const b = hexOf(series[j])
    if (!a || !b) {
      fail(`series ${series[i]}, ${series[j]} names an unknown token`)
      continue
    }
    const ratio = contrast(a, b)
    if (ratio < worst.ratio) {
      worst.ratio = ratio
      worst.label = `${series[i]} against ${series[j]}`
    }
    if (ratio < 3) {
      fail(
        `${series[i]} against ${series[j]} is ${ratio.toFixed(2)}:1 — two series cannot mean different things below 3:1`,
      )
    }
  }
  for (const ground of grounds) {
    const bg = hexOf(ground)
    if (!bg) continue
    const ratio = contrast(hexOf(series[i]), bg)
    if (ratio < 3) fail(`${series[i]} on ${ground} is ${ratio.toFixed(2)}:1, a mark needs 3:1 to be seen`)
  }
}

// --- 3. the ink audit, read from what shipped ------------------------------
const TOKEN_CLASS =
  /\btext-(ink-deep|ink|panel-2|panel|line-soft|line|smoke-dim|smoke|pink-ink|pink-deep|pink|night|lilac|mint|butter)(?:\/(\d+))?\b/g

const paints = (attrs) => attrs.some(([, value]) => value === 'currentColor')

const tokenIn = (className) => {
  const found = []
  for (const match of className.matchAll(TOKEN_CLASS)) {
    const [, name, alpha] = match
    if (tokens.has(name)) found.push({ name, alpha: alpha ? Number(alpha) / 100 : 1 })
  }
  return found
}

const parseAttributes = (tag) => {
  const attrs = []
  for (const match of tag.matchAll(/([\w:-]+)="([^"]*)"/g)) attrs.push([match[1], match[2]])
  return attrs
}

const boxOf = (name, attrs) => {
  const get = (key) => Number(attrs.find(([k]) => k === key)?.[1])
  if (name === 'rect') {
    const [x, y, w, h] = [get('x'), get('y'), get('width'), get('height')]
    return [x, y, x + w, y + h].every(Number.isFinite) ? { x0: x, y0: y, x1: x + w, y1: y + h } : null
  }
  if (name === 'circle') {
    const [cx, cy, r] = [get('cx'), get('cy'), get('r')]
    return [cx, cy, r].every(Number.isFinite) ? { x0: cx - r, y0: cy - r, x1: cx + r, y1: cy + r } : null
  }
  if (name === 'ellipse') {
    const [cx, cy, rx, ry] = [get('cx'), get('cy'), get('rx'), get('ry')]
    return [cx, cy, rx, ry].every(Number.isFinite)
      ? { x0: cx - rx, y0: cy - ry, x1: cx + rx, y1: cy + ry }
      : null
  }
  if (name === 'polygon') {
    const points = (attrs.find(([k]) => k === 'points')?.[1] ?? '')
      .trim()
      .split(/\s+/)
      .map((pair) => pair.split(',').map(Number))
      .filter((pair) => pair.length === 2 && pair.every(Number.isFinite))
    if (points.length < 3) return null
    const xs = points.map(([x]) => x)
    const ys = points.map(([, y]) => y)
    return { x0: Math.min(...xs), y0: Math.min(...ys), x1: Math.max(...xs), y1: Math.max(...ys) }
  }
  return null
}

const touches = (a, b, slack = 1) =>
  a.x0 <= b.x1 + slack && b.x0 <= a.x1 + slack && a.y0 <= b.y1 + slack && b.y0 <= a.y1 + slack

/** The ink still in force where an svg starts: the last token class before it. */
const inheritedInk = (page, offset) => {
  const before = page.slice(0, offset)
  const declarations = [...before.matchAll(/class="([^"]*)"/g)]
  for (let i = declarations.length - 1; i >= 0; i -= 1) {
    const inks = tokenIn(declarations[i][1])
    if (inks.length) return inks
  }
  return null
}

/**
 * Walk one svg in document order, carrying the ink each element inherits.
 *
 * The charts let a `<g>` or the figure wrapper set the ink and paint their bars
 * with `fill="currentColor"` and no class at all. Reading only the element's own
 * class would call that undeclared, which is a false alarm; it is declared, one
 * level up, and what matters is which token reaches the element.
 */
const readSvg = (page, svg, offset) => {
  const marks = []
  const texts = []
  const lines = []
  const stack = [inheritedInk(page, offset) ?? []]

  let i = 0
  while (i < svg.length) {
    const lt = svg.indexOf('<', i)
    if (lt === -1) break
    const closing = /^<\/\s*([\w-]+)\s*>/.exec(svg.slice(lt))
    if (closing) {
      if (closing[1] === 'g') stack.pop()
      i = lt + closing[0].length
      continue
    }
    const opening = /^<([a-zA-Z][\w-]*)((?:"[^"]*"|[^>"])*)\/?>/.exec(svg.slice(lt))
    if (!opening) {
      i = lt + 1
      continue
    }
    const [, name, raw] = opening
    i = lt + opening[0].length
    const attrs = parseAttributes(raw)
    const className = attrs.find(([k]) => k === 'class')?.[1] ?? ''
    const own = tokenIn(className)
    const inForce = own.length ? own : stack[stack.length - 1]

    if (name === 'g') {
      stack.push(inForce)
      continue
    }
    if (!['rect', 'circle', 'ellipse', 'polygon', 'path', 'line', 'text'].includes(name)) continue
    if (!paints(attrs)) continue
    if (!inForce.length) {
      fail(`<${name}> paints currentColor with no declared ink in force (class "${className}")`)
      continue
    }

    const elementAlpha = Number(attrs.find(([k]) => k === 'opacity')?.[1] ?? 1)
    for (const ink of inForce) {
      const entry = {
        name,
        token: ink.name,
        alpha: ink.alpha * (Number.isFinite(elementAlpha) ? elementAlpha : 1),
        box: boxOf(name, attrs),
        // The anchor is enough to tell whether the glyphs start on a mark.
        anchor:
          name === 'text'
            ? {
                x: Number(attrs.find(([k]) => k === 'x')?.[1]),
                y: Number(attrs.find(([k]) => k === 'y')?.[1]),
              }
            : null,
      }
      if (name === 'text') texts.push(entry)
      else if (name === 'line' || name === 'path') lines.push(entry)
      else marks.push(entry)
    }
  }

  return { marks, texts, lines }
}

const auditInk = (element, ground, floor) => {
  const hex = hexOf(element.token)
  if (!hex) return
  const shown = blend(hex, ground, element.alpha)
  const ratio = contrast(shown, ground)
  if (ratio < floor) {
    fail(
      `${element.token}${element.alpha < 1 ? ` at ${Math.round(element.alpha * 100)}%` : ''} on ${ground} is ${ratio.toFixed(2)}:1, below its floor of ${floor}`,
    )
  }
}

for (const file of walk('dist')) {
  if (!file.endsWith('.html')) continue
  const page = readFileSync(file, 'utf8')
  const rel = relative('dist', file)

  const marks = []
  const texts = []
  const lines = []
  for (const svg of page.matchAll(/<svg\b[\s\S]*?<\/svg>/g)) {
    if (!/fill="currentColor"|stroke="currentColor"/.test(svg[0])) continue
    const seen = readSvg(page, svg[0], svg.index)
    marks.push(...seen.marks)
    texts.push(...seen.texts)
    lines.push(...seen.lines)
  }
  painted += marks.length + texts.length + lines.length

  // Every painted ink, against the ground it is drawn on.
  for (const element of [...marks, ...texts, ...lines]) {
    if (decorative(element.token)) continue
    const floor =
      element.name === 'text'
        ? Math.max(4.5, floorOf(element.token) ?? 0)
        : Math.max(3, floorOf(element.token) ?? 0)
    if (floor === null) {
      fail(`${element.token} declares no floor — add it to the palette's pairs`)
      continue
    }
    for (const ground of grounds) {
      const hex = hexOf(ground)
      if (hex) auditInk(element, hex, floor)
    }
  }

  // Two marks that touch have to be told apart.
  for (let i = 0; i < marks.length; i += 1) {
    const a = marks[i]
    if (!a.box || decorative(a.token)) continue
    for (let j = i + 1; j < marks.length; j += 1) {
      const b = marks[j]
      if (!b.box || decorative(b.token) || a.token === b.token) continue
      if (!touches(a.box, b.box)) continue
      const ratio = contrast(hexOf(a.token), hexOf(b.token))
      if (ratio < 3) {
        fail(`${rel}: ${a.token} touches ${b.token} in <${a.name}> at ${ratio.toFixed(2)}:1, below 3:1`)
      }
    }
  }

  // A label on top of a mark has to read against it.
  for (const text of texts) {
    if (decorative(text.token) || !text.anchor || !Number.isFinite(text.anchor.x)) continue
    for (const mark of marks) {
      if (!mark.box || decorative(mark.token)) continue
      const { x, y } = text.anchor
      const inside = x >= mark.box.x0 && x <= mark.box.x1 && y >= mark.box.y0 && y <= mark.box.y1
      if (!inside) continue
      const ratio = contrast(hexOf(text.token), hexOf(mark.token))
      if (ratio < 4.5) {
        fail(
          `${rel}: ${text.token} anchored inside a ${mark.token} ${mark.name} is ${ratio.toFixed(2)}:1, below 4.5`,
        )
      }
    }
  }

  // Text in the markup, not in an svg: the same rule applies to a paragraph,
  // and this is where the site's labels actually live.
  for (const declaration of page.matchAll(/class="([^"]*)"/g)) {
    for (const ink of tokenIn(declaration[1])) {
      if (ink.alpha >= 1 || decorative(ink.name)) continue
      painted += 1
      const groundsFor = palette.pairs
        .filter((pair) => pair.fg === ink.name)
        .map((pair) => pair.bg)
      const candidates = [...new Set([...groundsFor, 'page', 'surface'])]
        .map((ground) => hexOf(ground))
        .filter(Boolean)
      const best = Math.max(...candidates.map((ground) => contrast(blend(hexOf(ink.name), ground, ink.alpha), ground)))
      const floor = Math.max(4.5, floorOf(ink.name) ?? 0)
      if (best < floor) {
        fail(
          `${rel}: text-${ink.name}/${Math.round(ink.alpha * 100)} is ${best.toFixed(2)}:1 on its best declared ground, below ${floor}`,
        )
      }
    }
  }
}

if (failures) {
  const sorted = [...findings.entries()].sort((a, b) => b[1].count - a[1].count)
  for (const [message, { count }] of sorted.slice(0, 24)) {
    console.error(`contrast: ${message}${count > 1 ? ` (×${count})` : ''}`)
  }
  if (sorted.length > 24) console.error(`contrast: …and ${sorted.length - 24} more distinct finding(s)`)
  console.error(`\ncontrast: ${failures} finding(s) in ${sorted.length} distinct case(s) — the palette is a measurement, not an opinion`)
  process.exit(1)
}

console.log(
  `contrast: ${palette.pairs.length} declared pairs, ${series.length} series ink(s) and ${painted} painted element(s) pass` +
    (Number.isFinite(worst.ratio) ? ` · tightest ${worst.ratio.toFixed(2)}:1 (${worst.label})` : ''),
)

function* walk(dir) {
  if (!existsSync(dir)) return
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry)
    const stat = statSync(path)
    if (stat.isDirectory()) yield* walk(path)
    else yield path
  }
}
