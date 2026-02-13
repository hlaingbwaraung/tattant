/**
 * Auth Service
 *
 * API calls related to authentication, profile management,
 * and account operations.
 */

import api from './api'

/* ---------- Authentication ---------- */
export const login       = (credentials) => api.post('/auth/login', credentials)
export const register    = (userData)    => api.post('/auth/register', userData)
export const googleLogin = (credential)  => api.post('/auth/google', { credential })

/* ---------- Email / Password Recovery ---------- */
export const verifyEmail   = (token)              => api.post('/auth/verify-email', { token })
export const forgotPassword = (email)             => api.post('/auth/forgot-password', { email })
export const resetPassword  = (token, newPassword) => api.post('/auth/reset-password', { token, newPassword })

/* ---------- Current User ---------- */
export const getMe         = ()            => api.get('/auth/me')
export const updateProfile = (profileData) => api.put('/auth/profile', profileData)
