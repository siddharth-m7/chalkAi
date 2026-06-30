import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const features = [
  { icon: '📝', title: 'Assignment Generator', description: 'Create custom assignments with questions, answer keys, and marking schemes in seconds.' },
  { icon: '❓', title: 'Quiz Builder', description: 'Build quizzes with configurable difficulty, question types, and passing criteria.' },
  { icon: '📅', title: 'Lesson Plan Generator', description: 'Generate structured weekly lesson plans with daily breakdowns and activities.' },
  { icon: '💡', title: 'Concept Explainer', description: 'Explain any concept using multiple methods — analogies, examples, stories, and more.' },
  { icon: '🔍', title: 'Resource Discovery', description: 'Find curated educational resources from YouTube, Khan Academy, and more.' },
  { icon: '📚', title: 'Personal Library', description: 'Save, tag, and organize everything you generate in one place.' }
]

const stats = [
  { value: '6+', label: 'AI-powered tools' },
  { value: '10s', label: 'Average generation time' },
  { value: '100%', label: 'Free to use' },
]

const Home = () => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (user) return <Navigate to="/dashboard" replace />

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-stone-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="text-lg font-bold text-black tracking-tight">
            Chalk<span className="text-[#FF5841]">AI</span>
          </span>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm text-stone-500 hover:text-black font-medium transition-colors">
              Sign in
            </Link>
            <Link
              to="/register"
              className="text-sm px-4 py-2 bg-[#FF5841] text-white rounded-lg font-medium hover:bg-[#e04d38] transition-colors"
            >
              Get started free
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-stone-50 to-white pointer-events-none" />
        <div className="relative max-w-5xl mx-auto px-6 pt-24 pb-20 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-stone-200 rounded-full text-xs font-semibold text-stone-600 mb-8 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF5841]" />
            AI-powered tools for educators
          </div>

          <h1 className="text-5xl sm:text-6xl font-extrabold text-black leading-tight tracking-tight mb-5">
            Save hours of prep work.<br />
            <span className="text-[#FF5841]">
              Let AI do the heavy lifting.
            </span>
          </h1>

          <p className="text-base text-stone-500 max-w-xl mx-auto mb-10 leading-relaxed">
            ChalkAI helps teachers generate assignments, quizzes, lesson plans, and concept explanations
            in seconds — so you can focus on what matters most: your students.
          </p>

          <div className="flex items-center justify-center gap-3 mb-16">
            <Link
              to="/register"
              className="px-6 py-3 bg-[#FF5841] text-white text-sm font-semibold rounded-xl hover:bg-[#e04d38] transition-colors shadow-md"
            >
              Start for free
            </Link>
            <Link
              to="/login"
              className="px-6 py-3 bg-white border border-black/15 text-black text-sm font-semibold rounded-xl hover:bg-stone-50 transition-colors"
            >
              Sign in
            </Link>
          </div>

          {/* Stats */}
          <div className="inline-flex flex-wrap justify-center sm:flex-nowrap items-center sm:divide-x divide-stone-100 bg-white border border-stone-200 rounded-2xl shadow-sm px-2 gap-px sm:gap-0">
            {stats.map((stat) => (
              <div key={stat.label} className="px-6 sm:px-8 py-4 text-center">
                <p className="text-2xl font-bold text-black">{stat.value}</p>
                <p className="text-xs text-stone-400 mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-stone-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-black tracking-tight mb-3">Everything a teacher needs</h2>
            <p className="text-stone-500 max-w-lg mx-auto text-sm leading-relaxed">
              From daily assignments to full lesson plans — generate, preview, and save in one place.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-white border border-stone-200 rounded-2xl p-6 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className="w-11 h-11 rounded-xl bg-black flex items-center justify-center text-xl mb-5">
                  {feature.icon}
                </div>
                <h3 className="text-sm font-semibold text-black mb-1.5">{feature.title}</h3>
                <p className="text-xs text-stone-500 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-black tracking-tight mb-3">How it works</h2>
            <p className="text-stone-500 text-sm max-w-sm mx-auto">Three steps to your next great lesson.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { step: '01', title: 'Fill in the details', desc: 'Select your subject, grade, chapter, and preferences.' },
              { step: '02', title: 'AI generates instantly', desc: 'Our AI builds your content in seconds using the latest models.' },
              { step: '03', title: 'Preview & save', desc: 'Review the output, export as PDF, and save to your library.' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-11 h-11 rounded-2xl bg-[#FF5841] text-white text-sm font-bold flex items-center justify-center mx-auto mb-5">
                  {item.step}
                </div>
                <h3 className="text-sm font-semibold text-black mb-2">{item.title}</h3>
                <p className="text-xs text-stone-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-black">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white tracking-tight mb-4">
            Ready to reclaim your time?
          </h2>
          <p className="text-stone-400 text-sm mb-10 leading-relaxed">
            Join educators saving hours every week with ChalkAI. It&apos;s free, fast, and built for teachers.
          </p>
          <Link
            to="/register"
            className="inline-flex px-7 py-3 bg-[#FF5841] text-white text-sm font-bold rounded-xl hover:bg-[#e04d38] transition-colors shadow-lg"
          >
            Create your free account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-stone-100 py-7 bg-white">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-stone-400">
          <span className="font-bold text-black">Chalk<span className="text-[#FF5841]">AI</span></span>
          <span>Built for educators, by developers who care about education.</span>
        </div>
      </footer>
    </div>
  )
}

export default Home
