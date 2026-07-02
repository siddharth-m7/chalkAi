import { useState, useEffect, useRef, type ChangeEvent, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import Layout from '../components/Layout'
import api, { getErrorMessage } from '../api/axios'
import { useExport } from '../hooks/useExport'
import ExportPreviewModal from '../components/ExportPreviewModal'
import type { GeneratedContent, LessonPlanOutput, LibraryItem } from '../types'

const SUBJECTS = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'History', 'Geography', 'Computer Science', 'Economics']
const GRADE_LEVELS = ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12']
const DURATIONS = [30, 45, 60, 90]
const POLL_INTERVAL = 2500
const POLL_TIMEOUT = 60000

interface LessonPlanForm {
  subject: string
  gradeLevel: string
  chapter: string
  topic: string
  weekStartDate: string
  numberOfDays: number
  classDuration: number
  learningObjectives: string
  additionalInfo: string
}

const defaultForm: LessonPlanForm = {
  subject: '',
  gradeLevel: '',
  chapter: '',
  topic: '',
  weekStartDate: '',
  numberOfDays: 5,
  classDuration: 45,
  learningObjectives: '',
  additionalInfo: ''
}

const inputCls = 'w-full h-9 px-3 bg-white border border-sand rounded-md text-sm text-charcoal placeholder-charcoal/35 focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta transition-colors'

type Status = 'idle' | 'queued' | 'completed' | 'failed'
type Phase = 'landing' | 'form' | 'result'
type LessonPlanContent = GeneratedContent<LessonPlanOutput>

// ── Recent lesson plan card (landing page) ──────────────────────────────────
const RecentLessonPlanCard = ({ item }: { item: LibraryItem }) => {
  const populated = typeof item.contentId === 'object' ? item.contentId : null
  const contentId = populated?._id ?? (typeof item.contentId === 'string' ? item.contentId : undefined)
  const output = (populated?.output ?? {}) as LessonPlanOutput
  const title = output.title || 'Untitled'
  const { exportAs, exporting, preview, closePreview, downloadFromPreview } = useExport(contentId, title)

  const date = new Date(item.createdAt).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  })
  const tags = [output.subject, output.gradeLevel, output.numberOfDays ? `${output.numberOfDays} days` : null].filter(Boolean)

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
        <button onClick={() => exportAs('pdf')} disabled={!!exporting}
          className="flex-1 py-1.5 text-xs font-medium border border-sand rounded-md hover:bg-sand/60 text-charcoal/80 transition-colors disabled:opacity-50">
          {exporting === 'pdf' ? '...' : 'PDF'}
        </button>
        <button onClick={() => exportAs('docx')} disabled={!!exporting}
          className="flex-1 py-1.5 text-xs font-medium border border-sand rounded-md hover:bg-sand/60 text-charcoal/80 transition-colors disabled:opacity-50">
          {exporting === 'docx' ? '...' : 'Word'}
        </button>
      </div>
    </div>
  )
}

// ── Main page ────────────────────────────────────────────────────────────────
const LessonPlanGenerator = () => {
  const navigate = useNavigate()
  const [phase, setPhase] = useState<Phase>('landing')
  const [form, setForm] = useState<LessonPlanForm>(defaultForm)
  const [status, setStatus] = useState<Status>('idle')
  const [jobId, setJobId] = useState<string | null>(null)
  const [result, setResult] = useState<LessonPlanContent | null>(null)
  const [error, setError] = useState('')
  const [recent, setRecent] = useState<LibraryItem[]>([])
  const [loadingRecent, setLoadingRecent] = useState(true)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    api.get('/library')
      .then(res => {
        const items = ((res.data.data || []) as LibraryItem[])
          .filter(i => i.itemType === 'lessonPlan')
          .slice(0, 4)
        setRecent(items)
      })
      .catch(() => {})
      .finally(() => setLoadingRecent(false))
  }, [])

  useEffect(() => {
    if (status !== 'queued' || !jobId) return

    timeoutRef.current = setTimeout(() => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      setError('Generation timed out. The AI took too long to respond. Please try again.')
      setStatus('failed')
    }, POLL_TIMEOUT)

    intervalRef.current = setInterval(async () => {
      try {
        const res = await api.get(`/generate/lesson-plan/status/${jobId}`)
        const { status: jobStatus, data, message } = res.data
        if (jobStatus === 'completed') {
          if (timeoutRef.current) clearTimeout(timeoutRef.current)
          setResult(data)
          setStatus('completed')
          setPhase('result')
        } else if (jobStatus === 'failed') {
          if (timeoutRef.current) clearTimeout(timeoutRef.current)
          setError(message || 'Generation failed. Please try again.')
          setStatus('failed')
        }
      } catch {
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
        setError('Failed to check generation status.')
        setStatus('failed')
      }
    }, POLL_INTERVAL)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [status, jobId])

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm({ ...form, [name]: value })
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setStatus('queued')
    try {
      const res = await api.post('/generate/lesson-plan', {
        ...form,
        numberOfDays: Number(form.numberOfDays),
        classDuration: Number(form.classDuration)
      })
      setJobId(res.data.jobId)
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to start generation.'))
      setStatus('failed')
    }
  }

  const handleReset = () => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setStatus('idle')
    setJobId(null)
    setResult(null)
    setError('')
    setPhase('form')
  }

  const handleBack = () => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setStatus('idle')
    setJobId(null)
    setResult(null)
    setError('')
    setPhase('landing')
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
                <h1 className="font-serif text-3xl text-charcoal">Lesson Plan Generator</h1>
                <p className="text-sm text-charcoal/75 mt-1">Generate a structured weekly lesson plan with daily breakdowns</p>
              </div>
              <button
                onClick={() => setPhase('form')}
                className="flex items-center gap-2 px-4 h-10 bg-slate text-white text-sm font-medium rounded-lg hover:bg-slate-dark transition-colors shrink-0"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                New Lesson Plan
              </button>
            </div>

            {/* Recent lesson plans */}
            {loadingRecent ? (
              <div>
                <p className="font-mono text-[10px] font-medium uppercase tracking-widest text-charcoal/85 mb-3">Recent</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4 animate-pulse space-y-3">
                      <div className="h-3 bg-sand rounded w-1/4" />
                      <div className="h-4 bg-sand rounded w-3/4" />
                      <div className="h-3 bg-sand rounded w-1/2" />
                    </div>
                  ))}
                </div>
              </div>
            ) : recent.length > 0 ? (
              <div>
                <p className="font-mono text-[10px] font-medium uppercase tracking-widest text-charcoal/85 mb-3">Recent Lesson Plans</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {recent.map(item => (
                    <RecentLessonPlanCard key={item._id} item={item} />
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </Layout>
    )
  }

  // ── Form / Generating / Result ───────────────────────────────────────────
  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        {phase === 'form' && (status === 'idle' || status === 'failed') ? (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 sm:p-8">
            <div className="mb-6 pb-5 border-b border-gray-100 flex items-center gap-3">
              <button
                onClick={handleBack}
                className="flex items-center justify-center w-8 h-8 rounded-lg border border-gray-200 text-charcoal/85 hover:text-charcoal hover:bg-gray-50 transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 5l-7 7 7 7" />
                </svg>
              </button>
              <div>
                <h1 className="font-serif text-2xl text-charcoal">Lesson Plan Generator</h1>
                <p className="text-sm text-charcoal/75">Generate a structured weekly lesson plan with daily breakdowns</p>
              </div>
            </div>
            {error && (
              <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-start justify-between gap-4">
                <span>{error}</span>
                <button onClick={() => setError('')} className="text-red-400 hover:text-red-600 shrink-0 text-lg leading-none">×</button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">

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
                    placeholder="e.g. Chapter 5 – Thermodynamics" className={inputCls} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    Topic <span className="text-stone-600 font-normal">(optional)</span>
                  </label>
                  <input type="text" name="topic" value={form.topic} onChange={handleChange}
                    placeholder="e.g. Laws of Thermodynamics" className={inputCls} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    Week Starting <span className="text-stone-600 font-normal">(optional)</span>
                  </label>
                  <input type="date" name="weekStartDate" value={form.weekStartDate} onChange={handleChange} className={inputCls} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-1">Number of Days</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((d) => (
                      <button key={d} type="button" onClick={() => setForm({ ...form, numberOfDays: d })}
                        className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-colors ${
                          form.numberOfDays === d ? 'bg-charcoal text-offwhite border-charcoal' : 'bg-white text-charcoal/80 border-sand hover:border-charcoal/30'
                        }`}>{d}</button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">Class Duration</label>
                <div className="flex flex-wrap gap-2">
                  {DURATIONS.map((d) => (
                    <button key={d} type="button" onClick={() => setForm({ ...form, classDuration: d })}
                      className={`px-4 py-2 rounded-lg text-xs font-medium border transition-colors ${
                        form.classDuration === d ? 'bg-charcoal text-offwhite border-charcoal' : 'bg-white text-charcoal/80 border-sand hover:border-charcoal/30'
                      }`}>{d} min</button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Learning Objectives <span className="text-stone-600 font-normal">(optional)</span>
                </label>
                <textarea name="learningObjectives" value={form.learningObjectives} onChange={handleChange}
                  rows={2} placeholder="e.g. Students should be able to explain the first law of thermodynamics..."
                  className={inputCls + ' resize-none'} />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Additional Instructions <span className="text-stone-600 font-normal">(optional)</span>
                </label>
                <textarea name="additionalInfo" value={form.additionalInfo} onChange={handleChange}
                  rows={2} placeholder="e.g. Include group activities, focus on practical examples..."
                  className={inputCls + ' resize-none'} />
              </div>

              <button type="submit"
                className="w-full py-3 bg-slate text-white text-sm font-medium rounded-lg hover:bg-slate-dark transition-colors">
                Generate Lesson Plan
              </button>
            </form>
          </div>
        ) : status === 'queued' ? (
          <GeneratingState />
        ) : (
          <div>
            <div className="mb-4 flex items-center gap-3">
              <button
                onClick={handleBack}
                className="flex items-center justify-center w-8 h-8 rounded-lg border border-gray-200 text-charcoal/85 hover:text-charcoal hover:bg-gray-50 transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 5l-7 7 7 7" />
                </svg>
              </button>
              <span className="text-sm text-charcoal/75">Back to lesson plans</span>
            </div>
            {result && <LessonPlanPreview content={result} onRegenerate={handleReset} />}
          </div>
        )}
      </div>
    </Layout>
  )
}

const GeneratingState = () => (
  <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-12 sm:p-16 flex flex-col items-center justify-center text-center">
    <div className="w-12 h-12 border-4 border-sand border-t-terracotta rounded-full animate-spin mb-6" />
    <h2 className="text-base font-semibold text-black mb-2">Generating your lesson plan...</h2>
    <p className="text-sm text-stone-600 max-w-xs">
      This usually takes 15–30 seconds. The AI is building your full weekly plan.
    </p>
  </div>
)

const LessonPlanPreview = ({ content, onRegenerate }: { content: LessonPlanContent; onRegenerate: () => void }) => {
  const { output } = content
  const dayCount = output.days?.length || 0
  const [openDays, setOpenDays] = useState<Set<number>>(() => new Set(Array.from({ length: dayCount }, (_, i) => i)))
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const { exportAs, exporting, preview, closePreview, downloadFromPreview } = useExport(content._id, output.title)

  const allOpen = openDays.size === dayCount

  const toggleAll = () => {
    if (allOpen) setOpenDays(new Set())
    else setOpenDays(new Set(Array.from({ length: dayCount }, (_, i) => i)))
  }

  const toggleDay = (i: number) => {
    const next = new Set(openDays)
    if (next.has(i)) next.delete(i)
    else next.add(i)
    setOpenDays(next)
  }

  const handlePrint = () => {
    setOpenDays(new Set(Array.from({ length: dayCount }, (_, i) => i)))
    setTimeout(() => window.print(), 150)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.post('/library', { contentId: content._id, title: output.title })
      setSaved(true)
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 409) setSaved(true)
    } finally {
      setSaving(false)
    }
  }

  const tags = [
    output.subject,
    output.gradeLevel,
    `${output.numberOfDays} days`,
    output.classDuration,
    output.weekStartDate ? `Week of ${output.weekStartDate}` : null
  ].filter(Boolean)

  return (
    <div className="space-y-4">
      <ExportPreviewModal preview={preview} onClose={closePreview} onDownload={downloadFromPreview} />

      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 print:border-0 print:p-0">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-black">{output.title}</h2>
            <div className="flex flex-wrap gap-2 mt-3">
              {tags.map((tag) => (
                <span key={tag} className="px-2.5 py-1 bg-stone-100 text-stone-600 text-xs font-medium rounded-full">{tag}</span>
              ))}
            </div>
            {output.overview && (
              <p className="mt-4 text-sm text-stone-700 leading-relaxed">{output.overview}</p>
            )}
          </div>
          <div className="flex sm:flex-col gap-2 shrink-0 print:hidden">
            <button onClick={onRegenerate}
              className="px-4 py-2 text-xs font-medium bg-slate text-white rounded-lg hover:bg-slate-dark transition-colors">
              Regenerate
            </button>
            <button onClick={() => exportAs('pdf')} disabled={!!exporting}
              className="px-4 py-2 text-xs font-medium border border-stone-200 rounded-lg hover:bg-stone-50 text-stone-600 transition-colors disabled:opacity-50">
              {exporting === 'pdf' ? 'Exporting...' : 'Export as PDF'}
            </button>
            <button onClick={() => exportAs('docx')} disabled={!!exporting}
              className="px-4 py-2 text-xs font-medium border border-stone-200 rounded-lg hover:bg-stone-50 text-stone-600 transition-colors disabled:opacity-50">
              {exporting === 'docx' ? 'Exporting...' : 'Export as Word'}
            </button>
            <button onClick={handlePrint}
              className="px-4 py-2 text-xs font-medium border border-stone-200 rounded-lg hover:bg-stone-50 text-stone-600 transition-colors">
              Print
            </button>
            <button onClick={handleSave} disabled={saving || saved}
              className={`px-4 py-2 text-xs font-medium rounded-lg border transition-colors ${
                saved ? 'border-green-200 bg-green-50 text-green-600' : 'border-stone-200 hover:bg-stone-50 text-stone-600'
              } disabled:cursor-not-allowed`}>
              {saving ? 'Saving...' : saved ? 'Saved' : 'Save'}
            </button>
          </div>
        </div>
      </div>

      {/* Days */}
      <div className="space-y-3">
        <div className="flex justify-end print:hidden">
          <button onClick={toggleAll} className="text-xs text-stone-600 hover:text-black transition-colors font-medium">
            {allOpen ? 'Collapse all' : 'Expand all'}
          </button>
        </div>

        {output.days?.map((day, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-2xl overflow-hidden print:border-0 print:border-b print:rounded-none">
            <button type="button" onClick={() => toggleDay(i)}
              className="w-full flex items-center justify-between px-5 sm:px-6 py-4 text-left hover:bg-stone-50 transition-colors">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-slate text-white text-xs font-bold flex items-center justify-center shrink-0">
                  {day.day}
                </span>
                <div>
                  <p className="text-sm font-semibold text-black">{day.label}</p>
                  <p className="text-xs text-stone-600">{day.topic}</p>
                </div>
              </div>
              <span className="text-stone-700 text-lg leading-none print:hidden">
                {openDays.has(i) ? '−' : '+'}
              </span>
            </button>

            {openDays.has(i) && (
              <div className="px-5 sm:px-6 pb-6 space-y-5 border-t border-stone-100">
                {day.objectives && day.objectives.length > 0 && (
                  <div className="pt-4">
                    <p className="text-xs font-semibold text-stone-600 uppercase tracking-widest mb-2">Objectives</p>
                    <ul className="space-y-1">
                      {day.objectives.map((obj, j) => (
                        <li key={j} className="flex gap-2 text-sm text-stone-700">
                          <span className="text-terracotta mt-0.5 shrink-0">•</span>
                          {obj}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-3">
                  {[
                    { label: 'Warm Up', value: day.warmUp },
                    { label: 'Main Activity', value: day.mainActivity },
                    { label: 'Wrap Up', value: day.wrapUp }
                  ].map(({ label, value }) => value && (
                    <div key={label} className="p-4 bg-stone-50 rounded-xl">
                      <p className="text-xs font-semibold text-stone-600 uppercase tracking-widest mb-1">{label}</p>
                      <p className="text-sm text-stone-700 leading-relaxed">{value}</p>
                    </div>
                  ))}
                </div>

                {day.materials && day.materials.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-stone-600 uppercase tracking-widest mb-2">Materials</p>
                    <div className="flex flex-wrap gap-2">
                      {day.materials.map((m, j) => (
                        <span key={j} className="px-2.5 py-1 bg-stone-100 text-stone-600 text-xs rounded-full">{m}</span>
                      ))}
                    </div>
                  </div>
                )}

                {day.homework && (
                  <div className="p-4 bg-orange-50 border border-orange-100 rounded-xl">
                    <p className="text-xs font-semibold text-stone-600 uppercase tracking-widest mb-1">Homework</p>
                    <p className="text-sm text-stone-700">{day.homework}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default LessonPlanGenerator
