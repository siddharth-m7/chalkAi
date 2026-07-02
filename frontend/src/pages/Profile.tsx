import { useState, type ChangeEvent, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import Layout from '../components/Layout'
import api from '../api/axios'
import { getErrorMessage } from '../api/axios'

const SUBJECTS = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'History', 'Geography', 'Computer Science', 'Economics', 'Other']
const GRADE_LEVELS = ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12']

const inputCls = 'w-full h-10 px-3 bg-white border border-sand rounded-md text-sm text-charcoal placeholder-charcoal/35 focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta transition-colors'

type MultiField = 'subjects' | 'gradeLevels'

interface ProfileForm {
  name: string
  profile: {
    school: string
    subjects: string[]
    gradeLevels: string[]
    bio: string
  }
}

const Profile = () => {
  const navigate = useNavigate()
  const { user, updateUser } = useAuth()
  const [form, setForm] = useState<ProfileForm>({
    name: user?.name || '',
    profile: {
      school:      user?.profile?.school      || '',
      subjects:    user?.profile?.subjects    || [],
      gradeLevels: user?.profile?.gradeLevels || [],
      bio:         user?.profile?.bio         || '',
    },
  })
  const [success, setSuccess] = useState(false)
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    if (name === 'name') {
      setForm({ ...form, name: value })
    } else {
      setForm({ ...form, profile: { ...form.profile, [name]: value } })
    }
  }

  const toggleMulti = (field: MultiField, value: string) => {
    const current = form.profile[field]
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value]
    setForm({ ...form, profile: { ...form.profile, [field]: updated } })
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setLoading(true)
    try {
      const res = await api.put('/users/profile', form)
      updateUser(res.data.user)
      setSuccess(true)
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to update profile'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-xs text-charcoal/75 hover:text-charcoal transition-colors mb-3 font-medium"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            Back
          </button>
          <p className="font-mono text-[10px] font-medium uppercase tracking-widest text-charcoal/85 mb-1.5">
            Settings
          </p>
          <h1 className="font-serif text-3xl text-charcoal">Profile</h1>
          <p className="text-sm text-charcoal/75 mt-1">This information helps personalize your content</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm divide-y divide-gray-100">

            {/* Alerts */}
            {(success || error) && (
              <div className="px-6 pt-5">
                {success && (
                  <div className="px-4 py-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-md mb-0">
                    Profile updated successfully
                  </div>
                )}
                {error && (
                  <div className="px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-md">
                    {error}
                  </div>
                )}
              </div>
            )}

            {/* Name */}
            <div className="px-6 py-5">
              <label className="block text-sm font-medium text-charcoal/85 mb-1.5">Full name</label>
              <input type="text" name="name" value={form.name} onChange={handleChange}
                required className={inputCls} />
            </div>

            {/* School */}
            <div className="px-6 py-5">
              <label className="block text-sm font-medium text-charcoal/85 mb-1.5">School / Institution</label>
              <input type="text" name="school" value={form.profile.school} onChange={handleChange}
                placeholder="e.g. Delhi Public School" className={inputCls} />
            </div>

            {/* Subjects */}
            <div className="px-6 py-5">
              <label className="block text-sm font-medium text-charcoal/85 mb-3">Subjects you teach</label>
              <div className="flex flex-wrap gap-2">
                {SUBJECTS.map((subject) => (
                  <button key={subject} type="button" onClick={() => toggleMulti('subjects', subject)}
                    className={`px-3 h-7 rounded-md text-xs font-medium border transition-colors ${
                      form.profile.subjects.includes(subject)
                        ? 'bg-slate text-white border-slate'
                        : 'bg-white text-charcoal/80 border-sand hover:border-charcoal/30'
                    }`}>
                    {subject}
                  </button>
                ))}
              </div>
            </div>

            {/* Grade levels */}
            <div className="px-6 py-5">
              <label className="block text-sm font-medium text-charcoal/85 mb-3">Grade levels you teach</label>
              <div className="flex flex-wrap gap-2">
                {GRADE_LEVELS.map((grade) => (
                  <button key={grade} type="button" onClick={() => toggleMulti('gradeLevels', grade)}
                    className={`px-3 h-7 rounded-md text-xs font-medium border transition-colors ${
                      form.profile.gradeLevels.includes(grade)
                        ? 'bg-slate text-white border-slate'
                        : 'bg-white text-charcoal/80 border-sand hover:border-charcoal/30'
                    }`}>
                    {grade}
                  </button>
                ))}
              </div>
            </div>

            {/* Bio */}
            <div className="px-6 py-5">
              <label className="block text-sm font-medium text-charcoal/85 mb-1.5">Bio</label>
              <textarea name="bio" value={form.profile.bio} onChange={handleChange}
                rows={3} placeholder="Tell us a bit about yourself..."
                className={inputCls + ' h-auto py-2.5 resize-none'} />
            </div>

            {/* Save */}
            <div className="px-6 py-4 bg-sand/40 rounded-b-lg flex justify-end">
              <button type="submit" disabled={loading}
                className="h-9 px-5 bg-slate text-white text-sm font-medium rounded-md hover:bg-slate-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                {loading ? 'Saving...' : 'Save changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  )
}

export default Profile
