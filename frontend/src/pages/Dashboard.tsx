import { type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import Layout from '../components/Layout'

// ── Icons ──────────────────────────────────────────────────────────────────
const Icon = ({ children, size = 20 }: { children: ReactNode; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
)

interface Tool {
  mono: string
  title: string
  description: string
  to: string
  icon: ReactNode
}

// ── AI Generator cards (primary 3) ─────────────────────────────────────────
const primaryTools: Tool[] = [
  {
    mono: 'Assignment Generator',
    title: 'Create Assignments',
    description: 'Custom questions, marking schemes, and printable answer keys in seconds.',
    to: '/generate/assignment',
    icon: (
      <Icon>
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
      </Icon>
    ),
  },
  {
    mono: 'Lesson Plan Generator',
    title: 'Plan Your Week',
    description: 'Structured multi-day lesson plans with objectives, activities, and assessments.',
    to: '/generate/lesson-plan',
    icon: (
      <Icon>
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
      </Icon>
    ),
  },
  {
    mono: 'Concept Explainer',
    title: 'Explain Any Concept',
    description: 'Five parallel explanations — from analogy to Socratic dialogue — all at once.',
    to: '/generate/concept',
    icon: (
      <Icon>
        <path d="M9 18h6M10 22h4M12 2a7 7 0 015.39 11.47l-.39.53V17a1 1 0 01-1 1H8a1 1 0 01-1-1v-3l-.39-.53A7 7 0 0112 2z" />
      </Icon>
    ),
  },
]

// ── Utility cards (secondary 2) ────────────────────────────────────────────
const utilityTools: Tool[] = [
  {
    mono: 'Resource Discovery',
    title: 'Find Videos',
    description: 'Curated YouTube videos filtered by topic and grade level.',
    to: '/resources',
    icon: (
      <Icon>
        <circle cx="11" cy="11" r="7" />
        <path d="M21 21l-4.35-4.35" />
      </Icon>
    ),
  },
  {
    mono: 'Personal Library',
    title: 'Your Library',
    description: 'Save, tag, and revisit every piece of content you have generated.',
    to: '/library',
    icon: (
      <Icon>
        <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
      </Icon>
    ),
  },
]

// ── Primary tool card ───────────────────────────────────────────────────────
const PrimaryCard = ({ mono, title, description, to, icon }: Tool) => (
  <Link
    to={to}
    className="group flex flex-col p-5 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
  >
    {/* Icon */}
    <div className="w-10 h-10 rounded-md bg-gray-100 flex items-center justify-center text-charcoal/85 group-hover:bg-slate/10 group-hover:text-terracotta transition-colors mb-4 shrink-0">
      {icon}
    </div>

    {/* Mono label */}
    <p className="font-mono text-[10px] font-medium uppercase tracking-widest text-charcoal/75 mb-1.5">
      {mono}
    </p>

    {/* Serif title */}
    <h3 className="font-serif text-xl text-charcoal leading-snug mb-2 group-hover:text-terracotta transition-colors">
      {title}
    </h3>

    {/* Description */}
    <p className="text-sm text-charcoal/85 leading-relaxed flex-1">
      {description}
    </p>

    {/* CTA */}
    <div className="mt-4 flex items-center gap-1.5 text-terracotta text-sm font-medium">
      <span>Get started</span>
      <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12h14M12 5l7 7-7 7" />
      </svg>
    </div>
  </Link>
)

// ── Utility card ────────────────────────────────────────────────────────────
const UtilityCard = ({ mono, title, description, to, icon }: Tool) => (
  <Link
    to={to}
    className="group flex items-center gap-4 px-5 py-4 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
  >
    <div className="w-9 h-9 rounded-md bg-gray-100 flex items-center justify-center text-charcoal/85 group-hover:bg-slate/10 group-hover:text-terracotta transition-colors shrink-0">
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="font-mono text-[10px] font-medium uppercase tracking-widest text-charcoal/75 mb-0.5">
        {mono}
      </p>
      <h3 className="font-serif text-base text-charcoal group-hover:text-terracotta transition-colors leading-snug">
        {title}
      </h3>
      <p className="text-xs text-charcoal/85 leading-relaxed mt-0.5 line-clamp-1">{description}</p>
    </div>
    <svg className="w-4 h-4 text-charcoal/85 group-hover:text-terracotta group-hover:translate-x-0.5 transition-all shrink-0"
      viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  </Link>
)

// ── Page ───────────────────────────────────────────────────────────────────
const Dashboard = () => {
  const { user } = useAuth()
  const firstName = user?.name?.split(' ')[0]

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">

        {/* Hero */}
        <div className="mb-8">
          <p className="font-mono text-[11px] font-medium uppercase tracking-widest text-terracotta mb-2">
            Welcome back
          </p>
          <h1 className="font-serif text-3xl text-charcoal leading-tight">
            Good to see you, <span className="text-terracotta">{firstName}</span>
          </h1>
          <p className="text-sm text-charcoal/80 mt-2">
            What would you like to create today?
          </p>
        </div>

        {/* AI generators */}
        <div className="mb-6">

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {primaryTools.map((t) => <PrimaryCard key={t.to} {...t} />)}
          </div>
        </div>

        {/* Utilities */}
        <div>
          <p className="font-mono text-[10px] font-medium uppercase tracking-widest text-charcoal/75 mb-3">
            Tools
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {utilityTools.map((t) => <UtilityCard key={t.to} {...t} />)}
          </div>
        </div>

      </div>
    </Layout>
  )
}

export default Dashboard
