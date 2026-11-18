/**
 * The content model, inherited from le.gume.
 *
 * Every page is a Markdown file under src/content/<section>/<slug>.md.
 * Frontmatter is a deliberately small subset of YAML so the site needs no
 * parser dependency and the contract stays readable. The nav is derived.
 */

export const SECTIONS = [
  {
    id: 'tree',
    label: 'Tree',
    blurb: 'What a link tree is, and how a voice and a goal choose one.',
  },
  {
    id: 'isotope',
    label: 'Isotope',
    blurb: 'The one thing le.seo introduces, and the pickles it is built from.',
  },
  {
    id: 'docs',
    label: 'Docs',
    blurb: 'The seed itself: its parts, its checks, and the deploy.',
  },
] as const

export type SectionId = (typeof SECTIONS)[number]['id']

export type Heading = { depth: 2 | 3; text: string; id: string }

export type Page = {
  path: string
  section: SectionId
  slug: string
  title: string
  description: string
  order: number
  updated: string
  tags: string[]
  raw: string
  body: string
  headings: Heading[]
}

const rawFiles = import.meta.glob('../content/**/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[`*_~]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function parseFrontmatter(source: string): { data: Record<string, string>; body: string } {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(source)
  if (!match) return { data: {}, body: source }
  const data: Record<string, string> = {}
  for (const line of match[1].split(/\r?\n/)) {
    const at = line.indexOf(':')
    if (at <= 0) continue
    const key = line.slice(0, at).trim()
    let value = line.slice(at + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    data[key] = value
  }
  return { data, body: source.slice(match[0].length) }
}

function extractHeadings(body: string): Heading[] {
  const out: Heading[] = []
  let inFence = false
  for (const line of body.split(/\r?\n/)) {
    if (/^\s*```/.test(line)) inFence = !inFence
    if (inFence) continue
    const m = /^(#{2,3})\s+(.+?)\s*$/.exec(line)
    if (!m) continue
    const text = m[2].replace(/\s+#+$/, '')
    out.push({ depth: m[1].length === 2 ? 2 : 3, text, id: slugify(text) })
  }
  return out
}

function toPage(path: string, source: string): Page | null {
  const rel = path.replace(/^.*\/content\//, '').replace(/\.md$/, '')
  const [section, ...rest] = rel.split('/')
  const slug = rest.join('/')
  if (!slug || !SECTIONS.some((s) => s.id === section)) return null

  const { data, body: raw } = parseFrontmatter(source)
  // The title is the frontmatter title; a body that opens with `# Title` is
  // restating it, and rendering both would ship two <h1> elements.
  const body = raw.replace(/^\s*#\s+.*\r?\n/, '')
  return {
    path: rel,
    section: section as SectionId,
    slug,
    title: data.title || slug,
    description: data.description || '',
    order: Number(data.order ?? 999),
    updated: data.updated || '',
    tags: (data.tags || '')
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean),
    raw: source,
    body,
    headings: extractHeadings(body),
  }
}

export const PAGES: Page[] = Object.entries(rawFiles)
  .map(([path, source]) => toPage(path, source))
  .filter((p): p is Page => p !== null)
  .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title))

export function pagesIn(section: SectionId): Page[] {
  return PAGES.filter((p) => p.section === section)
}

export function getPage(section: string, slug: string): Page | undefined {
  return PAGES.find((p) => p.section === section && p.slug === slug)
}

export function sectionMeta(id: SectionId) {
  return SECTIONS.find((s) => s.id === id)!
}

export function href(page: Page): string {
  return `/${page.section}/${page.slug}`
}

export function neighbours(page: Page): { prev?: Page; next?: Page } {
  const list = pagesIn(page.section)
  const i = list.findIndex((p) => p.path === page.path)
  return { prev: list[i - 1], next: list[i + 1] }
}
