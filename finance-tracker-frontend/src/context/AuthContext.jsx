import React, { createContext, useContext, useState, useCallback } from 'react'
import { loginUser, registerUser, logoutUser } from '../api/authApi'
import toast from 'react-hot-toast'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })

  const [loading, setLoading] = useState(false)

  const login = useCallback(async (credentials) => {
    setLoading(true)
    try {
      const res = await loginUser(credentials)
      const { accessToken, refreshToken, email, fullName, role } = res.data.data
      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('refreshToken', refreshToken)
      const userData = { email, fullName, role }
      localStorage.setItem('user', JSON.stringify(userData))
      setUser(userData)
      toast.success(`Welcome back, ${fullName}!`)
      return true
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check your credentials.'
      toast.error(msg)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  const register = useCallback(async (data) => {
    setLoading(true)
    try {
      const res = await registerUser(data)
      const { accessToken, refreshToken, email, fullName, role } = res.data.data
      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('refreshToken', refreshToken)
      const userData = { email, fullName, role }
      localStorage.setItem('user', JSON.stringify(userData))
      setUser(userData)
      toast.success(`Account created! Welcome, ${fullName}!`)
      return true
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.'
      toast.error(msg)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await logoutUser()
    } catch {
      // Proceed with local logout even if API fails
    }
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    setUser(null)
    toast.success('Logged out successfully.')
  }, [])

  const isAuthenticated = !!user

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
