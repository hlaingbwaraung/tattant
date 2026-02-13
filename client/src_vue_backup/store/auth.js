/**
 * Auth Store (Pinia)
 *
 * Manages the current user session:
 *  - login / register / Google sign-in
 *  - persists token & user object in localStorage
 *  - provides `isAuthenticated` computed getter
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  login as loginService,
  register as registerService,
  googleLogin as googleLoginService
} from '../services/authService'
import router from '../router'

export const useAuthStore = defineStore('auth', () => {
  /* ---------- State ---------- */
  const storedUser = localStorage.getItem('user')
  const user    = ref(storedUser ? JSON.parse(storedUser) : null)
  const token   = ref(localStorage.getItem('token') || null)
  const loading = ref(false)
  const error   = ref(null)

  /* ---------- Getters ---------- */
  const isAuthenticated = computed(() => !!token.value)

  /* ---------- Helpers ---------- */

  /** Persist auth data to both reactive state and localStorage */
  function setAuth(responseData) {
    token.value = responseData.token
    user.value  = responseData.user
    localStorage.setItem('token', responseData.token)
    localStorage.setItem('user', JSON.stringify(responseData.user))
  }

  /* ---------- Actions ---------- */

  /** Email + password login */
  async function login(credentials) {
    try {
      loading.value = true
      error.value   = null
      const response = await loginService(credentials)
      setAuth(response.data)
      return response
    } catch (err) {
      error.value = err.response?.data?.error || 'Login failed'
      throw err
    } finally {
      loading.value = false
    }
  }

  /** Create a new account */
  async function register(userData) {
    try {
      loading.value = true
      error.value   = null
      const response = await registerService(userData)
      setAuth(response.data)
      return response
    } catch (err) {
      error.value = err.response?.data?.error || 'Registration failed'
      throw err
    } finally {
      loading.value = false
    }
  }

  /** Sign in with a Google credential token */
  async function googleLogin(credential) {
    try {
      loading.value = true
      error.value   = null
      const response = await googleLoginService(credential)
      setAuth(response.data)
      return response
    } catch (err) {
      error.value = err.response?.data?.message || 'Google login failed'
      throw err
    } finally {
      loading.value = false
    }
  }

  /** Clear session and redirect to home */
  function logout() {
    user.value  = null
    token.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push({ name: 'Home' })
  }

  /** Re-fetch the current user from the API (rarely used) */
  async function fetchUser() {
    try {
      loading.value = true
      const response = await fetch('/api/v1/auth/me', {
        headers: { Authorization: `Bearer ${token.value}` }
      })
      if (response.ok) {
        const data = await response.json()
        user.value = data.data
      } else {
        logout()
      }
    } catch (err) {
      console.error('Failed to fetch user:', err)
      logout()
    } finally {
      loading.value = false
    }
  }

  return {
    user, token, loading, error,
    isAuthenticated,
    login, register, googleLogin, logout, fetchUser
  }
})
