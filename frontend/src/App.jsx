import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Loader from './components/Loader'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import AssignmentGenerator from './pages/AssignmentGenerator'
import Home from './pages/Home'

const AppRoutes = () => {
  const { loading } = useAuth()

  return (
    <>
      <Loader authLoading={loading} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/generate/assignment"
          element={
            <ProtectedRoute>
              <AssignmentGenerator />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
