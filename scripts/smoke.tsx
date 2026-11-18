import { renderToString } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { App } from '../src/App'
import { PAGES } from '../src/lib/content'
import { GOALS, VOICES, treePath } from '../src/lib/tree'

const routes = [
  '/',
  ...PAGES.map((page) => `/${page.section}/${page.slug}`),
  treePath(VOICES[0].id, GOALS[0].id),
  treePath(VOICES[3].id, GOALS[3].id),
  '/v/grower/fund',
  '/v/nope/try',
  '/this-route-does-not-exist',
]

let failures = 0

for (const route of routes) {
  try {
    const html = renderToString(
      <MemoryRouter initialEntries={[route]}>
        <App />
      </MemoryRouter>,
    )
    const heading = /<h1[^>]*>([\s\S]*?)<\/h1>/i
      .exec(html)?.[1]
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
    if (!heading) throw new Error('rendered without an <h1>')
    console.log(`  ok  ${route.padEnd(28)} ${heading.slice(0, 44)}`)
  } catch (error) {
    failures += 1
    console.error(`FAIL  ${route.padEnd(28)} ${(error as Error).message}`)
  }
}

console.log(
  failures ? `\nsmoke: ${failures} of ${routes.length} routes failed` : `\nsmoke: ${routes.length} routes rendered`,
)
process.exit(failures ? 1 : 0)
