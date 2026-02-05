import api from './api'

export const login = (credentials) => {
  return api.post('/auth/login', credentials)
}

export const register = (userData) => {
  return api.post('/auth/register', userData)
}

export const googleLogin = (googleToken) => {
  return api.post('/auth/google', { token: googleToken })
}

export const verifyEmail = (token) => {
  return api.post('/auth/verify-email', { token })
}

export const forgotPassword = (email) => {
  return api.post('/auth/forgot-password', { email })
}

export const resetPassword = (token, newPassword) => {
  return api.post('/auth/reset-password', { token, newPassword })
}

export const getMe = () => {
  return api.get('/auth/me')
}

export const updateProfile = (profileData) => {
  return api.put('/auth/profile', profileData)
}
