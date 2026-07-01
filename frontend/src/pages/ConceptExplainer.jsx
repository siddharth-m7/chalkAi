import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import api from '../api/axios'
import { useExport } from '../hooks/useExport'
import { useLibrary } from '../hooks/useLibrary'
import ExportPreviewModal from '../components/ExportPreviewModal'

const SUBJECTS = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'History', 'Geography', 'Computer Science', 'Economics']
const GRADE_LEVELS = ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12']

const TYPES = [
  { type: 'simple',    label: 'Simple',      icon: '💬' },
  { type: 'analogy',   label: 'Analogy',     icon: '🔗' },
  { type: 'example',   label: 'Real-world',  icon: '🌍' },
  { type: 'story',     label: 'Story',       icon: '📖' },
  { type: 'technical', label: 'Technical',   icon: '⚙️'  },
]

const inputCls = 'w-full h-9 px-3 bg-white border border-sand rounded-md text-sm text-charcoal placeholder-charcoal/35 focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta transition-colors'

const ConceptExplainer = () => {
  const navigate = useNavigate()
  const [form, setForm] = useState({ concept: '', subject: '', gradeLevel: '', additionalContext: '' })
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setResult(null)
    setLoading(true)
    try {
      const res = await api.post('/generate/concept', form)
      setResult(res.data.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Generation failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setResult(null)
    setError('')
  }


  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        {!result ? (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 sm:p-8">
            <div className="mb-6 pb-5 border-b border-gray-100">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-1.5 text-xs text-charcoal/75 hover:text-charcoal transition-colors mb-2 font-medium"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 5l-7 7 7 7" />
                </svg>
                Back
              </button>
              <h1 className="font-serif text-2xl text-charcoal">Concept Explainer</h1>
              <p className="text-sm text-charcoal/75 mt-1">Explain any concept in 5 different ways simultaneously</p>
            </div>
            {error && (
              <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-black mb-1">Concept</label>
                <input
                  type="text"
                  name="concept"
                  value={form.concept}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Photosynthesis, Newton's Third Law, Supply and Demand..."
                  className={inputCls}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    Subject <span className="text-stone-600 font-normal">(optional)</span>
                  </label>
                  <select name="subject" value={form.subject} onChange={handleChange} className={inputCls}>
                    <option value="">Select subject</option>
                    {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    Grade Level <span className="text-stone-600 font-normal">(optional)</span>
                  </label>
                  <select name="gradeLevel" value={form.gradeLevel} onChange={handleChange} className={inputCls}>
                    <option value="">Select grade</option>
                    {GRADE_LEVELS.map((g) => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Additional Context <span className="text-stone-600 font-normal">(optional)</span>
                </label>
                <textarea
                  name="additionalContext"
                  value={form.additionalContext}
                  onChange={handleChange}
                  rows={2}
                  placeholder="e.g. Focus on the role of chlorophyll, relate to plant biology unit..."
                  className={inputCls + ' resize-none'}
                />
              </div>

              {/* Preview of what will be generated */}
              <div className="flex flex-wrap gap-2 pt-1">
                {TYPES.map((t) => (
                  <span key={t.type} className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-full text-xs text-stone-700 font-medium">
                    <span>{t.icon}</span>{t.label}
                  </span>
                ))}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-10 bg-slate text-white text-sm font-medium rounded-md hover:bg-slate-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Generating 5 explanations...' : 'Explain Concept'}
              </button>
            </form>
          </div>
        ) : (
          <div>
            <div className="mb-4 flex items-center gap-3">
              <button
                onClick={handleReset}
                className="flex items-center justify-center w-8 h-8 rounded-lg border border-gray-200 text-charcoal/85 hover:text-charcoal hover:bg-gray-50 transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 5l-7 7 7 7" />
                </svg>
              </button>
              <span className="text-sm text-charcoal/75">New concept</span>
            </div>
            <ConceptResult content={result} onReset={handleReset} />
          </div>
        )}
      </div>
    </Layout>
  )
}

const ConceptResult = ({ content, onReset }) => {
  const { output } = content
  const [activeTab, setActiveTab] = useState(0)
  const { exportAs, exporting, preview, closePreview, downloadFromPreview } = useExport(content._id, output.concept)
  const { saved, saving, toggle } = useLibrary(content._id)

  const explanations = output.explanations || []
  const successful = explanations.filter((e) => e.success)
  const active = explanations[activeTab]

  const tags = [output.concept, output.subject, output.gradeLevel].filter(Boolean)

  return (
    <div className="space-y-4">
      <ExportPreviewModal preview={preview} onClose={closePreview} onDownload={downloadFromPreview} />

      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-black">{output.concept}</h2>
            <div className="flex flex-wrap gap-2 mt-3">
              {tags.map((tag) => (
                <span key={tag} className="px-2.5 py-1 bg-stone-100 text-stone-600 text-xs font-medium rounded-full">{tag}</span>
              ))}
              <span className="px-2.5 py-1 bg-orange-50 text-terracotta text-xs font-medium rounded-full">
                {successful.length}/5 explanations
              </span>
            </div>
          </div>
          <div className="flex gap-2 shrink-0 flex-wrap justify-end">
            <button onClick={toggle} disabled={saving}
              className={`px-4 py-2 text-xs font-medium rounded-lg border transition-colors disabled:opacity-50 ${
                saved
                  ? 'bg-stone-100 border-stone-200 text-stone-600'
                  : 'border-stone-200 text-stone-600 hover:bg-stone-50'
              }`}>
              {saving ? '...' : saved ? '✓ Saved' : 'Save'}
            </button>
            <button onClick={() => exportAs('pdf')} disabled={!!exporting}
              className="px-4 py-2 text-xs font-medium border border-stone-200 rounded-lg hover:bg-stone-50 text-stone-600 transition-colors disabled:opacity-50">
              {exporting === 'pdf' ? 'Exporting...' : 'Export as PDF'}
            </button>
            <button onClick={() => exportAs('docx')} disabled={!!exporting}
              className="px-4 py-2 text-xs font-medium border border-stone-200 rounded-lg hover:bg-stone-50 text-stone-600 transition-colors disabled:opacity-50">
              {exporting === 'docx' ? 'Exporting...' : 'Export as Word'}
            </button>
            <button onClick={onReset}
              className="px-4 py-2 text-xs font-medium bg-slate text-white rounded-lg hover:bg-slate-dark transition-colors">
              New concept
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="flex border-b border-stone-100 overflow-x-auto scrollbar-hide">
          {explanations.map((exp, i) => (
            <button
              key={exp.type}
              onClick={() => setActiveTab(i)}
              className={`flex items-center gap-1.5 px-4 py-3.5 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 ${
                activeTab === i
                  ? 'border-terracotta text-terracotta'
                  : 'border-transparent text-stone-600 hover:text-stone-600'
              } ${!exp.success ? 'opacity-40' : ''}`}
            >
              <span>{exp.icon}</span>
              {exp.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="p-5 sm:p-6">
          {active?.success ? (
            <div>
              <h3 className="text-base font-bold text-black mb-3">{active.title}</h3>
              <p className="text-sm text-stone-600 leading-relaxed mb-5">{active.content}</p>

              {active.keyPoints?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-stone-600 uppercase tracking-widest mb-3">Key Points</p>
                  <ul className="space-y-2">
                    {active.keyPoints.map((point, j) => (
                      <li key={j} className="flex gap-2.5 text-sm text-stone-700">
                        <span className="w-5 h-5 rounded-full bg-slate/10 text-terracotta flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                          {j + 1}
                        </span>
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="py-8 text-center text-stone-600 text-sm">
              This explanation could not be generated. Try refreshing.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ConceptExplainer
