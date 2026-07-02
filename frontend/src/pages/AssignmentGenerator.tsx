import { useState, useEffect, type ChangeEvent, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import api, { getErrorMessage } from '../api/axios'
import { useExport } from '../hooks/useExport'
import { useLibrary } from '../hooks/useLibrary'
import ExportPreviewModal from '../components/ExportPreviewModal'
import type { AssignmentOutput, GeneratedContent, LibraryItem } from '../types'

const SUBJECTS = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'History', 'Geography', 'Computer Science', 'Economics']
const GRADE_LEVELS = ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12']
const QUESTION_TYPES = [
  { value: 'mcq', label: 'Multiple Choice' },
  { value: 'short_answer', label: 'Short Answer' },
  { value: 'long_answer', label: 'Long Answer' },
  { value: 'true_false', label: 'True / False' },
  { value: 'numerical', label: 'Numerical Problems' },
]

interface QuestionSection {
  type: string
  count: number
  marksPerQuestion: number
}

interface AssignmentForm {
  title: string
  schoolName: string
  subject: string
  gradeLevel: string
  chapter: string
  topic: string
  dueDate: string
  difficulty: string
  questionSections: QuestionSection[]
  additionalInfo: string
}

const defaultForm: AssignmentForm = {
  title: '',
  schoolName: '',
  subject: '',
  gradeLevel: '',
  chapter: '',
  topic: '',
  dueDate: '',
  difficulty: 'medium',
  questionSections: [
    { type: 'mcq', count: 5, marksPerQuestion: 2 },
    { type: 'true_false', count: 5, marksPerQuestion: 2 },
    { type: 'short_answer', count: 5, marksPerQuestion: 3 },
    { type: 'long_answer', count: 3, marksPerQuestion: 5 },
  ],
  additionalInfo: ''
}

const inputCls = 'w-full h-9 px-3 bg-white border border-sand rounded-md text-sm text-charcoal placeholder-charcoal/35 focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta transition-colors'

interface CounterProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
}

const Counter = ({ value, onChange, min = 1, max = 20 }: CounterProps) => (
  <div className="flex items-center border border-stone-200 rounded-lg overflow-hidden">
    <button type="button" onClick={() => onChange(Math.max(min, value - 1))}
      className="w-8 h-8 flex items-center justify-center text-stone-600 hover:bg-stone-50 transition-colors text-base leading-none">−</button>
    <span className="w-8 text-center text-sm font-semibold text-black">{value}</span>
    <button type="button" onClick={() => onChange(Math.min(max, value + 1))}
      className="w-8 h-8 flex items-center justify-center text-stone-600 hover:bg-stone-50 transition-colors text-base leading-none">+</button>
  </div>
)

// ── Recent assignment card (landing page) ───────────────────────────────────
const RecentAssignmentCard = ({ item }: { item: LibraryItem }) => {
  const populated = typeof item.contentId === 'object' ? item.contentId : null
  const contentId = populated?._id ?? (typeof item.contentId === 'string' ? item.contentId : undefined)
  const output = (populated?.output ?? {}) as AssignmentOutput
  const title = output.title || 'Untitled'
  const { exportAs, exporting, preview, closePreview, downloadFromPreview } = useExport(contentId, title)

  const date = new Date(item.createdAt).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  })
  const tags = [output.subject, output.gradeLevel, output.difficulty].filter(Boolean)

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4 flex flex-col gap-3">
      <ExportPreviewModal preview={preview} onClose={closePreview} onDownload={downloadFromPreview} />
      <div>
        <p className="text-xs text-charcoal/80 mb-1">{date}</p>
        <h3 className="text-sm font-semibold text-charcoal leading-snug line-clamp-2">{title}</h3>
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map(tag => (
            <span key={tag} className="px-2 py-0.5 bg-sand text-charcoal/80 text-xs rounded-full capitalize">{tag}</span>
          ))}
        </div>
      )}
      <div className="flex gap-1.5 pt-2 border-t border-stone-100 mt-auto">
        <button onClick={() => exportAs('pdf', false)} disabled={!!exporting}
          className="flex-1 py-1.5 text-xs font-medium border border-sand rounded-md hover:bg-sand/60 text-charcoal/80 transition-colors disabled:opacity-50">
          {exporting === 'pdf' ? '...' : 'PDF'}
        </button>
        <button onClick={() => exportAs('pdf', true)} disabled={!!exporting}
          className="flex-1 py-1.5 text-xs font-medium border border-slate/30 rounded-md hover:bg-slate/10 text-slate transition-colors disabled:opacity-50">
          PDF + Ans
        </button>
        <button onClick={() => exportAs('docx', false)} disabled={!!exporting}
          className="flex-1 py-1.5 text-xs font-medium border border-sand rounded-md hover:bg-sand/60 text-charcoal/80 transition-colors disabled:opacity-50">
          {exporting === 'docx' ? '...' : 'Word'}
        </button>
      </div>
    </div>
  )
}

type Phase = 'landing' | 'form' | 'result'
type AssignmentContent = GeneratedContent<AssignmentOutput>

// ── Main page ────────────────────────────────────────────────────────────────
const AssignmentGenerator = () => {
  const navigate = useNavigate()
  const [phase, setPhase] = useState<Phase>('landing')
  const [form, setForm] = useState<AssignmentForm>(defaultForm)
  const [result, setResult] = useState<AssignmentContent | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showAnswers, setShowAnswers] = useState(false)
  const [recent, setRecent] = useState<LibraryItem[]>([])
  const [loadingRecent, setLoadingRecent] = useState(true)

  useEffect(() => {
    api.get('/library')
      .then(res => {
        const items = ((res.data.data || []) as LibraryItem[])
          .filter(i => i.itemType === 'assignment')
          .slice(0, 4)
        setRecent(items)
      })
      .catch(() => {})
      .finally(() => setLoadingRecent(false))
  }, [])

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm({ ...form, [name]: value })
  }

  const addSection = () => {
    setForm({ ...form, questionSections: [...form.questionSections, { type: 'short_answer', count: 3, marksPerQuestion: 2 }] })
  }

  const removeSection = (index: number) => {
    setForm({ ...form, questionSections: form.questionSections.filter((_, i) => i !== index) })
  }

  const updateSection = (index: number, field: keyof QuestionSection, value: string | number) => {
    const updated = form.questionSections.map((s, i) => i === index ? { ...s, [field]: value } : s) as QuestionSection[]
    setForm({ ...form, questionSections: updated })
  }

  const totalQuestions = form.questionSections.reduce((sum, s) => sum + s.count, 0)
  const totalMarks = form.questionSections.reduce((sum, s) => sum + s.count * s.marksPerQuestion, 0)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setResult(null)
    setLoading(true)
    try {
      const res = await api.post('/generate/assignment', form)
      setResult(res.data.data)
      setShowAnswers(false)
      setPhase('result')
    } catch (err) {
      setError(getErrorMessage(err, 'Generation failed. Please try again.'))
    } finally {
      setLoading(false)
    }
  }

  const handleRegenerate = () => {
    setResult(null)
    setError('')
    setPhase('form')
  }


  // ── Landing ──────────────────────────────────────────────────────────────
  if (phase === 'landing') {
    return (
      <Layout>
        <div className="max-w-3xl mx-auto">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 sm:p-8">
            <div className="mb-8 flex items-start justify-between gap-4">
              <div>
                <button
                  onClick={() => navigate(-1)}
                  className="flex items-center gap-1.5 text-xs text-charcoal/75 hover:text-charcoal transition-colors mb-2 font-medium"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 12H5M12 5l-7 7 7 7" />
                  </svg>
                  Back
                </button>
                <h1 className="font-serif text-3xl text-charcoal">Assignment Generator</h1>
                <p className="text-sm text-charcoal/75 mt-1">Generate custom assignments with questions and answer keys</p>
              </div>
              <button
                onClick={() => setPhase('form')}
                className="flex items-center gap-2 px-4 h-10 bg-slate text-white text-sm font-medium rounded-lg hover:bg-slate-dark transition-colors shrink-0"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                New Assignment
              </button>
            </div>

            {/* Recent assignments */}
            {loadingRecent ? (
              <div>
                <p className="font-mono text-[10px] font-medium uppercase tracking-widest text-charcoal/85 mb-3">Recent</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="bg-gray-50 border border-gray-200 rounded-xl p-4 animate-pulse space-y-3">
                      <div className="h-3 bg-gray-200 rounded w-1/4" />
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-3 bg-gray-200 rounded w-1/2" />
                    </div>
                  ))}
                </div>
              </div>
            ) : recent.length > 0 ? (
              <div>
                <p className="font-mono text-[10px] font-medium uppercase tracking-widest text-charcoal/85 mb-3">Recent Assignments</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {recent.map(item => (
                    <RecentAssignmentCard key={item._id} item={item} />
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </Layout>
    )
  }

  // ── Form / Result ────────────────────────────────────────────────────────
  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        {phase === 'form' ? (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 sm:p-8">
            <div className="mb-6 pb-5 border-b border-gray-100 flex items-center gap-3">
              <button
                onClick={() => { setPhase('landing'); setResult(null); setError('') }}
                className="flex items-center justify-center w-8 h-8 rounded-lg border border-gray-200 text-charcoal/85 hover:text-charcoal hover:bg-gray-50 transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 5l-7 7 7 7" />
                </svg>
              </button>
              <div>
                <h1 className="font-serif text-2xl text-charcoal">Assignment Generator</h1>
                <p className="text-sm text-charcoal/75">Generate custom assignments with questions and answer keys</p>
              </div>
            </div>
            {error && (
              <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-md">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    Assignment Title <span className="text-stone-600 font-normal">(optional)</span>
                  </label>
                  <input type="text" name="title" value={form.title} onChange={handleChange}
                    placeholder="e.g. Chapter 3 Test – Laws of Motion" className={inputCls} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    School Name <span className="text-stone-600 font-normal">(optional)</span>
                  </label>
                  <input type="text" name="schoolName" value={form.schoolName} onChange={handleChange}
                    placeholder="e.g. St. Mary's High School" className={inputCls} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-black mb-1">Subject</label>
                  <select name="subject" value={form.subject} onChange={handleChange} required className={inputCls}>
                    <option value="">Select subject</option>
                    {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-1">Grade Level</label>
                  <select name="gradeLevel" value={form.gradeLevel} onChange={handleChange} required className={inputCls}>
                    <option value="">Select grade</option>
                    {GRADE_LEVELS.map((g) => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    Chapter <span className="text-stone-600 font-normal">(optional)</span>
                  </label>
                  <input type="text" name="chapter" value={form.chapter} onChange={handleChange}
                    placeholder="e.g. Chapter 3 – Laws of Motion" className={inputCls} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    Topic <span className="text-stone-600 font-normal">(optional)</span>
                  </label>
                  <input type="text" name="topic" value={form.topic} onChange={handleChange}
                    placeholder="e.g. Newton's Second Law" className={inputCls} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    Due Date <span className="text-stone-600 font-normal">(optional)</span>
                  </label>
                  <input type="date" name="dueDate" value={form.dueDate} onChange={handleChange} className={inputCls} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-1">Difficulty</label>
                  <div className="flex gap-2">
                    {['easy', 'medium', 'hard'].map((d) => (
                      <button key={d} type="button" onClick={() => setForm({ ...form, difficulty: d })}
                        className={`flex-1 py-2 rounded-md text-xs font-medium border transition-colors capitalize ${
                          form.difficulty === d ? 'bg-charcoal text-offwhite border-charcoal' : 'bg-white text-charcoal/80 border-sand hover:border-charcoal/30'
                        }`}>
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Question Sections */}
              <div>
                <label className="block text-sm font-medium text-black mb-3">Question Sections</label>
                <div className="space-y-3">

                  {/* Desktop header */}
                  <div className="hidden sm:grid sm:grid-cols-[1fr_auto_auto] sm:gap-3 sm:items-center sm:px-1">
                    <span className="text-xs text-stone-600 font-medium">Question Type</span>
                    <span className="text-xs text-stone-600 font-medium w-28 text-center">No. of Questions</span>
                    <span className="text-xs text-stone-600 font-medium w-28 text-center">Marks Each</span>
                  </div>

                  {form.questionSections.map((section, index) => (
                    <div key={index} className="space-y-2 sm:space-y-0 sm:grid sm:grid-cols-[1fr_auto_auto_auto] sm:gap-3 sm:items-center">
                      <select value={section.type} onChange={(e) => updateSection(index, 'type', e.target.value)} className={inputCls}>
                        {QUESTION_TYPES.map((qt) => <option key={qt.value} value={qt.value}>{qt.label}</option>)}
                      </select>

                      {/* Mobile: counters in a row with labels */}
                      <div className="flex items-center gap-3 sm:contents">
                        <div className="flex items-center gap-2 flex-1 sm:flex-none sm:w-28 sm:justify-center">
                          <span className="text-xs text-stone-600 sm:hidden">Qs</span>
                          <Counter value={section.count} onChange={(v) => updateSection(index, 'count', v)} />
                        </div>
                        <div className="flex items-center gap-2 flex-1 sm:flex-none sm:w-28 sm:justify-center">
                          <span className="text-xs text-stone-600 sm:hidden">Marks</span>
                          <Counter value={section.marksPerQuestion} onChange={(v) => updateSection(index, 'marksPerQuestion', v)} />
                        </div>
                        <button type="button" onClick={() => removeSection(index)}
                          disabled={form.questionSections.length === 1}
                          className="text-stone-700 hover:text-red-400 disabled:opacity-0 transition-colors text-xl leading-none w-6 text-center">
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4">
                  <button type="button" onClick={addSection}
                    className="flex items-center gap-1.5 text-sm text-stone-700 hover:text-black transition-colors font-medium">
                    <span className="w-5 h-5 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-xs leading-none transition-colors">+</span>
                    Add question type
                  </button>
                  <div className="flex gap-4 text-sm">
                    <span className="text-stone-700">Questions: <span className="font-semibold text-black">{totalQuestions}</span></span>
                    <span className="text-stone-700">Total Marks: <span className="font-semibold text-terracotta">{totalMarks}</span></span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Additional Instructions <span className="text-stone-600 font-normal">(optional)</span>
                </label>
                <textarea name="additionalInfo" value={form.additionalInfo} onChange={handleChange}
                  rows={3} placeholder="e.g. Make it suitable for a 1-hour exam, focus on application-based questions..."
                  className={inputCls + ' resize-none'} />
              </div>

              <button type="submit" disabled={loading}
                className="w-full h-10 bg-slate text-white text-sm font-medium rounded-md hover:bg-slate-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                {loading ? 'Generating...' : 'Generate Assignment'}
              </button>
            </form>
          </div>
        ) : (
          <div>
            <div className="mb-4 flex items-center gap-3">
              <button
                onClick={() => { setPhase('landing'); setResult(null); setError('') }}
                className="flex items-center justify-center w-8 h-8 rounded-lg border border-gray-200 text-charcoal/85 hover:text-charcoal hover:bg-gray-50 transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 5l-7 7 7 7" />
                </svg>
              </button>
              <span className="text-sm text-charcoal/75">Back to assignments</span>
            </div>
            {result && (
              <AssignmentPreview
                content={result}
                showAnswers={showAnswers}
                onToggleAnswers={() => setShowAnswers(!showAnswers)}
                onRegenerate={handleRegenerate}
              />
            )}
          </div>
        )}
      </div>
    </Layout>
  )
}

interface AssignmentPreviewProps {
  content: AssignmentContent
  showAnswers: boolean
  onToggleAnswers: () => void
  onRegenerate: () => void
}

const AssignmentPreview = ({ content, showAnswers, onToggleAnswers, onRegenerate }: AssignmentPreviewProps) => {
  const { output } = content
  const { exportAs, exporting, preview, closePreview, downloadFromPreview } = useExport(content._id, output.title)
  const { saved, saving, toggle } = useLibrary(content._id)

  const tags = [
    output.subject,
    output.gradeLevel,
    output.difficulty,
    `${output.totalMarks} marks`,
    output.estimatedTime,
    output.dueDate ? `Due: ${output.dueDate}` : null
  ].filter(Boolean)

  return (
    <div className="space-y-4">
      <ExportPreviewModal preview={preview} onClose={closePreview} onDownload={downloadFromPreview} />

      <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6">
        {/* Title + Regenerate */}
        <div className="flex items-start justify-between gap-4 mb-3">
          <h2 className="text-xl font-bold text-black leading-tight">{output.title}</h2>
          <div className="flex gap-2 shrink-0">
            <button onClick={toggle} disabled={saving}
              className={`px-4 py-2 text-xs font-medium rounded-lg border transition-colors disabled:opacity-50 ${
                saved
                  ? 'bg-stone-100 border-stone-200 text-stone-600'
                  : 'border-stone-200 text-stone-600 hover:bg-stone-50'
              }`}>
              {saving ? '...' : saved ? '✓ Saved' : 'Save'}
            </button>
            <button onClick={onRegenerate}
              className="px-4 py-2 text-xs font-medium bg-slate text-white rounded-md hover:bg-slate-dark transition-colors">
              Regenerate
            </button>
          </div>
        </div>

        {/* Tags row */}
        <div className="flex flex-wrap gap-2 mb-4">
          {tags.map((tag) => (
            <span key={tag} className="px-2.5 py-1 bg-stone-100 text-stone-600 text-xs font-medium rounded-full capitalize">{tag}</span>
          ))}
        </div>

        {/* Action bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-4 border-t border-stone-100">
          <button onClick={onToggleAnswers}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
              showAnswers
                ? 'bg-stone-100 border-stone-200 text-stone-700'
                : 'border-stone-200 text-stone-700 hover:bg-stone-50'
            }`}>
            {showAnswers ? '✓ Answers shown' : 'Show Answers'}
          </button>

          <div className="flex flex-wrap gap-2">
            <button onClick={() => exportAs('pdf', false)} disabled={!!exporting}
              className="px-3 py-1.5 text-xs font-medium border border-stone-200 rounded-lg hover:bg-stone-50 text-stone-600 transition-colors disabled:opacity-50 flex items-center gap-1.5">
              <span>↓</span>{exporting === 'pdf' ? 'Loading...' : 'PDF'}
            </button>
            <button onClick={() => exportAs('pdf', true)} disabled={!!exporting}
              className="px-3 py-1.5 text-xs font-medium border border-blue-200 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors disabled:opacity-50 flex items-center gap-1.5">
              <span>↓</span>{exporting === 'pdf' ? 'Loading...' : 'PDF with Answers'}
            </button>
            <button onClick={() => exportAs('docx', false)} disabled={!!exporting}
              className="px-3 py-1.5 text-xs font-medium border border-stone-200 rounded-lg hover:bg-stone-50 text-stone-600 transition-colors disabled:opacity-50 flex items-center gap-1.5">
              <span>↓</span>{exporting === 'docx' ? 'Exporting...' : 'Word'}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white border border-stone-200 rounded-2xl p-5 sm:p-6 space-y-6">
        <h3 className="text-xs font-semibold text-stone-600 uppercase tracking-widest">Questions</h3>
        {output.questions?.map((q, i) => (
          <div key={q.id} className="pb-6 border-b border-stone-100 last:border-0 last:pb-0">
            <div className="flex items-start gap-3">
              <span className="text-sm font-bold text-terracotta mt-0.5 shrink-0">{i + 1}.</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-2 mb-1">
                  <p className="text-sm text-black flex-1">{q.question}</p>
                  <span className="shrink-0 text-xs text-stone-600 mt-0.5">[{q.marks}m]</span>
                </div>
                {q.options && (
                  <ul className="mt-2 space-y-1">
                    {q.options.map((opt, j) => (
                      <li key={j} className="text-sm text-stone-600 flex gap-2">
                        <span className="font-medium">{String.fromCharCode(65 + j)}.</span>
                        <span>{opt}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {showAnswers && (
                  <div className="mt-3 p-3 bg-orange-50 border border-orange-100 rounded-lg">
                    <p className="text-sm font-medium text-black">
                      Answer: <span className="text-terracotta">{q.answer}</span>
                    </p>
                    {q.explanation && <p className="text-xs text-stone-700 mt-1">{q.explanation}</p>}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default AssignmentGenerator
