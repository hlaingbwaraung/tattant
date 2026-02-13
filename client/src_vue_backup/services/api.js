/**
 * Axios API Client
 *
 * Pre-configured axios instance used by every service module.
 *  - Base URL defaults to localhost:5000 (overridable via VITE_API_URL)
 *  - Automatically attaches the JWT token from localStorage
 *  - Redirects to /login on 401 responses (expired / invalid token)
 */

import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' }
})

/* ---------- Request interceptor: attach JWT ---------- */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

/* ---------- Response interceptor: handle 401 ---------- */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/suteki/login'
    }
    return Promise.reject(error)
  }
)

export default api
