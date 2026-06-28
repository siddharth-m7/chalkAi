import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import Layout from '../components/Layout'
import api from '../api/axios'

const SUBJECTS = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'History', 'Geography', 'Computer Science', 'Economics', 'Other']
const GRADE_LEVELS = ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12']

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
      <div className="max-w-2xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Your Profile</h1>
          <p className="text-gray-500 mt-1 text-sm">This helps personalize your AI-generated content</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-8">
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
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* School */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">School / Institution</label>
              <input
                type="text"
                name="school"
                value={form.profile.school}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="e.g. Delhi Public School"
              />
            </div>

            {/* Subjects */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subjects you teach</label>
              <div className="flex flex-wrap gap-2">
                {SUBJECTS.map((subject) => (
                  <button
                    key={subject}
                    type="button"
                    onClick={() => toggleMulti('subjects', subject)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                      form.profile.subjects.includes(subject)
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-gray-600 border-gray-300 hover:border-indigo-400'
                    }`}
                  >
                    {subject}
                  </button>
                ))}
              </div>
            </div>

            {/* Grade Levels */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Grade levels you teach</label>
              <div className="flex flex-wrap gap-2">
                {GRADE_LEVELS.map((grade) => (
                  <button
                    key={grade}
                    type="button"
                    onClick={() => toggleMulti('gradeLevels', grade)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                      form.profile.gradeLevels.includes(grade)
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-gray-600 border-gray-300 hover:border-indigo-400'
                    }`}
                  >
                    {grade}
                  </button>
                ))}
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
              <textarea
                name="bio"
                value={form.profile.bio}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                placeholder="Tell us a bit about yourself..."
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
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
