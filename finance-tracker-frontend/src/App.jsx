import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import TransactionsPage from './pages/TransactionsPage'
import BudgetsPage from './pages/BudgetsPage'
import ReportsPage from './pages/ReportsPage'
import AppLayout from './components/layout/AppLayout'

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuth()
  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />
}

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Navigate to="/dashboard" replace />} />
    <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
    <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
    <Route
      path="/"
      element={<ProtectedRoute><AppLayout /></ProtectedRoute>}
    >
      <Route path="dashboard" element={<DashboardPage />} />
      <Route path="transactions" element={<TransactionsPage />} />
      <Route path="budgets" element={<BudgetsPage />} />
      <Route path="reports" element={<ReportsPage />} />
    </Route>
    <Route path="*" element={<Navigate to="/dashboard" replace />} />
  </Routes>
)

const App = () => (
  <AuthProvider>
    <AppRoutes />
  </AuthProvider>
)

export default App
