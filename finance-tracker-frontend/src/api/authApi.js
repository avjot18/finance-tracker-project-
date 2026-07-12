import axiosInstance from './axiosInstance'

export const registerUser = (data) => axiosInstance.post('/auth/register', data)

export const loginUser = (data) => axiosInstance.post('/auth/login', data)

export const refreshToken = (token) =>
  axiosInstance.post(`/auth/refresh?refreshToken=${token}`)

export const logoutUser = () => axiosInstance.post('/auth/logout')
