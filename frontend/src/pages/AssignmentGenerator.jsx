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
          <h1 className="text-2xl font-bold text-gray-900">Assignment Generator</h1>
          <p className="text-gray-500 mt-1 text-sm">Generate custom assignments with questions and answer keys</p>
        </div>

        {!result ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-8">
            {error && (
              <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <select
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select subject</option>
                    {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Grade Level</label>
                  <select
                    name="gradeLevel"
                    value={form.gradeLevel}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select grade</option>
                    {GRADE_LEVELS.map((g) => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Chapter <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  name="chapter"
                  value={form.chapter}
                  onChange={handleChange}
                  placeholder="e.g. Chapter 3 – Laws of Motion"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Topic <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  name="topic"
                  value={form.topic}
                  onChange={handleChange}
                  placeholder="e.g. Newton's Second Law"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Number of Questions — <span className="text-indigo-600">{form.numberOfQuestions}</span>
                  </label>
                  <input
                    type="range"
                    name="numberOfQuestions"
                    min="1"
                    max="20"
                    value={form.numberOfQuestions}
                    onChange={handleChange}
                    className="w-full accent-indigo-600"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>1</span><span>20</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                  <div className="flex gap-2">
                    {['easy', 'medium', 'hard'].map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setForm({ ...form, difficulty: d })}
                        className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-colors capitalize ${
                          form.difficulty === d
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-white text-gray-600 border-gray-300 hover:border-indigo-400'
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Question Types</label>
                <div className="flex flex-wrap gap-2">
                  {QUESTION_TYPES.map((qt) => (
                    <button
                      key={qt.value}
                      type="button"
                      onClick={() => toggleQuestionType(qt.value)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                        form.questionTypes.includes(qt.value)
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-white text-gray-600 border-gray-300 hover:border-indigo-400'
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
                className="w-full py-3 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
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
      {/* Header card */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{output.title}</h2>
            <div className="flex gap-3 mt-2 text-sm text-gray-500">
              <span>{output.subject}</span>
              <span>·</span>
              <span>{output.gradeLevel}</span>
              <span>·</span>
              <span>{output.totalMarks} marks</span>
              <span>·</span>
              <span>{output.estimatedTime}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onToggleAnswers}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {showAnswers ? 'Hide Answers' : 'Show Answers'}
            </button>
            <button
              onClick={onRegenerate}
              className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Regenerate
            </button>
          </div>
        </div>
      </div>

      {/* Questions */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-6">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Questions</h3>
        {output.questions?.map((q, i) => (
          <div key={q.id} className="pb-6 border-b border-gray-100 last:border-0 last:pb-0">
            <div className="flex items-start gap-3">
              <span className="text-sm font-semibold text-indigo-600 mt-0.5">{i + 1}.</span>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm text-gray-900">{q.question}</p>
                  <span className="shrink-0 text-xs text-gray-400">[{q.marks} mark{q.marks > 1 ? 's' : ''}]</span>
                </div>

                {q.options && (
                  <ul className="mt-2 space-y-1">
                    {q.options.map((opt, j) => (
                      <li key={j} className="text-sm text-gray-600 flex gap-2">
                        <span className="font-medium">{String.fromCharCode(65 + j)}.</span>
                        <span>{opt}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {showAnswers && (
                  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm font-medium text-green-800">Answer: {q.answer}</p>
                    {q.explanation && (
                      <p className="text-xs text-green-700 mt-1">{q.explanation}</p>
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
