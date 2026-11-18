import { Navigate, Route, Routes, useParams } from 'react-router-dom'
import { Layout } from './components/Layout'
import { SECTIONS, getPage, type SectionId } from './lib/content'
import { DEFAULT_GOAL, DEFAULT_VOICE, isGoal, isVoice } from './lib/tree'
import { DocPage } from './pages/DocPage'
import { Home } from './pages/Home'
import { NotFound } from './pages/NotFound'
import { SectionIndex } from './pages/SectionIndex'
import { TreePage } from './pages/TreePage'

function isSection(value: string | undefined): value is SectionId {
  return !!value && SECTIONS.some((s) => s.id === value)
}

function SectionRoute() {
  const { section } = useParams()
  if (!isSection(section)) return <NotFound />
  return <SectionIndex section={section} />
}

function PageRoute() {
  const { section, slug } = useParams()
  const page = isSection(section) && slug ? getPage(section, slug) : undefined
  if (!page) return <NotFound />
  return <DocPage page={page} />
}

/** A tree is an address: /v/<voice>/<goal>. Both values are required. */
function TreeRoute() {
  const { voice, goal } = useParams()
  if (!isVoice(voice) || !isGoal(goal)) return <NotFound />
  return <TreePage voice={voice} goal={goal} />
}

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="v" element={<Navigate to={`/v/${DEFAULT_VOICE}/${DEFAULT_GOAL}`} replace />} />
        <Route path="v/:voice/:goal" element={<TreeRoute />} />
        <Route path="tree/index" element={<Navigate to="/tree" replace />} />
        <Route path=":section" element={<SectionRoute />} />
        <Route path=":section/:slug" element={<PageRoute />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
