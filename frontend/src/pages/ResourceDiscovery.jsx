import { useState } from 'react'
import Layout from '../components/Layout'
import api from '../api/axios'

const SUBJECTS = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'History', 'Geography', 'Computer Science', 'Economics']
const GRADE_LEVELS = ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12']

const inputCls = 'w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5841]/40 focus:border-[#FF5841]'

const ResourceCard = ({ resource }) => (
  <a
    href={resource.url}
    target="_blank"
    rel="noopener noreferrer"
    className="bg-white border border-stone-200 rounded-2xl overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex flex-col group"
  >
    {resource.thumbnailUrl && (
      <div className="relative overflow-hidden bg-stone-100 aspect-video">
        <img
          src={resource.thumbnailUrl}
          alt={resource.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center shadow-lg">
            <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
        <div className="absolute top-2 left-2">
          <span className="px-2 py-0.5 bg-red-600 text-white text-[10px] font-semibold rounded-full uppercase tracking-wide">
            YouTube
          </span>
        </div>
      </div>
    )}

    <div className="p-4 flex flex-col flex-1">
      <h3 className="text-sm font-semibold text-black line-clamp-2 mb-1.5 group-hover:text-[#FF5841] transition-colors">
        {resource.title}
      </h3>
      {resource.channelTitle && (
        <p className="text-xs text-stone-400 mb-2">{resource.channelTitle}</p>
      )}
      {resource.description && (
        <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed flex-1">
          {resource.description}
        </p>
      )}
    </div>
  </a>
)

const EmptyState = ({ searched }) => (
  <div className="text-center py-16">
    <div className="w-16 h-16 bg-stone-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">
      {searched ? '🔍' : '📺'}
    </div>
    <p className="text-sm font-medium text-stone-600">
      {searched ? 'No resources found' : 'Search for educational videos'}
    </p>
    <p className="text-xs text-stone-400 mt-1">
      {searched
        ? 'Try different keywords or check your YouTube API key configuration.'
        : 'Enter a topic to find curated YouTube videos for your class.'}
    </p>
  </div>
)

const ResourceDiscovery = () => {
  const [form, setForm] = useState({ query: '', subject: '', gradeLevel: '' })
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searched, setSearched] = useState(false)
  const [source, setSource] = useState('')

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.query.trim()) return
    setError('')
    setLoading(true)
    setSearched(false)

    try {
      const res = await api.post('/resources/youtube', form)
      setResults(res.data.data || [])
      setSource(res.data.source || '')
      setSearched(true)
    } catch (err) {
      setError(err.response?.data?.message || 'Search failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div className="max-w-5xl">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl font-bold text-black">Resource Discovery</h1>
          <p className="text-stone-500 mt-1 text-sm">Find curated YouTube videos for any topic and grade level</p>
        </div>

        {/* Search form */}
        <div className="bg-white border border-stone-200 rounded-2xl p-5 sm:p-6 mb-6">
          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <input
                type="text"
                name="query"
                value={form.query}
                onChange={handleChange}
                required
                placeholder="Topic or keyword  e.g. Photosynthesis, Pythagoras theorem..."
                className={inputCls}
              />
            </div>
            <div className="sm:w-44">
              <select name="subject" value={form.subject} onChange={handleChange} className={inputCls}>
                <option value="">All subjects</option>
                {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="sm:w-40">
              <select name="gradeLevel" value={form.gradeLevel} onChange={handleChange} className={inputCls}>
                <option value="">All grades</option>
                {GRADE_LEVELS.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <button
              type="submit"
              disabled={loading || !form.query.trim()}
              className="px-6 py-2 bg-[#FF5841] text-white text-sm font-medium rounded-lg hover:bg-[#e04d38] disabled:opacity-60 disabled:cursor-not-allowed transition-colors shrink-0"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </form>
        </div>

        {/* Results */}
        {searched && results.length > 0 && (
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-stone-500">
              {results.length} video{results.length !== 1 ? 's' : ''} found
              {source === 'cache' && <span className="ml-2 text-xs text-stone-400">(cached)</span>}
            </p>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white border border-stone-200 rounded-2xl overflow-hidden animate-pulse">
                <div className="aspect-video bg-stone-100" />
                <div className="p-4 space-y-2">
                  <div className="h-3 bg-stone-100 rounded w-3/4" />
                  <div className="h-3 bg-stone-100 rounded w-1/2" />
                  <div className="h-3 bg-stone-100 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : results.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.map((resource) => (
              <ResourceCard key={resource._id || resource.url} resource={resource} />
            ))}
          </div>
        ) : (
          <EmptyState searched={searched} />
        )}
      </div>
    </Layout>
  )
}

export default ResourceDiscovery
