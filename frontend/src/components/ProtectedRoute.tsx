import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="w-8 h-8 border-4 border-stone-800 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return user ? children : <Navigate to="/login" replace />
}

export default ProtectedRoute
