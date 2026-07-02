import { useState, useEffect, useRef } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const slides = [
  '/dashboard.png',
  '/assignmentGenerator.png',
  '/library.png',
  '/lessonPlan.png',
  '/resourceDiscovery.png',
]

const HeroSlideshow = () => {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setIndex(i => (i + 1) % slides.length), 3500)
    return () => clearInterval(t)
  }, [])

  return (
    <div
      className="w-full rounded-2xl border border-black/8 overflow-hidden bg-white"
      style={{ height: '340px', boxShadow: '0 30px 80px -15px rgba(44,62,80,0.18), 0 10px 30px -8px rgba(44,62,80,0.10)' }}
    >
      <div className="relative w-full h-full">
        {slides.map((src, i) => (
          <img
            key={src}
            src={src}
            alt=""
            className="absolute inset-0 w-full h-full object-cover object-top"
            style={{ opacity: i === index ? 1 : 0, transition: 'opacity 0.8s ease-in-out' }}
          />
        ))}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${i === index ? 'bg-orange w-4' : 'bg-white/70 w-1.5'}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

const Check = () => (
  <svg className="w-5 h-5 text-orange shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const STATEMENT = "Teachers spend hours every week writing questions, planning lessons, and hunting for resources. ChalkAI handles all of that — so you can focus on what actually matters in the classroom."

const Home = () => {
  const { user, loading } = useAuth()
  const statementRef = useRef<HTMLHeadingElement | null>(null)
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    let ticking = false
    const handleScroll = () => {
      if (ticking) return
      ticking = true
      window.requestAnimationFrame(() => {
        if (statementRef.current) {
          const rect = statementRef.current.getBoundingClientRect()
          const wh = window.innerHeight
          if (rect.bottom >= 0 && rect.top <= wh) {
            const center = rect.top + rect.height / 2
            const rel = (wh - center) / wh
            const p = rel < 0.35 ? (rel - 0.1) / 0.25 : rel <= 0.65 ? 1 : 1 - (rel - 0.65) / 0.25
            setScrollProgress(Math.min(1, Math.max(0, p)))
          }
        }
        ticking = false
      })
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-6 h-6 border-2 border-gray-200 border-t-orange rounded-full animate-spin" />
    </div>
  )

  if (user) return <Navigate to="/dashboard" replace />

  const words = STATEMENT.split(' ')

  return (
    <div className="min-h-screen bg-white antialiased">

      {/* ── Navbar ── */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-black/5">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src="/chalkAiLogo.png" alt="ChalkAI" className="h-8 w-auto" />
            <span className="text-base font-bold text-charcoal tracking-tight">
              Chalk<span className="text-orange">AI</span>
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-charcoal/55 hover:text-charcoal transition-colors">Features</a>
            <a href="#library" className="text-sm font-medium text-charcoal/55 hover:text-charcoal transition-colors">Library</a>
            <a href="#how-it-works" className="text-sm font-medium text-charcoal/55 hover:text-charcoal transition-colors">How it works</a>
          </nav>
          <Link to="/login" className="h-9 px-5 flex items-center text-sm bg-charcoal text-white font-semibold rounded-full hover:bg-black transition-all hover:scale-[1.02]">
            Get Started
          </Link>
        </div>
      </header>

      {/* ── Hero ── */}
      <div className="w-full bg-gradient-to-b from-white via-white to-[#f0f4f8] pt-20 pb-28 overflow-x-hidden">
        <section className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-16 items-center">

            <div className="animate-fade-in-up">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-black/8 text-sm font-semibold mb-8 shadow-sm">
                <span className="text-orange text-base">✦</span>
                <span className="text-charcoal/60 text-xs uppercase tracking-widest font-mono">Built for teachers</span>
              </div>

              <h1
                className="text-5xl sm:text-6xl font-extrabold text-charcoal leading-[1.1] mb-6"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                Save hours of prep work.<br />
                <span className="text-orange">Let AI do the heavy lifting.</span>
              </h1>

              <p className="text-lg text-charcoal/60 mb-10 leading-relaxed max-w-lg">
                ChalkAI generates assignments, lesson plans, and concept explanations in seconds — so you can spend less time at your desk and more time with your students.
              </p>

              <Link
                to="/login"
                className="inline-flex items-center gap-2 h-12 px-8 bg-charcoal text-white text-sm font-semibold rounded-full hover:bg-black transition-all hover:scale-[1.02] shadow-lg shadow-charcoal/20"
              >
                Get Started
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            <div className="animate-fade-in-right">
              <HeroSlideshow />
            </div>

          </div>
        </section>
      </div>

      {/* ── Scroll-driven statement ── */}
      <section className="py-32 px-6" id="how-it-works">
        <div className="max-w-4xl mx-auto text-center">
          <h2
            ref={statementRef}
            className="text-3xl sm:text-4xl font-bold leading-snug tracking-tight"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            {words.map((word, i) => {
              const start = (i / words.length) * 0.85
              const p = Math.min(1, Math.max(0, (scrollProgress - start) / 0.15))
              return (
                <span key={i} style={{ color: `rgba(44,62,80,${0.18 + p * 0.82})`, transition: 'color 0.1s' }}>
                  {word}{i < words.length - 1 ? ' ' : ''}
                </span>
              )
            })}
          </h2>
        </div>
      </section>

      {/* ── Big screenshot ── */}
      <section className="px-6 pb-32" id="features">
        <div className="max-w-5xl mx-auto relative scroll-reveal">
          <div className="absolute -left-6 top-8 z-10 bg-white rounded-2xl shadow-xl border border-black/5 px-5 py-3 hidden sm:block" style={{ rotate: '-3deg' }}>
            <p className="font-mono text-2xl font-bold text-orange leading-none">5+</p>
            <p className="text-[11px] text-charcoal/55 mt-1 font-semibold uppercase tracking-wider">Hours saved<br />per week</p>
          </div>
          <div className="absolute -right-6 bottom-8 z-10 bg-white rounded-2xl shadow-xl border border-black/5 px-5 py-3 hidden sm:block" style={{ rotate: '3deg' }}>
            <p className="font-mono text-2xl font-bold text-orange leading-none">&lt;10s</p>
            <p className="text-[11px] text-charcoal/55 mt-1 font-semibold uppercase tracking-wider">Content<br />generation</p>
          </div>

          {/* Browser-frame wrapper */}
          <div className="rounded-3xl border border-black/8 overflow-hidden bg-white" style={{ boxShadow: '0 40px 100px -20px rgba(44,62,80,0.18)' }}>
            {/* Browser chrome bar */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-black/6 bg-[#F3F4F6]">
              <span className="w-3 h-3 rounded-full bg-red-400" />
              <span className="w-3 h-3 rounded-full bg-yellow-400" />
              <span className="w-3 h-3 rounded-full bg-green-400" />
              <div className="flex-1 mx-4 h-6 bg-white rounded-md border border-black/8 flex items-center px-3">
                <span className="text-[11px] text-charcoal/35 font-mono">app.chalkai.com/generate/assignment</span>
              </div>
            </div>
            <div className="p-4 bg-[#F3F4F6]">
              <div className="rounded-xl overflow-hidden border border-black/6 shadow-sm" style={{ maxHeight: '380px' }}>
                <img src="/assignmentGenerator.png" alt="Assignment Generator" className="w-full h-auto object-cover object-top" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Feature rows ── */}
      <section className="px-6 pb-12 space-y-16" id="library">

        {/* Row 1 */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="scroll-reveal-left">
            <p className="text-xs font-bold uppercase tracking-widest text-orange mb-3">Personal Library</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-charcoal mb-4 leading-snug" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Everything you create,<br />saved in one place
            </h2>
            <p className="text-base text-charcoal/60 mb-6 leading-relaxed">
              Every assignment, lesson plan, and explanation you generate is automatically saved to your library. Come back to it anytime, tag it, or export it — no copy-pasting needed.
            </p>
            <ul className="space-y-3">
              {['All generated content saved automatically', 'Filter by type, subject, or grade level', 'Download as PDF or Word with one click'].map(t => (
                <li key={t} className="flex items-center gap-3 text-sm text-charcoal/70 font-medium">
                  <Check />{t}
                </li>
              ))}
            </ul>
          </div>
          <div className="scroll-reveal-right bg-[#F3F4F6] rounded-[2rem] p-5 border border-black/5 group hover:shadow-lg transition-all duration-300">
            <div className="rounded-2xl overflow-hidden bg-white border border-black/5 shadow-md">
              <div className="transform group-hover:scale-[1.02] transition-transform duration-500 origin-top">
                <img src="/library.png" alt="Personal Library" className="w-full h-auto object-cover object-top aspect-[4/3]" />
              </div>
            </div>
          </div>
        </div>

        {/* Row 2 */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="scroll-reveal-left bg-[#F3F4F6] rounded-[2rem] p-5 border border-black/5 group hover:shadow-lg transition-all duration-300">
            <div className="rounded-2xl overflow-hidden bg-white border border-black/5 shadow-md">
              <div className="transform group-hover:scale-[1.02] transition-transform duration-500 origin-top">
                <img src="/lessonPlan.png" alt="Lesson Plan" className="w-full h-auto object-cover object-top aspect-[4/3]" />
              </div>
            </div>
          </div>
          <div className="scroll-reveal-right">
            <p className="text-xs font-bold uppercase tracking-widest text-orange mb-3">Lesson Planner</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-charcoal mb-4 leading-snug" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Plan Your Entire<br />Week in Minutes
            </h2>
            <p className="text-base text-charcoal/60 mb-6 leading-relaxed">
              Generate structured multi-day lesson plans with objectives, warm-ups, activities, and homework — all tailored to your grade and subject.
            </p>
            <ul className="space-y-3">
              {['Daily breakdowns with learning objectives', 'Warm-up, main activity, and wrap-up for each day', 'Export to PDF or Word and print instantly'].map(t => (
                <li key={t} className="flex items-center gap-3 text-sm text-charcoal/70 font-medium">
                  <Check />{t}
                </li>
              ))}
            </ul>
          </div>
        </div>

      </section>

      {/* ── What ChalkAI Enables ── */}
      <section className="py-28 px-6 bg-[#F3F4F6]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 scroll-reveal">
            <h2 className="text-3xl sm:text-4xl font-bold text-charcoal mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              What ChalkAI Enables
            </h2>
            <p className="text-base text-charcoal/55 max-w-md mx-auto leading-relaxed">
              From discovery to delivery — every tool a teacher needs, powered by AI.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {[
              { src: '/resourceDiscovery.png', label: 'Resource Discovery', title: 'Curated Resource Discovery', desc: 'Find YouTube videos filtered by topic, subject, and grade level — curated automatically for your class.', anim: 'scroll-reveal-left' },
              { src: '/exportPdf.png', label: 'Export', title: 'One-Click PDF & Word Export', desc: 'Export any generated content to a print-ready PDF or editable Word document in seconds.', anim: 'scroll-reveal-right' },
            ].map(item => (
              <div key={item.title} className={`${item.anim} bg-white rounded-[2rem] p-6 border border-black/5 shadow-sm hover:shadow-lg hover:-translate-y-1.5 transition-all duration-300 group`}>
                <div className="rounded-2xl overflow-hidden bg-[#F3F4F6] border border-black/5 mb-6">
                  <div className="transform group-hover:scale-[1.03] transition-transform duration-500 origin-top">
                    <img src={item.src} alt={item.title} className="w-full h-auto object-cover object-top aspect-[16/9]" />
                  </div>
                </div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-orange mb-1.5">{item.label}</p>
                <h3 className="text-xl font-bold text-charcoal mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{item.title}</h3>
                <p className="text-sm text-charcoal/60 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-white border-t border-black/5 py-8">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/chalkAiLogo.png" alt="ChalkAI" className="h-5 w-auto opacity-40" />
            <span className="font-mono text-xs text-charcoal/40">ChalkAI</span>
          </div>
          <span className="text-xs text-charcoal/35">Built for educators, by developers who care about education.</span>
        </div>
      </footer>

    </div>
  )
}

export default Home
