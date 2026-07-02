import { useState, type ChangeEvent, type FormEvent } from 'react'
import { Link, useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getErrorMessage } from '../api/axios'

const Register = () => {
  const { register, user } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (user) return <Navigate to="/dashboard" replace />

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register(form.name, form.email, form.password)
      navigate('/dashboard')
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const inputCls = 'w-full h-13 px-4 bg-white border border-gray-200 rounded-2xl text-sm text-charcoal placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-charcoal/10 focus:border-charcoal/30 transition-colors'

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Navbar */}
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center">
          <Link to="/" className="flex items-center gap-2">
            <img src="/chalkAiLogo.png" alt="ChalkAI" className="h-7 w-auto" />
            <span className="text-sm font-bold text-charcoal tracking-tight">
              Chalk<span className="text-orange">AI</span>
            </span>
          </Link>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-sm p-8 sm:p-10">

        {/* Top row: back + logo */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/')}
            className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-charcoal hover:bg-gray-200 transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <img src="/chalkAiLogo.png" alt="ChalkAI" className="h-8 w-auto" />
            <span className="text-base font-bold text-charcoal tracking-tight">
              Chalk<span className="text-terracotta">AI</span>
            </span>
          </div>
          <div className="w-9" />
        </div>

        {/* Heading */}
        <div className="text-center mb-8">
          <h1 className="font-serif text-3xl font-bold text-charcoal mb-2">Create Account</h1>
          <p className="text-sm text-gray-500">Free forever. Start generating in minutes.</p>
        </div>

        {error && (
          <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-charcoal mb-2">Full Name</label>
            <input
              type="text" name="name" value={form.name} onChange={handleChange}
              required placeholder="Enter your name" className={inputCls}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-charcoal mb-2">Email Address</label>
            <input
              type="email" name="email" value={form.email} onChange={handleChange}
              required placeholder="Enter your email" className={inputCls}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-charcoal mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password" value={form.password} onChange={handleChange}
                required minLength={6} placeholder="At least 6 characters"
                className={inputCls + ' pr-11'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button
            type="submit" disabled={loading}
            className="w-full h-13 bg-charcoal text-white text-sm font-semibold rounded-2xl hover:bg-charcoal/85 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mt-2"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-charcoal hover:text-terracotta transition-colors">
            Sign In
          </Link>
        </p>
      </div>
      </div>
    </div>
  )
}

export default Register
