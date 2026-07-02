import { useState, type ReactNode } from 'react'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// ── SVG icon primitives ─────────────────────────────────────────────────────
const Icon = ({ children, className = 'w-4 h-4' }: { children: ReactNode; className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
)

const icons = {
  dashboard: (
    <Icon>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </Icon>
  ),
  assignment: (
    <Icon>
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
    </Icon>
  ),
  calendar: (
    <Icon>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </Icon>
  ),
  bulb: (
    <Icon>
      <path d="M9 18h6M10 22h4M12 2a7 7 0 015.39 11.47l-.39.53V17a1 1 0 01-1 1H8a1 1 0 01-1-1v-3l-.39-.53A7 7 0 0112 2z" />
    </Icon>
  ),
  search: (
    <Icon>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.35-4.35" />
    </Icon>
  ),
  library: (
    <Icon>
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
    </Icon>
  ),
  user: (
    <Icon>
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </Icon>
  ),
  logout: (
    <Icon>
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
    </Icon>
  ),
}

// ── Nav data ────────────────────────────────────────────────────────────────
interface NavItem {
  to: string
  label: string
  icon: ReactNode
}

const mainNav: NavItem[] = [
  { to: '/dashboard',            label: 'Overview',     icon: icons.dashboard  },
  { to: '/generate/assignment',  label: 'Assignments',  icon: icons.assignment },
  { to: '/generate/lesson-plan', label: 'Lesson Plans', icon: icons.calendar   },
  { to: '/generate/concept',     label: 'Concepts',     icon: icons.bulb       },
  { to: '/resources',            label: 'Resources',    icon: icons.search     },
  { to: '/library',              label: 'Library',      icon: icons.library    },
]

const tabItems = mainNav  // alias for mobile tab bar

// ── Sidebar NavItem ─────────────────────────────────────────────────────────
const SideNavItem = ({ to, label, icon }: NavItem) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `relative flex items-center gap-3 h-9 pr-3 rounded-md text-sm transition-colors group ${
        isActive
          ? 'bg-white/8 text-orange pl-[13px] border-l-[3px] border-orange'
          : 'text-offwhite/75 hover:text-offwhite hover:bg-white/5 pl-4'
      }`
    }
  >
    {icon}
    <span className="font-medium">{label}</span>
  </NavLink>
)

// ── Layout ──────────────────────────────────────────────────────────────────
const Layout = ({ children }: { children: ReactNode }) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex min-h-screen bg-white">

      {/* ── Desktop sidebar ──────────────────────────────── */}
      <aside className="hidden md:flex w-58 bg-charcoal flex-col shrink-0 print:hidden">

        {/* Logo */}
        <div className="px-5 h-16 flex items-center border-b border-white/8">
          <NavLink to="/" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
            <img src="/chalkAiLogo.png" alt="ChalkAI" className="h-7 w-auto" />
            <span className="text-base font-semibold text-offwhite tracking-tight">
              Chalk<span className="text-orange">AI</span>
            </span>
          </NavLink>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          <p className="px-4 mb-2 text-[10px] font-semibold uppercase tracking-widest text-offwhite/75">
            Tools
          </p>
          {mainNav.map((item) => (
            <SideNavItem key={item.to} {...item} />
          ))}
        </nav>

        {/* User + logout */}
        <div className="px-3 py-4 border-t border-white/8">
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `relative flex items-center gap-3 h-9 pr-3 rounded-md text-sm transition-colors mb-1 ${
                isActive
                  ? 'bg-white/8 text-orange pl-[13px] border-l-[3px] border-orange'
                  : 'text-offwhite/75 hover:text-offwhite hover:bg-white/5 pl-4'
              }`
            }
          >
            {icons.user}
            <span className="font-medium">Profile</span>
          </NavLink>

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 h-9 rounded-md text-sm text-offwhite/65 hover:text-offwhite/70 hover:bg-white/5 transition-colors"
          >
            {icons.logout}
            Sign out
          </button>

          {/* Avatar row */}
          <div className="mt-3 pt-3 border-t border-white/8 flex items-center gap-2.5 px-1">
            <img
              src={`https://api.dicebear.com/9.x/adventurer/svg?seed=${encodeURIComponent(user?.email || 'user')}&backgroundColor=ffd5dc,b6e3f4,c0aede`}
              alt="avatar"
              className="w-7 h-7 rounded-full shrink-0 bg-white/10"
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-offwhite/80 truncate">{user?.name}</p>
              <p className="text-[11px] text-offwhite/65 truncate">{user?.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main area ────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Mobile top bar */}
        <header className="md:hidden flex items-center justify-between px-4 h-14 bg-charcoal print:hidden sticky top-0 z-30">
          <NavLink to="/" className="hover:opacity-80 transition-opacity flex items-center gap-2">
            <img src="/chalkAiLogo.png" alt="ChalkAI" className="h-7 w-auto" />
            <span className="text-sm font-semibold text-offwhite">
              Chalk<span className="text-orange">AI</span>
            </span>
          </NavLink>

          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="w-8 h-8 rounded-full bg-slate flex items-center justify-center text-white text-xs font-semibold active:scale-95 transition-transform"
            >
              {user?.name?.charAt(0).toUpperCase()}
            </button>

            {menuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-10 z-50 w-52 bg-white border border-sand rounded-xl shadow-md overflow-hidden">
                  <div className="px-4 py-3 border-b border-sand">
                    <p className="text-xs font-semibold text-charcoal truncate">{user?.name}</p>
                    <p className="text-xs text-charcoal/85 truncate mt-0.5">{user?.email}</p>
                  </div>
                  <Link
                    to="/profile"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-charcoal/85 hover:bg-sand/50 transition-colors"
                  >
                    {icons.user}
                    Profile
                  </Link>
                  <button
                    onClick={() => { setMenuOpen(false); handleLogout() }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-charcoal/75 hover:text-red-500 hover:bg-sand/50 transition-colors border-t border-sand"
                  >
                    {icons.logout}
                    Sign out
                  </button>
                </div>
              </>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 bg-gray-100 px-4 py-6 pb-28 sm:px-6 sm:py-8 md:pb-8 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* ── Mobile bottom tab bar ─────────────────────────── */}
      <nav className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-50 print:hidden">
        <div className="flex items-center gap-0.5 bg-charcoal rounded-2xl shadow-xl px-1.5 py-1">
          {tabItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all ${
                  isActive
                    ? 'bg-slate text-white'
                    : 'text-offwhite/65 hover:text-offwhite/80 active:scale-95'
                }`
              }
            >
              {item.icon}
              <span className="text-[9px] font-medium tracking-tight leading-none">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

    </div>
  )
}

export default Layout
