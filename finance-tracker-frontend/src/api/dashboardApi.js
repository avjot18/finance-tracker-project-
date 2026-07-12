import axiosInstance from './axiosInstance'

export const getDashboardData = () =>
  axiosInstance.get('/api/dashboard')

export const downloadCsvReport = () =>
  axiosInstance.get('/api/reports/csv', { responseType: 'blob' })

export const downloadPdfReport = () =>
  axiosInstance.get('/api/reports/pdf', { responseType: 'blob' })
