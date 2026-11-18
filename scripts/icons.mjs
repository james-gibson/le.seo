#!/usr/bin/env node
/**
 * The icons, drawn rather than exported.
 *
 * This file was le.ad's, copied whole — its desk, its gold, and an SVG that
 * still announced itself as `le.ad`. A seed that inherits another seed's mark
 * has no mark, so the drawing below is le.seo's own: a trunk with two branches,
 * three eggs at the ends, in the site's own four violets and pastels.
 *
 * Everything is computed from the size asked for, so the 180, the 192 and the
 * 512 are the same drawing rather than three exports that might disagree. The
 * SVG the tab uses is generated here too, so the tab and the launcher cannot
 * show different marks.
 *
 *   node scripts/icons.mjs
 *
 * No dependencies: the PNG encoder is chunk assembly over zlib.
 */
import { deflateSync } from 'node:zlib'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

// Read from the site's own palette so an icon cannot outlive a retheme.
import { readFileSync } from 'node:fs'
const palette = JSON.parse(readFileSync('src/lib/palette.json', 'utf8'))
const hex = (name) => {
  const token = palette.tokens.find((entry) => entry.name === name)
  if (!token) {
    console.error(`icons: src/lib/palette.json has no "${name}"`)
    process.exit(1)
  }
  return token.hex.toLowerCase()
}
const rgb = (name) => {
  const value = hex(name).slice(1)
  return [0, 2, 4].map((at) => parseInt(value.slice(at, at + 2), 16))
}

const WALL = rgb('ink')
const LILAC = rgb('lilac')
const LINE = rgb('line')
const PINK = rgb('pink')
const BUTTER = rgb('butter')
const MINT = rgb('mint')

const CRC_TABLE = (() => {
  const table = new Int32Array(256)
  for (let n = 0; n < 256; n += 1) {
    let c = n
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    table[n] = c
  }
  return table
})()

function crc32(buffer) {
  let c = 0xffffffff
  for (const byte of buffer) c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const length = Buffer.alloc(4)
  length.writeUInt32BE(data.length, 0)
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(body), 0)
  return Buffer.concat([length, body, crc])
}

function png(width, height, pixels) {
  const header = Buffer.alloc(13)
  header.writeUInt32BE(width, 0)
  header.writeUInt32BE(height, 4)
  header[8] = 8 // bit depth
  header[9] = 6 // colour type: RGBA
  header[10] = 0
  header[11] = 0
  header[12] = 0

  const stride = width * 4
  const raw = Buffer.alloc((stride + 1) * height)
  for (let y = 0; y < height; y += 1) {
    raw[y * (stride + 1)] = 0 // filter: none
    pixels.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride)
  }

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', header),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

function canvas(size, colour) {
  const pixels = Buffer.alloc(size * size * 4)
  for (let i = 0; i < size * size; i += 1) {
    pixels[i * 4] = colour[0]
    pixels[i * 4 + 1] = colour[1]
    pixels[i * 4 + 2] = colour[2]
    pixels[i * 4 + 3] = 255
  }
  return pixels
}

function put(pixels, size, x, y, colour, alpha = 1) {
  if (x < 0 || y < 0 || x >= size || y >= size) return
  const at = (y * size + x) * 4
  for (let c = 0; c < 3; c += 1) {
    pixels[at + c] = Math.round(pixels[at + c] * (1 - alpha) + colour[c] * alpha)
  }
  pixels[at + 3] = 255
}

function rect(pixels, size, x, y, w, h, colour, alpha = 1) {
  for (let dy = 0; dy < h; dy += 1) {
    for (let dx = 0; dx < w; dx += 1) put(pixels, size, x + dx, y + dy, colour, alpha)
  }
}

/** A filled circle with one pixel of feathering, so an egg is not a square. */
function circle(pixels, size, cx, cy, r, colour, alpha = 1) {
  for (let y = Math.floor(cy - r - 1); y <= Math.ceil(cy + r + 1); y += 1) {
    for (let x = Math.floor(cx - r - 1); x <= Math.ceil(cx + r + 1); x += 1) {
      const distance = Math.hypot(x + 0.5 - cx, y + 0.5 - cy)
      if (distance <= r - 1) put(pixels, size, x, y, colour, alpha)
      else if (distance <= r) put(pixels, size, x, y, colour, alpha * 0.55)
    }
  }
}

/**
 * The mark: a tree, not a desk. One trunk, two branches, three eggs — a seed is
 * a tree, and the eggs are the assortment it was grown from. The dark pink is
 * the trunk's head, the same rule the page follows where the accent marks the
 * live choice and nothing else.
 */
function mark(size, { inset = 0.16, background = WALL } = {}) {
  const pixels = canvas(size, background)
  const s = size
  const unit = Math.round(s * (1 - inset * 2))
  const left = Math.round(s * inset)
  const stroke = Math.max(2, Math.round(s * 0.038))

  // the ground the tree stands on
  const groundY = Math.round(s * 0.80)
  rect(pixels, s, left, groundY, unit, Math.max(2, Math.round(s * 0.022)), LINE, 0.85)

  // trunk, rising from the ground to the crown
  const trunkX = Math.round(s * 0.5 - stroke / 2)
  const trunkTop = Math.round(s * 0.40)
  rect(pixels, s, trunkX, trunkTop, stroke, groundY - trunkTop, LILAC)

  // two branches, each carrying an egg
  const branchY = Math.round(s * 0.58)
  rect(pixels, s, left + Math.round(unit * 0.12), branchY, Math.round(unit * 0.38), stroke, LILAC)
  const upperY = Math.round(s * 0.48)
  rect(
    pixels,
    s,
    trunkX + stroke,
    upperY,
    Math.round(unit * 0.38),
    stroke,
    LILAC,
  )

  circle(pixels, s, left + unit * 0.16, branchY - s * 0.055, s * 0.062, PINK)
  circle(pixels, s, left + unit * 0.86, upperY - s * 0.055, s * 0.055, BUTTER)
  circle(pixels, s, trunkX + stroke / 2, trunkTop - s * 0.055, s * 0.05, MINT)

  return png(s, s, pixels)
}

mkdirSync('public/icons', { recursive: true })

const files = [
  ['public/icons/icon-192.png', mark(192)],
  ['public/icons/icon-512.png', mark(512)],
  // Maskable: the crown pulls in to the safe circle so a launcher can crop it
  // to a squircle, a circle or a rounded square without cutting an egg off.
  ['public/icons/maskable-512.png', mark(512, { inset: 0.24 })],
  ['public/icons/apple-touch-icon.png', mark(180)],
]

for (const [path, buffer] of files) {
  writeFileSync(path, buffer)
  console.log(`icons: ${path} — ${(buffer.length / 1024).toFixed(1)}KB`)
}

// The tab's SVG, from the same geometry and the same tokens.
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-label="le.seo">
  <rect width="64" height="64" fill="${hex('ink')}"/>
  <rect x="10" y="51" width="44" height="1.6" fill="${hex('line')}" opacity=".85"/>
  <rect x="31" y="25" width="2.4" height="26" fill="${hex('lilac')}"/>
  <rect x="16" y="36" width="16" height="2.4" fill="${hex('lilac')}"/>
  <rect x="33" y="30" width="14" height="2.4" fill="${hex('lilac')}"/>
  <circle cx="17" cy="32.5" r="4" fill="${hex('pink')}"/>
  <circle cx="47" cy="26.5" r="3.5" fill="${hex('butter')}"/>
  <circle cx="32.2" cy="21.5" r="3.2" fill="${hex('mint')}"/>
</svg>
`
writeFileSync(join('public', 'favicon.svg'), svg)
console.log('icons: public/favicon.svg')
