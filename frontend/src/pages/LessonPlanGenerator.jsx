import { useState, useEffect, useRef } from 'react'
import Layout from '../components/Layout'
import api from '../api/axios'
import { useExport } from '../hooks/useExport'
import ExportPreviewModal from '../components/ExportPreviewModal'

const SUBJECTS = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'History', 'Geography', 'Computer Science', 'Economics']
const GRADE_LEVELS = ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12']
const DURATIONS = [30, 45, 60, 90]
const POLL_INTERVAL = 2500
const POLL_TIMEOUT = 60000

const defaultForm = {
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

const inputCls = 'w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5841]/40 focus:border-[#FF5841]'

const LessonPlanGenerator = () => {
  const [form, setForm] = useState(defaultForm)
  const [status, setStatus] = useState('idle')
  const [jobId, setJobId] = useState(null)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const intervalRef = useRef(null)
  const timeoutRef = useRef(null)

  useEffect(() => {
    if (status !== 'queued' || !jobId) return

    timeoutRef.current = setTimeout(() => {
      clearInterval(intervalRef.current)
      setError('Generation timed out. The AI took too long to respond. Please try again.')
      setStatus('failed')
    }, POLL_TIMEOUT)

    intervalRef.current = setInterval(async () => {
      try {
        const res = await api.get(`/generate/lesson-plan/status/${jobId}`)
        const { status: jobStatus, data, message } = res.data
        if (jobStatus === 'completed') {
          clearTimeout(timeoutRef.current)
          setResult(data)
          setStatus('completed')
        } else if (jobStatus === 'failed') {
          clearTimeout(timeoutRef.current)
          setError(message || 'Generation failed. Please try again.')
          setStatus('failed')
        }
      } catch {
        clearTimeout(timeoutRef.current)
        setError('Failed to check generation status.')
        setStatus('failed')
      }
    }, POLL_INTERVAL)

    return () => {
      clearInterval(intervalRef.current)
      clearTimeout(timeoutRef.current)
    }
  }, [status, jobId])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm({ ...form, [name]: value })
  }

  const handleSubmit = async (e) => {
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
      setError(err.response?.data?.message || 'Failed to start generation.')
      setStatus('failed')
    }
  }

  const handleReset = () => {
    clearInterval(intervalRef.current)
    clearTimeout(timeoutRef.current)
    setStatus('idle')
    setJobId(null)
    setResult(null)
    setError('')
  }

  return (
    <Layout>
      <div className="max-w-3xl">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl font-bold text-black">Lesson Plan Generator</h1>
          <p className="text-stone-500 mt-1 text-sm">Generate a structured weekly lesson plan with daily breakdowns</p>
        </div>

        {status === 'idle' || status === 'failed' ? (
          <div className="bg-white border border-stone-200 rounded-2xl p-5 sm:p-8">
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
                    Chapter <span className="text-stone-400 font-normal">(optional)</span>
                  </label>
                  <input type="text" name="chapter" value={form.chapter} onChange={handleChange}
                    placeholder="e.g. Chapter 5 – Thermodynamics" className={inputCls} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    Topic <span className="text-stone-400 font-normal">(optional)</span>
                  </label>
                  <input type="text" name="topic" value={form.topic} onChange={handleChange}
                    placeholder="e.g. Laws of Thermodynamics" className={inputCls} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    Week Starting <span className="text-stone-400 font-normal">(optional)</span>
                  </label>
                  <input type="date" name="weekStartDate" value={form.weekStartDate} onChange={handleChange} className={inputCls} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-1">Number of Days</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((d) => (
                      <button key={d} type="button" onClick={() => setForm({ ...form, numberOfDays: d })}
                        className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-colors ${
                          form.numberOfDays === d ? 'bg-black text-white border-black' : 'bg-white text-stone-600 border-stone-200 hover:border-black'
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
                        form.classDuration === d ? 'bg-black text-white border-black' : 'bg-white text-stone-600 border-stone-200 hover:border-black'
                      }`}>{d} min</button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Learning Objectives <span className="text-stone-400 font-normal">(optional)</span>
                </label>
                <textarea name="learningObjectives" value={form.learningObjectives} onChange={handleChange}
                  rows={2} placeholder="e.g. Students should be able to explain the first law of thermodynamics..."
                  className={inputCls + ' resize-none'} />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Additional Instructions <span className="text-stone-400 font-normal">(optional)</span>
                </label>
                <textarea name="additionalInfo" value={form.additionalInfo} onChange={handleChange}
                  rows={2} placeholder="e.g. Include group activities, focus on practical examples..."
                  className={inputCls + ' resize-none'} />
              </div>

              <button type="submit"
                className="w-full py-3 bg-[#FF5841] text-white text-sm font-medium rounded-lg hover:bg-[#e04d38] transition-colors">
                Generate Lesson Plan
              </button>
            </form>
          </div>
        ) : status === 'queued' ? (
          <GeneratingState />
        ) : (
          <LessonPlanPreview content={result} onRegenerate={handleReset} />
        )}
      </div>
    </Layout>
  )
}

const GeneratingState = () => (
  <div className="bg-white border border-stone-200 rounded-2xl p-12 sm:p-16 flex flex-col items-center justify-center text-center">
    <div className="w-12 h-12 border-4 border-stone-100 border-t-[#FF5841] rounded-full animate-spin mb-6" />
    <h2 className="text-base font-semibold text-black mb-2">Generating your lesson plan...</h2>
    <p className="text-sm text-stone-400 max-w-xs">
      This usually takes 15–30 seconds. The AI is building your full weekly plan.
    </p>
  </div>
)

const LessonPlanPreview = ({ content, onRegenerate }) => {
  const { output } = content
  const dayCount = output.days?.length || 0
  const [openDays, setOpenDays] = useState(() => new Set(Array.from({ length: dayCount }, (_, i) => i)))
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const { exportAs, exporting, preview, closePreview, downloadFromPreview } = useExport(content._id, output.title)

  const allOpen = openDays.size === dayCount

  const toggleAll = () => {
    if (allOpen) setOpenDays(new Set())
    else setOpenDays(new Set(Array.from({ length: dayCount }, (_, i) => i)))
  }

  const toggleDay = (i) => {
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
      if (err.response?.status === 409) setSaved(true)
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
      <div className="bg-white border border-stone-200 rounded-2xl p-5 sm:p-6 print:border-0 print:p-0">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-black">{output.title}</h2>
            <div className="flex flex-wrap gap-2 mt-3">
              {tags.map((tag) => (
                <span key={tag} className="px-2.5 py-1 bg-stone-100 text-stone-600 text-xs font-medium rounded-full">{tag}</span>
              ))}
            </div>
            {output.overview && (
              <p className="mt-4 text-sm text-stone-500 leading-relaxed">{output.overview}</p>
            )}
          </div>
          <div className="flex sm:flex-col gap-2 shrink-0 print:hidden">
            <button onClick={onRegenerate}
              className="px-4 py-2 text-xs font-medium bg-[#FF5841] text-white rounded-lg hover:bg-[#e04d38] transition-colors">
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
          <button onClick={toggleAll} className="text-xs text-stone-400 hover:text-black transition-colors font-medium">
            {allOpen ? 'Collapse all' : 'Expand all'}
          </button>
        </div>

        {output.days?.map((day, i) => (
          <div key={i} className="bg-white border border-stone-200 rounded-2xl overflow-hidden print:border-0 print:border-b print:rounded-none">
            <button type="button" onClick={() => toggleDay(i)}
              className="w-full flex items-center justify-between px-5 sm:px-6 py-4 text-left hover:bg-stone-50 transition-colors">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-[#FF5841] text-white text-xs font-bold flex items-center justify-center shrink-0">
                  {day.day}
                </span>
                <div>
                  <p className="text-sm font-semibold text-black">{day.label}</p>
                  <p className="text-xs text-stone-400">{day.topic}</p>
                </div>
              </div>
              <span className="text-stone-300 text-lg leading-none print:hidden">
                {openDays.has(i) ? '−' : '+'}
              </span>
            </button>

            {openDays.has(i) && (
              <div className="px-5 sm:px-6 pb-6 space-y-5 border-t border-stone-100">
                {day.objectives?.length > 0 && (
                  <div className="pt-4">
                    <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-2">Objectives</p>
                    <ul className="space-y-1">
                      {day.objectives.map((obj, j) => (
                        <li key={j} className="flex gap-2 text-sm text-stone-700">
                          <span className="text-[#FF5841] mt-0.5 shrink-0">•</span>
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
                      <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-1">{label}</p>
                      <p className="text-sm text-stone-700 leading-relaxed">{value}</p>
                    </div>
                  ))}
                </div>

                {day.materials?.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-2">Materials</p>
                    <div className="flex flex-wrap gap-2">
                      {day.materials.map((m, j) => (
                        <span key={j} className="px-2.5 py-1 bg-stone-100 text-stone-600 text-xs rounded-full">{m}</span>
                      ))}
                    </div>
                  </div>
                )}

                {day.homework && (
                  <div className="p-4 bg-orange-50 border border-orange-100 rounded-xl">
                    <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-1">Homework</p>
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
