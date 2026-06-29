import { useState } from 'react'
import Layout from '../components/Layout'
import api from '../api/axios'

const SUBJECTS = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'History', 'Geography', 'Computer Science', 'Economics']
const GRADE_LEVELS = ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12']
const QUESTION_TYPES = [
  { value: 'mcq', label: 'Multiple Choice' },
  { value: 'short_answer', label: 'Short Answer' },
  { value: 'long_answer', label: 'Long Answer' },
  { value: 'true_false', label: 'True / False' }
]

const defaultForm = {
  subject: '',
  gradeLevel: '',
  chapter: '',
  topic: '',
  numberOfQuestions: 10,
  difficulty: 'medium',
  questionTypes: ['mcq']
}

const inputCls = 'w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5841]/40 focus:border-[#FF5841]'

const AssignmentGenerator = () => {
  const [form, setForm] = useState(defaultForm)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showAnswers, setShowAnswers] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm({ ...form, [name]: value })
  }

  const toggleQuestionType = (value) => {
    const current = form.questionTypes
    const updated = current.includes(value)
      ? current.filter((t) => t !== value)
      : [...current, value]
    setForm({ ...form, questionTypes: updated })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setResult(null)
    setLoading(true)
    try {
      const res = await api.post('/generate/assignment', {
        ...form,
        numberOfQuestions: Number(form.numberOfQuestions)
      })
      setResult(res.data.data)
      setShowAnswers(false)
    } catch (err) {
      setError(err.response?.data?.message || 'Generation failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleRegenerate = () => {
    setResult(null)
    setError('')
  }

  return (
    <Layout>
      <div className="max-w-3xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-black">Assignment Generator</h1>
          <p className="text-stone-500 mt-1 text-sm">Generate custom assignments with questions and answer keys</p>
        </div>

        {!result ? (
          <div className="bg-white border border-stone-200 rounded-2xl p-8">
            {error && (
              <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-black mb-1">Subject</label>
                  <select
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    required
                    className={inputCls}
                  >
                    <option value="">Select subject</option>
                    {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-1">Grade Level</label>
                  <select
                    name="gradeLevel"
                    value={form.gradeLevel}
                    onChange={handleChange}
                    required
                    className={inputCls}
                  >
                    <option value="">Select grade</option>
                    {GRADE_LEVELS.map((g) => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Chapter <span className="text-stone-400 font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  name="chapter"
                  value={form.chapter}
                  onChange={handleChange}
                  placeholder="e.g. Chapter 3 – Laws of Motion"
                  className={inputCls}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Topic <span className="text-stone-400 font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  name="topic"
                  value={form.topic}
                  onChange={handleChange}
                  placeholder="e.g. Newton's Second Law"
                  className={inputCls}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    Number of Questions — <span className="text-[#FF5841] font-semibold">{form.numberOfQuestions}</span>
                  </label>
                  <input
                    type="range"
                    name="numberOfQuestions"
                    min="1"
                    max="20"
                    value={form.numberOfQuestions}
                    onChange={handleChange}
                    className="w-full accent-[#FF5841]"
                  />
                  <div className="flex justify-between text-xs text-stone-400 mt-1">
                    <span>1</span><span>20</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-1">Difficulty</label>
                  <div className="flex gap-2">
                    {['easy', 'medium', 'hard'].map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setForm({ ...form, difficulty: d })}
                        className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-colors capitalize ${
                          form.difficulty === d
                            ? 'bg-black text-white border-black'
                            : 'bg-white text-stone-600 border-stone-200 hover:border-black'
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">Question Types</label>
                <div className="flex flex-wrap gap-2">
                  {QUESTION_TYPES.map((qt) => (
                    <button
                      key={qt.value}
                      type="button"
                      onClick={() => toggleQuestionType(qt.value)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                        form.questionTypes.includes(qt.value)
                          ? 'bg-[#FF5841] text-white border-[#FF5841]'
                          : 'bg-white text-stone-600 border-stone-200 hover:border-black'
                      }`}
                    >
                      {qt.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || form.questionTypes.length === 0}
                className="w-full py-3 bg-[#FF5841] text-white text-sm font-medium rounded-lg hover:bg-[#e04d38] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Generating...' : 'Generate Assignment'}
              </button>
            </form>
          </div>
        ) : (
          <AssignmentPreview
            content={result}
            showAnswers={showAnswers}
            onToggleAnswers={() => setShowAnswers(!showAnswers)}
            onRegenerate={handleRegenerate}
          />
        )}
      </div>
    </Layout>
  )
}

const AssignmentPreview = ({ content, showAnswers, onToggleAnswers, onRegenerate }) => {
  const { output } = content

  return (
    <div className="space-y-4">
      <div className="bg-white border border-stone-200 rounded-2xl p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-black">{output.title}</h2>
            <div className="flex flex-wrap gap-2 mt-3">
              {[output.subject, output.gradeLevel, `${output.totalMarks} marks`, output.estimatedTime].map((tag) => (
                <span key={tag} className="px-2.5 py-1 bg-stone-100 text-stone-600 text-xs font-medium rounded-full">{tag}</span>
              ))}
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={onToggleAnswers}
              className="px-4 py-2 text-xs font-medium border border-stone-200 rounded-lg hover:bg-stone-50 text-stone-600 transition-colors"
            >
              {showAnswers ? 'Hide Answers' : 'Show Answers'}
            </button>
            <button
              onClick={onRegenerate}
              className="px-4 py-2 text-xs font-medium bg-[#FF5841] text-white rounded-lg hover:bg-[#e04d38] transition-colors"
            >
              Regenerate
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white border border-stone-200 rounded-2xl p-6 space-y-6">
        <h3 className="text-xs font-semibold text-stone-400 uppercase tracking-widest">Questions</h3>
        {output.questions?.map((q, i) => (
          <div key={q.id} className="pb-6 border-b border-stone-100 last:border-0 last:pb-0">
            <div className="flex items-start gap-3">
              <span className="text-sm font-bold text-[#FF5841] mt-0.5 shrink-0">{i + 1}.</span>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm text-black">{q.question}</p>
                  <span className="shrink-0 text-xs text-stone-400">[{q.marks} mark{q.marks > 1 ? 's' : ''}]</span>
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
                    <p className="text-sm font-medium text-black">Answer: <span className="text-[#FF5841]">{q.answer}</span></p>
                    {q.explanation && (
                      <p className="text-xs text-stone-500 mt-1">{q.explanation}</p>
                    )}
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
