import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { SiteFooter } from './SiteFooter'
import { SiteHeader } from './SiteHeader'

export function Layout() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [pathname])

  return (
    <>
      <div className="smoke" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <div className="shell">
        <SiteHeader />
        <main id="main" className="main">
          <Outlet />
        </main>
        <SiteFooter />
      </div>
    </>
  )
}
