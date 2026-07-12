import axiosInstance from './axiosInstance'

export const getTransactions = (params) =>
  axiosInstance.get('/api/transactions', { params })

export const getTransactionById = (id) =>
  axiosInstance.get(`/api/transactions/${id}`)

export const createTransaction = (data) =>
  axiosInstance.post('/api/transactions', data)

export const updateTransaction = (id, data) =>
  axiosInstance.put(`/api/transactions/${id}`, data)

export const deleteTransaction = (id) =>
  axiosInstance.delete(`/api/transactions/${id}`)

export const getTransactionSummary = () =>
  axiosInstance.get('/api/transactions/summary')
