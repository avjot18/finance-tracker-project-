import axiosInstance from './axiosInstance'

export const getBudgets = (params) =>
  axiosInstance.get('/api/budgets', { params })

export const getBudgetById = (id) =>
  axiosInstance.get(`/api/budgets/${id}`)

export const createBudget = (data) =>
  axiosInstance.post('/api/budgets', data)

export const updateBudget = (id, data) =>
  axiosInstance.put(`/api/budgets/${id}`, data)

export const deleteBudget = (id) =>
  axiosInstance.delete(`/api/budgets/${id}`)
