import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Icon = ({ children }) => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
)

// Reusable screenshot placeholder — swap src prop with a real image path when ready
const ScreenshotPlaceholder = ({ src, alt, className = '', aspectClass = 'aspect-video' }) => (
  src
    ? <img src={src} alt={alt} className={`w-full ${aspectClass} object-cover object-top ${className}`} />
    : (
      <div className={`w-full ${aspectClass} bg-gray-100 flex flex-col items-center justify-center gap-2 ${className}`}>
        <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M3 9h18M9 21V9" strokeLinecap="round" />
        </svg>
        <span className="text-xs text-gray-400 font-mono">{alt}</span>
      </div>
    )
)

const features = [
  {
    icon: <Icon><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" /></Icon>,
    title: 'Assignment Generator',
    description: 'Create custom assignments with questions, answer keys, and marking schemes in seconds.',
    // screenshot: '/screenshots/assignment-generator.png',
    screenshot: null,
  },
  {
    icon: <Icon><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></Icon>,
    title: 'Lesson Plan Generator',
    description: 'Generate structured weekly lesson plans with daily breakdowns and activities.',
    // screenshot: '/screenshots/lesson-plan.png',
    screenshot: null,
  },
  {
    icon: <Icon><path d="M9 18h6M10 22h4M12 2a7 7 0 015.39 11.47l-.39.53V17a1 1 0 01-1 1H8a1 1 0 01-1-1v-3l-.39-.53A7 7 0 0112 2z" /></Icon>,
    title: 'Concept Explainer',
    description: 'Explain any concept using multiple methods — analogies, examples, stories, and more.',
    // screenshot: '/screenshots/concept-explainer.png',
    screenshot: null,
  },
  {
    icon: <Icon><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.35-4.35" /></Icon>,
    title: 'Resource Discovery',
    description: 'Find curated educational videos from YouTube tailored to your subject and grade.',
    // screenshot: '/screenshots/resource-discovery.png',
    screenshot: null,
  },
  {
    icon: <Icon><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6" /></Icon>,
    title: 'PDF & Word Export',
    description: 'Export everything to print-ready PDF or editable Word documents in one click.',
    // screenshot: '/screenshots/export.png',
    screenshot: null,
  },
  {
    icon: <Icon><path d="M4 19.5A2.5 2.5 0 016.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" /></Icon>,
    title: 'Personal Library',
    description: 'Save, tag, and organize everything you generate in one place.',
    // screenshot: '/screenshots/library.png',
    screenshot: null,
  },
]

const Home = () => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-6 h-6 border-2 border-sand border-t-terracotta rounded-full animate-spin" />
      </div>
    )
  }

  if (user) return <Navigate to="/dashboard" replace />

  return (
    <div className="min-h-screen bg-white">

      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src="/chalkAiLogo.png" alt="ChalkAI" className="h-7 w-auto" />
            <span className="text-sm font-semibold text-charcoal tracking-tight">
              Chalk<span className="text-terracotta">AI</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/login"
              className="h-8 px-4 flex items-center text-sm bg-charcoal text-white font-medium rounded-md hover:bg-charcoal/80 transition-colors">
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ──────────────────────────────────────────────────────────────── */}
      <section className="pt-20 pb-0 px-6 overflow-hidden">
        <div className="max-w-6xl mx-auto">

          {/* Text block — centred above the mockup */}
          <div className="max-w-2xl mx-auto text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 h-7 bg-gray-100 border border-gray-200 rounded-full text-[11px] font-mono font-medium text-charcoal/75 mb-6 uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-slate" />
              AI-powered tools for educators
            </div>

            <h1 className="font-serif text-5xl sm:text-6xl text-charcoal leading-[1.1] mb-5">
              Save hours of prep work.<br />
              <span className="text-terracotta">Let AI do the heavy lifting.</span>
            </h1>

            <p className="text-base text-charcoal/70 max-w-xl mx-auto mb-8 leading-relaxed">
              ChalkAI helps teachers generate assignments, lesson plans, and concept explanations
              in seconds — so you can focus on what matters most: your students.
            </p>

            <div className="flex items-center justify-center gap-3 mb-10">
              <Link to="/login"
                className="h-10 px-6 flex items-center bg-slate text-white text-sm font-semibold rounded-md hover:bg-slate-dark transition-colors">
                Get started
              </Link>
            </div>

            {/* Stats row */}
            <div className="inline-flex flex-wrap sm:flex-nowrap items-stretch border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
              {[
                { value: '5+', label: 'AI tools' },
                { value: '<10s', label: 'Generation time' },
                { value: '100%', label: 'Free to use' },
              ].map((stat, i) => (
                <div key={stat.label} className={`px-8 py-4 text-center ${i > 0 ? 'border-l border-gray-100' : ''}`}>
                  <p className="font-mono text-xl font-bold text-charcoal">{stat.value}</p>
                  <p className="text-xs text-charcoal/70 mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Hero app mockup — browser chrome frame */}
          {/* 👉 To add your screenshot: set src="/screenshots/dashboard.png" on the ScreenshotPlaceholder below */}
          <div className="relative mx-auto max-w-5xl">
            {/* Browser chrome */}
            <div className="bg-gray-800 rounded-t-2xl px-4 py-3 flex items-center gap-2">
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-400" />
                <span className="w-3 h-3 rounded-full bg-yellow-400" />
                <span className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <div className="flex-1 mx-4">
                <div className="bg-gray-700 rounded-md h-6 flex items-center px-3">
                  <span className="text-gray-400 text-[11px] font-mono">app.chalkai.com/dashboard</span>
                </div>
              </div>
            </div>
            {/* Screenshot area */}
            <div className="border-x border-b border-gray-200 rounded-b-2xl overflow-hidden shadow-2xl">
              <ScreenshotPlaceholder
                src={null /* swap with: '/screenshots/dashboard.png' */}
                alt="ChalkAI dashboard screenshot"
                aspectClass="aspect-[16/9]"
              />
            </div>
            {/* Fade bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent pointer-events-none rounded-b-2xl" />
          </div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────────────────────── */}
      <section className="py-24 bg-gray-50 border-y border-gray-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="font-mono text-[10px] font-medium uppercase tracking-widest text-charcoal/60 mb-3">Features</p>
            <h2 className="font-serif text-3xl text-charcoal mb-3">Everything a teacher needs</h2>
            <p className="text-charcoal/65 text-sm max-w-md mx-auto leading-relaxed">
              From daily assignments to full lesson plans — generate, preview, and save in one place.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f) => (
              <div key={f.title}
                className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                {/* Screenshot thumbnail */}
                {/* 👉 To add your screenshot: set f.screenshot = '/screenshots/your-file.png' in the features array above */}
                <div className="border-b border-gray-100 overflow-hidden">
                  <ScreenshotPlaceholder
                    src={f.screenshot}
                    alt={`${f.title} screenshot`}
                    aspectClass="aspect-[16/9]"
                  />
                </div>
                {/* Text */}
                <div className="p-5">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-charcoal/75 mb-3">
                    {f.icon}
                  </div>
                  <h3 className="font-serif text-base text-charcoal mb-1">{f.title}</h3>
                  <p className="text-xs text-charcoal/70 leading-relaxed">{f.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ──────────────────────────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="font-mono text-[10px] font-medium uppercase tracking-widest text-charcoal/60 mb-3">How it works</p>
            <h2 className="font-serif text-3xl text-charcoal">Three steps to your next great lesson</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                step: '01',
                title: 'Fill in the details',
                desc: 'Select your subject, grade, chapter, and preferences.',
                // screenshot: '/screenshots/step-form.png',
                screenshot: null,
              },
              {
                step: '02',
                title: 'AI generates instantly',
                desc: 'Our AI builds your content in seconds using the latest models.',
                // screenshot: '/screenshots/step-generating.png',
                screenshot: null,
              },
              {
                step: '03',
                title: 'Preview & export',
                desc: 'Review the output, export as PDF or Word, and save to your library.',
                // screenshot: '/screenshots/step-result.png',
                screenshot: null,
              },
            ].map((item) => (
              <div key={item.step} className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                {/* Step screenshot */}
                {/* 👉 To add: set screenshot: '/screenshots/your-file.png' in the array above */}
                <div className="border-b border-gray-100">
                  <ScreenshotPlaceholder
                    src={item.screenshot}
                    alt={`Step ${item.step} screenshot`}
                    aspectClass="aspect-[4/3]"
                  />
                </div>
                <div className="p-5">
                  <div className="w-8 h-8 rounded-lg bg-slate flex items-center justify-center mb-3">
                    <span className="font-mono text-[11px] font-bold text-white">{item.step}</span>
                  </div>
                  <h3 className="font-serif text-base text-charcoal mb-1">{item.title}</h3>
                  <p className="text-xs text-charcoal/70 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────────── */}
      <footer className="border-t border-gray-100 bg-white">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/chalkAiLogo.png" alt="ChalkAI" className="h-5 w-auto opacity-40" />
            <span className="font-mono text-xs text-charcoal/60">ChalkAI</span>
          </div>
          <span className="text-xs text-charcoal/50">Built for educators, by developers who care about education.</span>
        </div>
      </footer>

    </div>
  )
}

export default Home
