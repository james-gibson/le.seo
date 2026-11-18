#!/usr/bin/env node
/**
 * The publish guard for le.seo.
 *
 * Inherited in shape from le.gume, with the checks this seed actually has a
 * subject for. Two are specific to a link tree:
 *
 *   - every tree route has a shell, because a tree is an address and an address
 *     that 404s is a broken pitch;
 *   - every destination in the register is https, because the pitch is the one
 *     thing on this site a reader acts on.
 *
 * And one is specific to the isotope: the page prints an id, and the feature
 * file derives it. A protocol page that drifts from its specification is a
 * rumour.
 */
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { access, readFile, readdir, stat } from 'node:fs/promises'
import { join, relative } from 'node:path'

const DIST = 'dist'
const failures = []
const notes = []

function fail(check, detail) {
  failures.push({ check, detail })
}

async function readText(path) {
  return readFile(path, 'utf8')
}

async function walk(dir) {
  const out = []
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) out.push(...(await walk(full)))
    else out.push(full)
  }
  return out
}

// --- 1. the output exists and is the shape Pages expects -------------------
let files
try {
  files = await walk(DIST)
} catch {
  console.error('guard: dist/ is missing — run `npm run build` first')
  process.exit(1)
}

const rel = files.map((file) => relative(DIST, file))
for (const required of ['index.html', '404.html', '.nojekyll', 'robots.txt', 'sitemap.xml', 'llms.txt']) {
  if (!rel.includes(required)) fail('required-file', `${required} is missing from dist/`)
}

const indexHtml = await readText(join(DIST, 'index.html')).catch(() => '')
const notFoundHtml = await readText(join(DIST, '404.html')).catch(() => '')

const appScript = /<script[^>]+src="[^"]*assets\/index-[^"]+\.js"/.exec(indexHtml)?.[0]
if (!appScript) fail('spa-fallback', 'dist/index.html does not load the application bundle')
else if (notFoundHtml && !notFoundHtml.includes(appScript)) {
  fail('spa-fallback', 'dist/404.html does not load the application bundle')
}

// --- 2. the base path agrees with the deployed location -------------------
const pkg = JSON.parse(await readText('package.json'))
const expectedBase = pkg.homepage ? new URL(pkg.homepage).pathname : '/'
if (!indexHtml.includes(`${expectedBase}assets/`)) {
  fail('base-path', `index.html does not load assets from ${expectedBase}assets/`)
}
const mount = expectedBase.replace(/\/$/, '')
for (const match of indexHtml.matchAll(/(?:src|href)="(\/[^"]*)"/g)) {
  const ref = match[1]
  if (ref !== mount && !ref.startsWith(expectedBase)) {
    fail('base-path', `index.html references ${ref}, which escapes the mount ${expectedBase}`)
  }
}

// --- 3. nothing shipped points back at source or at a map -----------------
for (const file of rel) if (file.endsWith('.map')) fail('sourcemap', `${file} is a source map`)
const jsText = (await Promise.all(files.filter((f) => f.endsWith('.js')).map((f) => readText(f)))).join('\n')
if (/\/src\/[A-Za-z0-9_-]+\.(?:tsx?|css)/.test(indexHtml) || /from\s*"\/src\//.test(jsText)) {
  fail('dev-paths', 'output refers to /src/')
}

// --- 4. placeholders and leaks -------------------------------------------
const placeholder = /\b(?:TODO|FIXME|lorem ipsum)\b|example\.com/i
for (const [name, html] of [['index.html', indexHtml], ['404.html', notFoundHtml]]) {
  if (placeholder.test(html)) fail('placeholder', `${name} still contains a placeholder`)
}
const leaks = [
  [/\/Users\/[A-Za-z0-9._-]+/, 'an absolute macOS home path'],
  [/-----BEGIN [A-Z ]*PRIVATE KEY-----/, 'a private key'],
  [/\b(?:password|passwd|secret|token)\s*[:=]\s*["'][^"']{8,}["']/i, 'a hardcoded credential'],
  [/localhost:\d+/, 'a localhost URL'],
]
for (const [pattern, what] of leaks) {
  const hit = jsText.match(pattern) ?? indexHtml.match(pattern)
  if (hit) fail('leak', `output contains ${what}: ${hit[0].slice(0, 60)}`)
}

// --- 5. every route has a shell, and every page reached the bundle -------
const contentFiles = (await walk('src/content')).filter((file) => file.endsWith('.md'))
if (!contentFiles.length) fail('content', 'src/content/**/*.md matched nothing')

const treeSource = await readText('src/lib/tree.ts')
const treeBlock = (from, to) => treeSource.slice(treeSource.indexOf(from), treeSource.indexOf(to))
const ids = (text) => [...text.matchAll(/id: '([a-z]+)'/g)].map((m) => m[1])
const voices = ids(treeBlock('export const VOICES', 'export type Voice'))
const goals = ids(treeBlock('export const GOALS', 'export type Goal'))
const sections = [...new Set(contentFiles.map((file) => relative('src/content', file).split('/')[0]))]

const routes = [
  ...sections,
  ...contentFiles.map((file) => relative('src/content', file).replace(/\.md$/, '')),
  ...voices.flatMap((voice) => goals.map((goal) => `v/${voice}/${goal}`)),
]

for (const route of routes) {
  try {
    await access(join(DIST, route, 'index.html'))
  } catch {
    fail('route-shell', `dist/${route}/index.html is missing — Pages would answer 404 for /${route}`)
  }
}

for (const file of contentFiles) {
  const source = await readText(file)
  const title = /^title:\s*(.+)$/m.exec(source)?.[1]?.trim().replace(/^["']|["']$/g, '')
  if (!title) {
    fail('content', `${file} has no title: in frontmatter`)
    continue
  }
  if (!jsText.includes(title)) fail('content', `${file} ("${title}") is not present in the built bundle`)
  if (!/^description:\s*\S/m.test(source)) fail('content', `${file} has no description:`)
}

// --- 6. internal links resolve -------------------------------------------
const contentSource = contentFiles.map((file) => ({ file, text: readFileSync(file, 'utf8') }))
const knownRoutes = new Set([
  '/',
  ...sections.map((section) => `/${section}`),
  ...contentFiles.map((file) => `/${relative('src/content', file).replace(/\.md$/, '')}`),
  ...voices.flatMap((voice) => goals.map((goal) => `/v/${voice}/${goal}`)),
])
const knownFiles = new Set(['/llms.txt', '/robots.txt', '/sitemap.xml', '/favicon.svg'])
for (const { file, text } of contentSource) {
  for (const match of text.matchAll(/\]\((\/[^)\s]*)\)/g)) {
    const target = match[1].replace(/#.*$/, '').replace(/\/$/, '') || '/'
    if (!knownRoutes.has(target) && !knownFiles.has(target)) {
      fail('link', `${file} links to ${match[1]}, which is not a route on this site`)
    }
  }
}

// --- 7. the machine entry lists every page -------------------------------
const llms = rel.includes('llms.txt') ? await readText(join(DIST, 'llms.txt')) : ''
if (!llms) fail('llms', 'dist/llms.txt is empty or missing')
else {
  for (const file of contentFiles) {
    const route = relative('src/content', file).replace(/\.md$/, '')
    if (!llms.includes(`/${route}/)`)) fail('llms', `dist/llms.txt does not list /${route}`)
  }
  for (const anchor of ['## Publish', '## Invariants', '## For agents']) {
    if (!llms.includes(anchor)) fail('llms', `dist/llms.txt is missing the "${anchor}" section`)
  }
  for (const voice of voices) {
    for (const goal of goals) {
      if (!llms.includes(`/v/${voice}/${goal}/`)) fail('llms', `dist/llms.txt does not list the ${voice}/${goal} tree`)
    }
  }
}

// --- 8. every destination is https and unique ----------------------------
// The register is the one thing a reader acts on, so a typo in a URL is a dead
// pitch shipped to everyone.
const linkUrls = [...treeSource.matchAll(/^\s{4}url: '([^']+)'/gm)].map((m) => m[1])
const linkIds = [...treeSource.matchAll(/^\s{4}id: '([a-z0-9-]+)',/gm)].map((m) => m[1])
if (linkUrls.length < 6) fail('links', `the register has ${linkUrls.length} destinations — that is not a collection`)
for (const url of linkUrls) {
  if (!url.startsWith('https://')) fail('links', `${url} is not https`)
}
if (new Set(linkIds).size !== linkIds.length) fail('links', 'the register repeats an id')

// --- 9. the isotope page and the feature file agree ---------------------
const isotopePage = await readText('src/content/isotope/giardiniera.md').catch(() => '')
const isotopeId = /^isotope\s+(\S+)$/m.exec(isotopePage)?.[1]
if (!isotopeId) fail('isotope', 'the isotope page does not print an isotope id')
else {
  try {
    const report = execFileSync('python3', ['scripts/validate-spec.py', 'features/giardiniera.feature'], {
      encoding: 'utf8',
    })
    const derived = /isotope\s+(\S+)/.exec(report)?.[1]
    if (!derived) fail('isotope', 'the canon reported no isotope id')
    else if (derived !== isotopeId) {
      fail('isotope', `the page prints ${isotopeId} but the feature derives ${derived}`)
    } else notes.push(`isotope ${derived.slice(0, 12)}…`)
  } catch (error) {
    if (error.status === 2) notes.push('isotope id NOT re-derived here (the canon is not installed)')
    else fail('isotope', `the canon could not read the feature: ${error.message.slice(0, 120)}`)
  }
}

// --- 10. size sanity -----------------------------------------------------
const total = (await Promise.all(files.map(async (file) => (await stat(file)).size))).reduce((a, b) => a + b, 0)
if (total > 8 * 1024 * 1024) fail('size', `dist/ is ${(total / 1024 / 1024).toFixed(1)}MB`)
notes.push(`${rel.length} files, ${(total / 1024).toFixed(0)}KB total`)

if (failures.length) {
  console.error('guard: refused to publish\n')
  for (const { check, detail } of failures) console.error(`  [${check}] ${detail}`)
  console.error('\nNothing was published. Fix the checks above and rebuild.')
  process.exit(1)
}

console.log(`guard: clean — ${notes.join(', ')}`)
