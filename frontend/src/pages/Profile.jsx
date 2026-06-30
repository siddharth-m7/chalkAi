import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import Layout from '../components/Layout'
import api from '../api/axios'

const SUBJECTS = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'History', 'Geography', 'Computer Science', 'Economics', 'Other']
const GRADE_LEVELS = ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12']

const inputCls = 'w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5841]/40 focus:border-[#FF5841]'

const Profile = () => {
  const { user, updateUser } = useAuth()
  const [form, setForm] = useState({
    name: user?.name || '',
    profile: {
      school: user?.profile?.school || '',
      subjects: user?.profile?.subjects || [],
      gradeLevels: user?.profile?.gradeLevels || [],
      bio: user?.profile?.bio || '',
    }
  })
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name === 'name') {
      setForm({ ...form, name: value })
    } else {
      setForm({ ...form, profile: { ...form.profile, [name]: value } })
    }
  }

  const toggleMulti = (field, value) => {
    const current = form.profile[field]
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value]
    setForm({ ...form, profile: { ...form.profile, [field]: updated } })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setLoading(true)
    try {
      const res = await api.put('/users/profile', form)
      updateUser(res.data.user)
      setSuccess(true)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div className="max-w-2xl w-full">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-black">Your Profile</h1>
          <p className="text-stone-500 mt-1 text-sm">This helps personalize your AI-generated content</p>
        </div>

        <div className="bg-white border border-stone-200 rounded-2xl p-5 sm:p-8">
          {success && (
            <div className="mb-6 px-4 py-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg">
              Profile updated successfully
            </div>
          )}
          {error && (
            <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-black mb-1">Full name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className={inputCls}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-1">School / Institution</label>
              <input
                type="text"
                name="school"
                value={form.profile.school}
                onChange={handleChange}
                className={inputCls}
                placeholder="e.g. Delhi Public School"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-2">Subjects you teach</label>
              <div className="flex flex-wrap gap-2">
                {SUBJECTS.map((subject) => (
                  <button
                    key={subject}
                    type="button"
                    onClick={() => toggleMulti('subjects', subject)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                      form.profile.subjects.includes(subject)
                        ? 'bg-[#FF5841] text-white border-[#FF5841]'
                        : 'bg-white text-stone-600 border-stone-200 hover:border-black'
                    }`}
                  >
                    {subject}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-2">Grade levels you teach</label>
              <div className="flex flex-wrap gap-2">
                {GRADE_LEVELS.map((grade) => (
                  <button
                    key={grade}
                    type="button"
                    onClick={() => toggleMulti('gradeLevels', grade)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                      form.profile.gradeLevels.includes(grade)
                        ? 'bg-[#FF5841] text-white border-[#FF5841]'
                        : 'bg-white text-stone-600 border-stone-200 hover:border-black'
                    }`}
                  >
                    {grade}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-1">Bio</label>
              <textarea
                name="bio"
                value={form.profile.bio}
                onChange={handleChange}
                rows={3}
                className={inputCls + ' resize-none'}
                placeholder="Tell us a bit about yourself..."
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-[#FF5841] text-white text-sm font-medium rounded-lg hover:bg-[#e04d38] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Saving...' : 'Save changes'}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  )
}

export default Profile
