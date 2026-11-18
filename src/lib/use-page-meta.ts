import { useEffect } from 'react'
import { SITE } from './site'

/**
 * Title and description per route.
 *
 * The prerenderer writes the same title into each shell, so this is the
 * client-side half of one rule, not a second source: a page that changes its
 * title here without the build knowing is caught by the publish guard.
 */
export function usePageMeta(title: string, description?: string) {
  useEffect(() => {
    const full = title === SITE.name ? `${SITE.name} — an empty hot desk` : `${title} · ${SITE.name}`
    document.title = full
    if (description) {
      let tag = document.querySelector('meta[name="description"]')
      if (!tag) {
        tag = document.createElement('meta')
        tag.setAttribute('name', 'description')
        document.head.appendChild(tag)
      }
      tag.setAttribute('content', description)
    }
  }, [title, description])
}
