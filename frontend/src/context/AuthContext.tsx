import { useState, useEffect, type ReactNode } from 'react'
import api from '../api/axios'
import type { User } from '../types'
import { AuthContext } from './auth-context'

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      api.get('/auth/me')
        .then((res) => setUser(res.data.user))
        .catch(() => localStorage.removeItem('token'))
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password })
    localStorage.setItem('token', res.data.token)
    setUser(res.data.user)
  }

  const register = async (name: string, email: string, password: string) => {
    const res = await api.post('/auth/register', { name, email, password })
    localStorage.setItem('token', res.data.token)
    setUser(res.data.user)
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  const updateUser = (updated: User) => setUser(updated)

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}
