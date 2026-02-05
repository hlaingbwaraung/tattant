import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login as loginService, register as registerService, googleLogin as googleLoginService } from '../services/authService'
import router from '../router'

export const useAuthStore = defineStore('auth', () => {
  // Initialize from localStorage
  const storedUser = localStorage.getItem('user')
  const user = ref(storedUser ? JSON.parse(storedUser) : null)
  const token = ref(localStorage.getItem('token') || null)
  const loading = ref(false)
  const error = ref(null)

  const isAuthenticated = computed(() => !!token.value)

  async function login(credentials) {
    try {
      loading.value = true
      error.value = null
      const response = await loginService(credentials)

      token.value = response.data.token
      user.value = response.data.user
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))

      return response
    } catch (err) {
      error.value = err.response?.data?.error || 'Login failed'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function register(userData) {
    try {
      loading.value = true
      error.value = null
      const response = await registerService(userData)

      token.value = response.data.token
      user.value = response.data.user
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))

      return response
    } catch (err) {
      error.value = err.response?.data?.error || 'Registration failed'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function googleLogin(googleToken) {
    try {
      loading.value = true
      error.value = null
      const response = await googleLoginService(googleToken)

      token.value = response.data.token
      user.value = response.data.user
      localStorage.setItem('token', response.data.token)

      return response
    } catch (err) {
      error.value = err.response?.data?.error || 'Google login failed'
      throw err
    } finally {
      loading.value = false
    }
  }

  function logout() {
    user.value = null
    token.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push({ name: 'Home' })
  }

  async function fetchUser() {
    try {
      loading.value = true
      const response = await fetch('/api/v1/auth/me', {
        headers: {
          'Authorization': `Bearer ${token.value}`
        }
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
    user,
    token,
    loading,
    error,
    isAuthenticated,
    login,
    register,
    googleLogin,
    logout,
    fetchUser
  }
})
