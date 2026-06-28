import { useAuth } from '../context/AuthContext'
import Layout from '../components/Layout'

const features = [
  { label: 'Assignment Generator', description: 'Create custom assignments with answer keys', icon: '📝', soon: false },
  { label: 'Quiz Builder', description: 'Build quizzes with configurable difficulty', icon: '❓', soon: false },
  { label: 'Lesson Plan', description: 'Generate structured weekly lesson plans', icon: '📅', soon: false },
  { label: 'Concept Explainer', description: 'Explain any concept in multiple ways', icon: '💡', soon: false },
  { label: 'Resource Discovery', description: 'Find curated educational resources', icon: '🔍', soon: true },
  { label: 'Personal Library', description: 'Save and organize your generated content', icon: '📚', soon: true },
]

const Dashboard = () => {
  const { user } = useAuth()

  return (
    <Layout>
      <div className="max-w-4xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.name?.split(' ')[0]}
          </h1>
          <p className="text-gray-500 mt-1 text-sm">What would you like to create today?</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature) => (
            <div
              key={feature.label}
              className={`bg-white border border-gray-200 rounded-xl p-5 transition-shadow ${
                feature.soon ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md cursor-pointer'
              }`}
            >
              <div className="text-2xl mb-3">{feature.icon}</div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-sm font-semibold text-gray-900">{feature.label}</h3>
                {feature.soon && (
                  <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded">Soon</span>
                )}
              </div>
              <p className="text-xs text-gray-500">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  )
}

export default Dashboard
