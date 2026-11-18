#!/usr/bin/env node
/**
 * Post-build steps that GitHub Pages needs and Vite does not know about.
 *
 * 1. dist/404.html — the SPA fallback.
 * 2. dist/<route>/index.html — one shell per real route, so a tree is a 200
 *    rather than a missing page that happens to render.
 * 3. dist/.nojekyll — stops Pages running Jekyll over the output.
 * 4. robots.txt, sitemap.xml, .well-known/ai-catalog.json — the find half.
 * 5. llms.txt — the machine entry, generated from the content tree and the
 *    tree routes so an agent gets every address without crawling.
 */
import { execFileSync } from 'node:child_process'
import { writeFile, mkdir, readdir, readFile, access, rm } from 'node:fs/promises'
import { join, relative } from 'node:path'

const SITE = 'https://james-gibson.github.io/le.seo'
const BASE = '/le.seo/'
const built = new Date().toISOString().slice(0, 10)
const commit = (() => {
  try {
    return execFileSync('git', ['rev-parse', '--short', 'HEAD'], { encoding: 'utf8' }).trim()
  } catch {
    return built
  }
})()
const DIST = 'dist'
const CONTENT = 'src/content'
const index = join(DIST, 'index.html')

try {
  await access(index)
} catch {
  console.error('postbuild: dist/index.html is missing — run vite build first')
  process.exit(1)
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

// Voices and goals are read from the module that owns them, so a fifth voice
// cannot ship without its shells.
const treeSource = await readFile('src/lib/tree.ts', 'utf8')
const block = (from, to) => treeSource.slice(treeSource.indexOf(from), treeSource.indexOf(to))
const ids = (text) => [...text.matchAll(/id: '([a-z]+)'/g)].map((m) => m[1])
const voices = ids(block('export const VOICES', 'export type Voice'))
const goals = ids(block('export const GOALS', 'export type Goal'))
if (voices.length < 2 || goals.length < 2) {
  console.error('postbuild: could not read the voices and goals from src/lib/tree.ts')
  process.exit(1)
}

const sectionDirs = (await readdir(CONTENT, { withFileTypes: true }))
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)

const routes = [
  ...sectionDirs,
  ...(await walk(CONTENT))
    .filter((f) => f.endsWith('.md'))
    .map((f) => relative(CONTENT, f).replace(/\.md$/, '')),
  ...voices.flatMap((voice) => goals.map((goal) => `v/${voice}/${goal}`)),
]

// --- prerendered shells ---------------------------------------------------
const template = await readFile(index, 'utf8')
const PRERENDER = join(DIST, '.prerender')
const markup = new Map()
try {
  for (const file of await readdir(PRERENDER)) {
    markup.set(file.replace(/\.html$/, ''), await readFile(join(PRERENDER, file), 'utf8'))
  }
} catch {
  console.warn('postbuild: no prerendered markup — shells will be empty')
}

const shellFor = (key) => {
  const content = markup.get(key)
  return content ? template.replace('<div id="root"></div>', `<div id="root">${content}</div>`) : template
}

const pageTitles = new Map()
const pageMeta = new Map()
for (const file of await walk(CONTENT)) {
  if (!file.endsWith('.md')) continue
  const source = await readFile(file, 'utf8')
  const route = relative(CONTENT, file).replace(/\.md$/, '')
  const title = /^title:\s*(.+)$/m.exec(source)?.[1]?.trim().replace(/^["']|["']$/g, '')
  const description = /^description:\s*(.+)$/m.exec(source)?.[1]?.trim().replace(/^["']|["']$/g, '')
  if (title) pageTitles.set(route, title)
  if (description) pageMeta.set(route, description)
}

const SECTION_LABELS = { tree: 'Tree', isotope: 'Isotope', docs: 'Docs' }

const titleFor = (route) => {
  if (!route) return null
  if (pageTitles.has(route)) return `${pageTitles.get(route)} · le.seo`
  if (route === '404') return 'Not found · le.seo'
  // A tree's title is its two values: a link to reader/try should say so.
  const treeMatch = /^v\/(\w+)\/(\w+)$/.exec(route)
  if (treeMatch) return `${treeMatch[1]} / ${treeMatch[2]} · le.seo`
  const section = route.split('/')[0]
  if (!route.includes('/') && section) return `${SECTION_LABELS[section] ?? section} · le.seo`
  return null
}

const withTitle = (html, route) => {
  const title = titleFor(route)
  if (!title) return html
  return html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${title}</title>`)
}

for (const route of routes) {
  const dir = join(DIST, route)
  await mkdir(dir, { recursive: true })
  await writeFile(join(dir, 'index.html'), withTitle(shellFor(route.replace(/\//g, '__')), route), 'utf8')
}

await writeFile(join(DIST, 'index.html'), shellFor('home'), 'utf8')
await writeFile(join(DIST, '404.html'), withTitle(shellFor('404'), '404'), 'utf8')
await writeFile(join(DIST, '.nojekyll'), '')

// --- sitemap, crawl policy, catalog ---------------------------------------
const sitemapUrls = ['', ...routes.map((route) => `${route}/`)]
const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...sitemapUrls.map((route) => `  <url><loc>${route ? `${SITE}/${route}/` : `${SITE}/`}</loc></url>`),
  '</urlset>',
  '',
].join('\n')
await writeFile(join(DIST, 'sitemap.xml'), sitemap, 'utf8')

await writeFile(
  join(DIST, 'robots.txt'),
  ['User-agent: *', 'Allow: /', '', `Sitemap: ${SITE}/sitemap.xml`, ''].join('\n'),
  'utf8',
)

const catalog = {
  name: 'le.seo',
  url: `${SITE}/`,
  description:
    'Marketing optimisation for a collection of seeds: a link tree with one voice and one goal, and the giardiniera isotope.',
  entries: [
    { type: 'text/plain', url: `${SITE}/llms.txt`, name: 'llms.txt' },
    { type: 'application/xml', url: `${SITE}/sitemap.xml`, name: 'sitemap.xml' },
    { type: 'text/html', url: `${SITE}/`, name: 'the tree' },
    { type: 'text/html', url: `${SITE}/isotope/giardiniera/`, name: 'the isotope' },
  ],
}
await mkdir(join(DIST, '.well-known'), { recursive: true })
await writeFile(join(DIST, '.well-known', 'ai-catalog.json'), `${JSON.stringify(catalog, null, 2)}\n`, 'utf8')

// --- llms.txt -------------------------------------------------------------
const pages = []
for (const [route, title] of pageTitles) {
  const [section] = route.split('/')
  const order = Number(/^order:\s*(\d+)/m.exec(await readFile(join(CONTENT, `${route}.md`), 'utf8'))?.[1] ?? 999)
  pages.push({ route, section, title, description: pageMeta.get(route) ?? '', order })
}
pages.sort(
  (a, b) =>
    Object.keys(SECTION_LABELS).indexOf(a.section) - Object.keys(SECTION_LABELS).indexOf(b.section) ||
    a.order - b.order,
)

const lines = [
  '# le.seo',
  '',
  '> Marketing optimisation for a collection of seeds. A tree is a short, ordered set',
  '> of destinations chosen for one voice and one goal; the address is the tree.',
  '',
  `Live: ${SITE}/`,
  'Repo: https://github.com/james-gibson/le.seo',
  'Stack: React 19, Vite, hand-written CSS tokens, no CSS framework, no runtime services.',
  'Source of truth: src/lib/tree.ts for the register and the rules; src/content/ for pages.',
  '',
  '## Trees',
  '',
  ...voices.flatMap((voice) => goals.map((goal) => `- ${SITE}/v/${voice}/${goal}/`)),
  '',
  '## Publish',
  '',
  'Push to main. The deploy workflow runs `npm ci && npm run build` and publishes the',
  'result; a local build is optional and runs the same command. The routes are paths,',
  'not an order — take the one that fits the reader you have.',
  '',
  '## Build and verify',
  '',
  '    npm ci',
  '    npm run build      # types, tokens, vite, prerender, shells, contrast, a11y, overflow, tree check, guard',
  '    npm run smoke      # renders every route server-side',
  '    npm run check:tree # the tree rules, executed',
  '    npm run isotope    # re-derives the isotope id from features/giardiniera.feature',
  '',
  '## Invariants',
  '',
  '- A tree has one voice and one goal, and never comes back empty: it falls back to the',
  '  voice, then to the whole register, and says which basis it used.',
  '- The order is readiness, then name. The least demanding front door comes first.',
  '- Every tree is a URL and every one is a shell: /v/<voice>/<goal> is a 200, not a query.',
  '- A link is a destination in the register; a tree chooses among them and invents none.',
  '- The same record pitches projects and tools, not only seeds.',
  '- This file is generated at build time; editing it in dist/ changes nothing.',
  '',
  '## For agents',
  '',
  `- Open one tree: ${SITE}/v/reader/try/`,
  `- Voices and goals: ${SITE}/tree/voices-and-goals/`,
  `- The isotope: ${SITE}/isotope/giardiniera/`,
  '',
]

for (const section of Object.keys(SECTION_LABELS)) {
  const list = pages.filter((page) => page.section === section)
  if (!list.length) continue
  lines.push(`## ${SECTION_LABELS[section]}`, '')
  for (const page of list) lines.push(`- [${page.title}](${SITE}/${page.route}/): ${page.description}`)
  lines.push('')
}

await writeFile(join(DIST, 'llms.txt'), lines.join('\n'), 'utf8')
await rm(PRERENDER, { recursive: true, force: true })

console.log(
  `postbuild: ${routes.length} shells, 404.html, sitemap.xml, robots.txt, ai-catalog.json, ` +
    `llms.txt (${pages.length} pages, ${voices.length}×${goals.length} trees, ${commit})`,
)
