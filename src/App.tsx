import type { ReactNode } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { useAuth } from './context/AuthContext'
import { LoginPage, SignupPage } from './pages/AuthPages'
import { TodayPage, TodayTargetPage } from './pages/TodayPage'
import { WeekPage } from './pages/WeekPage'
import { CurriculumPage, ModulePage } from './pages/CurriculumPage'
import { ProgressPage } from './pages/ProgressPage'
import { CommunicationPage } from './pages/CommunicationPage'
import { ProfilePage } from './pages/ProfilePage'
import { SyllabusPage } from './pages/SyllabusPage'
import { AssessmentDetailPage, TestsPage } from './pages/TestsPage'
import { BanksIndexPage, SkillBankPage } from './pages/BanksPage'

function Protected({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="gate-page"><p>Loading session…</p></div>
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route
        path="/"
        element={
          <Protected>
            <AppShell />
          </Protected>
        }
      >
        <Route index element={<Navigate to="/today" replace />} />
        <Route path="today" element={<TodayPage />} />
        <Route path="today/target" element={<TodayTargetPage />} />
        <Route path="week" element={<WeekPage />} />
        <Route path="syllabus" element={<SyllabusPage />} />
        <Route path="tests" element={<TestsPage />} />
        <Route path="tests/:id" element={<AssessmentDetailPage />} />
        <Route path="banks" element={<BanksIndexPage />} />
        <Route path="banks/:skill" element={<SkillBankPage />} />
        <Route path="curriculum" element={<CurriculumPage />} />
        <Route path="curriculum/:skill/:moduleSlug" element={<ModulePage />} />
        <Route path="dsa" element={<Navigate to="/banks/dsa" replace />} />
        <Route path="progress" element={<ProgressPage />} />
        <Route path="communication" element={<CommunicationPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>
      <Route path="*" element={<Navigate to="/today" replace />} />
    </Routes>
  )
}
