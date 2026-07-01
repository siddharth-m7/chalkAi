import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Layout from '../components/Layout'

const features = [
  {
    label: 'Assignment Generator',
    description: 'Create custom assignments with answer keys',
    icon: '📝',
    to: '/generate/assignment',
  },
  {
    label: 'Lesson Plan',
    description: 'Generate structured weekly lesson plans',
    icon: '📅',
    to: '/generate/lesson-plan',
  },
  {
    label: 'Concept Explainer',
    description: 'Explain any concept in multiple ways',
    icon: '💡',
    to: '/generate/concept',
  },
  {
    label: 'Resource Discovery',
    description: 'Find curated educational resources',
    icon: '🔍',
    to: '/resources',
  },
  {
    label: 'Personal Library',
    description: 'Save and organize your generated content',
    icon: '📚',
    to: '/library',
  },
]

const FeatureCard = ({ feature }) => {
  const isAvailable = !!feature.to

  const inner = (
    <div className={`bg-white border rounded-2xl p-5 h-full transition-all duration-200 ${
      isAvailable
        ? 'border-stone-200 hover:shadow-lg hover:-translate-y-1 cursor-pointer group'
        : 'border-stone-100 opacity-40 cursor-not-allowed'
    }`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-4 ${
        isAvailable
          ? 'bg-black group-hover:bg-[#FF5841] transition-colors'
          : 'bg-stone-100'
      }`}>
        {feature.icon}
      </div>
      <div className="flex items-center gap-2 mb-1">
        <h3 className="text-sm font-semibold text-black">{feature.label}</h3>
        {!isAvailable && (
          <span className="text-xs px-2 py-0.5 bg-stone-100 text-stone-400 rounded-full font-medium">Soon</span>
        )}
      </div>
      <p className="text-xs text-stone-500 leading-relaxed">{feature.description}</p>
    </div>
  )

  if (!isAvailable) return <div>{inner}</div>
  return <Link to={feature.to} className="block">{inner}</Link>
}

const Dashboard = () => {
  const { user } = useAuth()

  return (
    <Layout>
      <div className="max-w-4xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-black">
            Welcome back, {user?.name?.split(' ')[0]}
          </h1>
          <p className="text-stone-500 mt-1 text-sm">What would you like to create today?</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature) => (
            <FeatureCard key={feature.label} feature={feature} />
          ))}
        </div>
      </div>
    </Layout>
  )
}

export default Dashboard
