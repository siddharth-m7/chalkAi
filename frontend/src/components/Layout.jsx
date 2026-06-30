import { useState } from 'react'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Bottom tab bar items (mobile) — Profile is in the top-right avatar
const tabItems = [
  { to: '/dashboard', label: 'Dashboard', icon: '⊞' },
  { to: '/generate/assignment', label: 'Assignment', icon: '📝' },
  { to: '/generate/lesson-plan', label: 'Lesson Plan', icon: '📅' },
]

// Full sidebar nav (desktop) — includes Profile
const sidebarItems = [
  ...tabItems,
  { to: '/profile', label: 'Profile', icon: '◎' },
]

const Layout = ({ children }) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex min-h-screen bg-stone-50">

      {/* ── Desktop sidebar ─────────────────────────────── */}
      <aside className="hidden md:flex w-60 bg-white border-r border-stone-200 flex-col shrink-0 print:hidden">
        <div className="px-5 py-5 border-b border-stone-100">
          <NavLink to="/" className="text-lg font-bold text-black tracking-tight hover:opacity-70 transition-opacity">
            Chalk<span className="text-[#FF5841]">AI</span>
          </NavLink>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {sidebarItems.map((item) => (
            <NavLink key={item.to} to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive ? 'bg-[#FF5841] text-white shadow-sm' : 'text-stone-500 hover:bg-stone-100 hover:text-black'
                }`
              }
            >
              <span className="text-base leading-none">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Profile — bottom left on desktop */}
        <div className="px-4 py-4 border-t border-stone-100">
          <div className="flex items-center gap-3 mb-3 px-1">
            <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-white font-semibold text-xs shrink-0">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-black truncate">{user?.name}</p>
              <p className="text-xs text-stone-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button onClick={handleLogout}
            className="w-full text-left text-xs text-stone-400 hover:text-[#FF5841] transition-colors px-1 py-1">
            Sign out
          </button>
        </div>
      </aside>

      {/* ── Main area ───────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Mobile top bar */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-stone-100 print:hidden sticky top-0 z-30">
          <NavLink to="/" className="text-sm font-bold text-black tracking-tight">
            Chalk<span className="text-[#FF5841]">AI</span>
          </NavLink>

          {/* Profile avatar — top right on mobile */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-white font-semibold text-xs active:scale-95 transition-transform"
            >
              {user?.name?.charAt(0).toUpperCase()}
            </button>

            {userMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                <div className="absolute right-0 top-11 z-50 w-52 bg-white border border-stone-200 rounded-2xl shadow-xl overflow-hidden">
                  <div className="px-4 py-3 border-b border-stone-100">
                    <p className="text-xs font-semibold text-black truncate">{user?.name}</p>
                    <p className="text-xs text-stone-400 truncate mt-0.5">{user?.email}</p>
                  </div>
                  <Link
                    to="/profile"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-3 text-sm text-stone-600 hover:bg-stone-50 transition-colors"
                  >
                    <span className="text-base leading-none">◎</span>
                    Profile
                  </Link>
                  <button
                    onClick={() => { setUserMenuOpen(false); handleLogout() }}
                    className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-stone-500 hover:text-[#FF5841] hover:bg-stone-50 transition-colors border-t border-stone-100"
                  >
                    <span className="text-base leading-none">→</span>
                    Sign out
                  </button>
                </div>
              </>
            )}
          </div>
        </header>

        {/* Page content — extra bottom padding so content clears the floating nav */}
        <main className="flex-1 p-4 pb-28 sm:p-8 md:pb-8 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* ── Mobile bottom floating tab bar ──────────────── */}
      <nav className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-50 print:hidden">
        <div className="flex items-center gap-1 bg-white border border-stone-200 rounded-2xl shadow-xl px-2 py-1.5">
          {tabItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl transition-all ${
                  isActive
                    ? 'bg-[#FF5841]/10 text-[#FF5841]'
                    : 'text-stone-400 hover:text-stone-600 active:scale-95'
                }`
              }
            >
              <span className="text-xl leading-none">{item.icon}</span>
              <span className="text-[10px] font-semibold tracking-tight">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

    </div>
  )
}

export default Layout
