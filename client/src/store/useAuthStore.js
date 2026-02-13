/**
 * Auth Store (Zustand)
 *
 * Manages the current user session:
 *  - login / register / Google sign-in
 *  - persists token & user object in localStorage
 *  - provides `isAuthenticated` computed property
 */

import { create } from 'zustand'
import {
    login as loginService,
    register as registerService,
    googleLogin as googleLoginService
} from '../services/authService'

const useAuthStore = create((set, get) => {
    const storedUser = localStorage.getItem('user')

    return {
        /* ---------- State ---------- */
        user: storedUser ? JSON.parse(storedUser) : null,
        token: localStorage.getItem('token') || null,
        loading: false,
        error: null,

        /* ---------- Getters ---------- */
        get isAuthenticated() {
            return !!get().token
        },

        /* ---------- Actions ---------- */

        /** Email + password login */
        login: async (credentials) => {
            try {
                set({ loading: true, error: null })
                const response = await loginService(credentials)
                const { token, user } = response.data
                localStorage.setItem('token', token)
                localStorage.setItem('user', JSON.stringify(user))
                set({ token, user, loading: false })
                return response
            } catch (err) {
                set({ error: err.response?.data?.error || 'Login failed', loading: false })
                throw err
            }
        },

        /** Create a new account */
        register: async (userData) => {
            try {
                set({ loading: true, error: null })
                const response = await registerService(userData)
                const { token, user } = response.data
                localStorage.setItem('token', token)
                localStorage.setItem('user', JSON.stringify(user))
                set({ token, user, loading: false })
                return response
            } catch (err) {
                set({ error: err.response?.data?.error || 'Registration failed', loading: false })
                throw err
            }
        },

        /** Sign in with a Google credential token */
        googleLogin: async (credential) => {
            try {
                set({ loading: true, error: null })
                const response = await googleLoginService(credential)
                const { token, user } = response.data
                localStorage.setItem('token', token)
                localStorage.setItem('user', JSON.stringify(user))
                set({ token, user, loading: false })
                return response
            } catch (err) {
                set({ error: err.response?.data?.message || 'Google login failed', loading: false })
                throw err
            }
        },

        /** Clear session */
        logout: () => {
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            set({ user: null, token: null })
        },

        /** Re-fetch the current user from the API */
        fetchUser: async () => {
            try {
                set({ loading: true })
                const response = await fetch('/api/v1/auth/me', {
                    headers: { Authorization: `Bearer ${get().token}` }
                })
                if (response.ok) {
                    const data = await response.json()
                    set({ user: data.data, loading: false })
                } else {
                    get().logout()
                    set({ loading: false })
                }
            } catch (err) {
                console.error('Failed to fetch user:', err)
                get().logout()
                set({ loading: false })
            }
        }
    }
})

export default useAuthStore
