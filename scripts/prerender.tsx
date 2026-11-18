/**
 * Prerender every route to static HTML.
 *
 * A tree is a URL, so every voice/goal pair gets its own shell with its list in
 * the initial HTML. A pitch page that needs JavaScript to say anything is a
 * pitch page an agent cannot read.
 */
import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom'
import { App } from '../src/App'
import { PAGES, SECTIONS } from '../src/lib/content'
import { GOALS, VOICES, treePath } from '../src/lib/tree'

const BASE = '/le.seo'
const OUT = 'dist/.prerender'

const routes = [
  { file: 'home', path: '/' },
  ...SECTIONS.map((section) => ({ file: section.id, path: `/${section.id}` })),
  ...PAGES.map((page) => ({
    file: `${page.section}/${page.slug}`.replace(/\//g, '__'),
    path: `/${page.section}/${page.slug}`,
  })),
  ...VOICES.flatMap((voice) =>
    GOALS.map((goal) => ({
      file: `v__${voice.id}__${goal.id}`,
      path: treePath(voice.id, goal.id),
    })),
  ),
  { file: '404', path: '/this-route-does-not-exist' },
]

await mkdir(OUT, { recursive: true })

let failures = 0
for (const route of routes) {
  try {
    const html = renderToString(
      <StaticRouter basename={BASE} location={`${BASE}${route.path}`}>
        <App />
      </StaticRouter>,
    )
    await writeFile(join(OUT, `${route.file}.html`), html, 'utf8')
  } catch (error) {
    failures += 1
    console.error(`prerender: ${route.path} failed — ${(error as Error).message}`)
  }
}

if (failures) {
  console.error(`prerender: ${failures} of ${routes.length} routes failed`)
  process.exit(1)
}

console.log(`prerender: ${routes.length} routes rendered to ${OUT}`)
