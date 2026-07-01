import { useState } from 'react'
import { Link, useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Login = () => {
  const { login, user } = useAuth()
  if (user) return <Navigate to="/dashboard" replace />
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(form.email, form.password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleDemo = async () => {
    setError('')
    setLoading(true)
    try {
      await login('demo@chalkai.com', 'demo123456')
      navigate('/dashboard')
    } catch (err) {
      setError('Demo account unavailable. Please create one first.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src="/chalkAiLogo.png" alt="ChalkAI" className="h-10 w-auto mx-auto" />
          <p className="text-stone-500 mt-1 text-sm">AI-powered tools for educators</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-8">
          <h2 className="text-xl font-semibold text-black mb-4">Sign in to your account</h2>

          <button
            onClick={handleDemo}
            disabled={loading}
            className="w-full py-2.5 mb-6 border-2 border-dashed border-[#FF5841]/40 text-[#FF5841] text-sm font-medium rounded-lg hover:bg-orange-50 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            Try demo account
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-stone-100" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 bg-white text-xs text-stone-400">or sign in with your account</span>
            </div>
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-black mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5841]/40 focus:border-[#FF5841]"
                placeholder="you@school.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-1">Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5841]/40 focus:border-[#FF5841]"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-[#FF5841] text-white text-sm font-medium rounded-lg hover:bg-[#e04d38] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-stone-500">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-[#FF5841] font-semibold hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
