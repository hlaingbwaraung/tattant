/**
 * Theme Store (Pinia)
 *
 * Handles dark / light mode toggle.
 * Persists the user’s preference in localStorage and
 * applies the corresponding CSS class to <html>.
 */

import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  /* ---------- State ---------- */
  const savedTheme = localStorage.getItem('theme') || 'light'
  const isDarkMode = ref(savedTheme === 'dark')

  /* ---------- Helpers ---------- */

  /** Apply the "dark" or "light" class to <html> and persist */
  const applyTheme = (dark) => {
    document.documentElement.classList.toggle('dark',  dark)
    document.documentElement.classList.toggle('light', !dark)
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }

  /* ---------- Actions ---------- */

  /** Toggle between dark and light */
  const toggleTheme = () => {
    isDarkMode.value = !isDarkMode.value
    applyTheme(isDarkMode.value)
  }

  /** Explicitly set dark or light */
  const setTheme = (dark) => {
    isDarkMode.value = dark
    applyTheme(dark)
  }

  // Apply immediately on store creation
  watch(isDarkMode, (newVal) => applyTheme(newVal), { immediate: true })

  return { isDarkMode, toggleTheme, setTheme }
})
