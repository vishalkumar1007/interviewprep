import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  CalendarDays,
  Target,
  ClipboardCheck,
  MessageSquare,
  Moon,
  Sun,
  Menu,
  X,
  LogOut,
  Map,
  FlaskConical,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { BANK_NAV } from '../pages/BanksPage'

const nav = [
  { to: '/today', label: 'Today', icon: LayoutDashboard },
  { to: '/week', label: 'Week plan', icon: CalendarDays },
  { to: '/syllabus', label: 'Syllabus', icon: Map },
  { to: '/tests', label: 'Tests', icon: FlaskConical },
  { to: '/curriculum', label: 'Curriculum', icon: Target },
  { to: '/progress', label: 'Progress', icon: ClipboardCheck },
  { to: '/communication', label: 'Communication hub', icon: MessageSquare },
]

export function AppShell() {
  const { user, profile, logout } = useAuth()
  const { theme, toggle } = useTheme()
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()
  const initials = (user?.name || 'U').split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 900) setMenuOpen(false)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  return (
    <div className={`app-shell ${menuOpen ? 'nav-open' : ''}`}>
      {menuOpen && <button className="mobile-scrim" aria-label="Close menu" onClick={() => setMenuOpen(false)} />}
      <aside className={`sidebar ${menuOpen ? 'open' : ''}`}>
        <div className="sidebar-top">
          <div className="brand"><span className="brand-mark">P</span>Prepbase</div>
          <button className="icon-button sidebar-close" aria-label="Close navigation" onClick={() => setMenuOpen(false)}>
            <X size={18} />
          </button>
        </div>
        <div className="sidebar-section-label">JOURNEY</div>
        <nav className="sidebar-nav">
          {nav.map(item => {
            const Icon = item.icon
            return (
              <NavLink key={item.to} to={item.to} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>
                <Icon size={17} />{item.label}
              </NavLink>
            )
          })}
          <div className="sidebar-section-label banks-label">BANKS</div>
          {BANK_NAV.map(item => (
            <NavLink
              key={item.key}
              to={`/banks/${item.key}`}
              className={({ isActive }) => `nav-item nav-sub ${isActive ? 'active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              <span className="nav-dot" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <button className="profile-row" onClick={() => { navigate('/profile'); setMenuOpen(false) }}>
            <span className="avatar">{initials}</span>
            <span>
              <b>{user?.name}</b>
              <small>{profile?.target_level} · {profile?.target_role}</small>
            </span>
          </button>
          <button className="nav-item" onClick={() => void logout().then(() => navigate('/login'))}>
            <LogOut size={17} />Sign out
          </button>
        </div>
      </aside>
      <div className="main">
        <header className="topbar">
          <div className="topbar-left">
            <button className="icon-button mobile-menu" aria-label="Open navigation" onClick={() => setMenuOpen(true)}>
              <Menu size={18} />
            </button>
            <div className="crumb"><span className="crumb-brand">Prepbase</span><span className="slash">/</span><b>Google SWE prep</b></div>
          </div>
          <div className="topbar-right">
            <button className="icon-button" aria-label="Toggle theme" onClick={toggle}>
              {theme === 'light' ? <Moon size={17} /> : <Sun size={17} />}
            </button>
            <button className="avatar top-avatar" aria-label="Open profile" onClick={() => navigate('/profile')}>{initials}</button>
          </div>
        </header>
        <main className="page"><Outlet /></main>
      </div>
    </div>
  )
}
