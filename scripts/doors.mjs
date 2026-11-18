#!/usr/bin/env node
/**
 * The doors check.
 *
 * A pitch names destinations; a destination is a door that opens. Until now the
 * guard could only prove a door was https — it could not knock. Then le.stalk
 * shipped with root-absolute links: every page answered 200 at its own address
 * while every link between them left the mount and 404ed. le.seo was pitching
 * that site and would have called it ready.
 *
 * So: for every destination in the register, fetch the front door, collect the
 * links it offers, and refuse when
 *
 *   - the door does not answer 200, or
 *   - a link leaves the destination's own mount, or
 *   - a link answers 4xx/5xx.
 *
 * The mount rule is the one that matters: `https://example.org/collections/`
 * may exist and be somebody else's page. A link that leaves the mount is wrong
 * even when it resolves, because it is not the destination's page any more.
 *
 * An origin that is down is a warning, not a failure: le.seo must not stop
 * deploying because somebody else's site is restarting. A door that answers and
 * then lies is a failure, because that is the pitch.
 *
 *   node scripts/doors.mjs            check every destination
 *   node scripts/doors.mjs --strict   also fail when an origin is unreachable
 */
import { readFile } from 'node:fs/promises'

const strict = process.argv.includes('--strict')
const source = await readFile('src/lib/tree.ts', 'utf8')
const register = source.slice(source.indexOf('export const LINKS'), source.indexOf('export const DEFAULT_VOICE'))

const destinations = [...register.matchAll(/\n  \{\n([\s\S]*?)\n  \},/g)].map((match) => ({
  id: /id: '([^']+)'/.exec(match[1])?.[1],
  url: /url: '([^']+)'/.exec(match[1])?.[1],
})).filter((entry) => entry.id && entry.url)

if (destinations.length < 6) {
  console.error(`doors: the register names ${destinations.length} destinations — that is not a collection`)
  process.exit(1)
}

const TIMEOUT = 15000
const MAX_LINKS = 40

const mountOf = (url) => {
  const { pathname } = new URL(url)
  if (pathname === '/') return '/'
  return `${pathname.replace(/\/$/, '')}/`
}

const fetchText = async (url) => {
  const response = await fetch(url, {
    redirect: 'follow',
    signal: AbortSignal.timeout(TIMEOUT),
    headers: { 'user-agent': 'le.seo doors check' },
  })
  return { status: response.status, ok: response.ok, body: response.ok ? await response.text() : '' }
}

/** The links a page offers, resolved, with the raw href for the report. */
const linksOn = (html, base) => {
  const seen = new Map()
  for (const match of html.matchAll(/<a\b[^>]*\bhref="([^"]+)"/gi)) {
    const raw = match[1].replaceAll('&amp;', '&')
    if (!raw || raw.startsWith('#') || raw.startsWith('mailto:') || raw.startsWith('tel:')) continue
    let resolved
    try {
      resolved = new URL(raw, base)
    } catch {
      continue
    }
    resolved.hash = ''
    seen.set(resolved.toString(), raw)
  }
  return [...seen.entries()].slice(0, MAX_LINKS)
}

const FAMILY_HOST = 'james-gibson.github.io'

// Every mount in the register, so a link to a sibling seed is not mistaken for
// a link that has wandered off the site.
const mounts = new Map(
  destinations
    .filter((entry) => new URL(entry.url).hostname === FAMILY_HOST)
    .map((entry) => [mountOf(entry.url), entry.id]),
)

let failures = 0
let checked = 0
let unreachable = 0

for (const destination of destinations) {
  const url = new URL(destination.url)
  const mount = mountOf(destination.url)
  let front
  try {
    front = await fetchText(destination.url)
  } catch (error) {
    unreachable += 1
    const message = `doors: ${destination.id} unreachable — ${error.message}`
    if (strict) {
      failures += 1
      console.error(`${message} (strict)`)
    } else console.warn(`${message} (warning)`)
    continue
  }

  if (front.status === 401 || front.status === 403) {
    console.warn(`doors: ${destination.id} front door answers ${front.status} (guarded; cannot audit its links) — ${destination.url}`)
    continue
  }
  if (!front.ok) {
    failures += 1
    console.error(`doors: ${destination.id} front door answers ${front.status} — ${destination.url}`)
    continue
  }

  // A platform page (github.com, a vendor docs site) has no mount of its own;
  // its chrome is not our site and its links are not our claim. The front door
  // is all we can honestly check there.
  if (url.hostname !== FAMILY_HOST) {
    console.log(`doors: ${destination.id} — front door 200 (platform page; links are not ours to audit)`)
    continue
  }

  const problems = []
  const guarded = []
  const links = linksOn(front.body, destination.url)
  for (const [target, raw] of links) {
    const link = new URL(target)
    if (link.hostname !== FAMILY_HOST) continue
    const path = link.pathname
    // A root-absolute or relative href is resolved against the origin, so it
    // silently assumes the site is mounted at /. That is the defect class this
    // check exists for. An explicit absolute URL is a deliberate link and may
    // point at a sibling seed.
    const implicit = raw.startsWith('/') || !/^[a-z][a-z0-9+.-]*:/i.test(raw)
    const localPath = path.replace(/\/$/, '')
    const localMount = mount.replace(/\/$/, '')
    const sibling = [...mounts.keys()].some((candidate) => {
      const other = candidate.replace(/\/$/, '')
      return other !== localMount && localPath === other
    })
    if (implicit && localPath !== localMount && !localPath.startsWith(`${localMount}/`) && !sibling) {
      problems.push(`${raw} is written from the origin, not the mount ${mount}`)
      continue
    }
    try {
      const res = await fetchText(target)
      checked += 1
      if (res.status === 401 || res.status === 403) guarded.push(`${raw} answers ${res.status} (guarded)`)
      else if (!res.ok) problems.push(`${raw} answers ${res.status}`)
    } catch (error) {
      checked += 1
      problems.push(`${raw} did not answer — ${error.message}`)
    }
  }

  if (problems.length) {
    failures += problems.length
    console.error(`doors: ${destination.id} — ${destination.url}`)
    for (const problem of problems) console.error(`  ${problem}`)
  } else {
    console.log(
      `doors: ${destination.id} — ${links.length} link(s) on the front door, all inside ${mount} or a sibling seed` +
        (guarded.length ? `, ${guarded.length} guarded` : ''),
    )
  }
}

if (failures) {
  console.error(
    `\ndoors: ${failures} broken door(s) across ${destinations.length} destinations — a pitch cannot point at a page that does not open`,
  )
  process.exit(1)
}
console.log(
  `\ndoors: ${destinations.length} destinations, ${checked} link(s) checked, 0 leaving the family` +
    (unreachable ? `, ${unreachable} origin(s) unreachable (warned)` : ''),
)
