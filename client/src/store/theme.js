import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  // Initialize from localStorage or default to light
  const savedTheme = localStorage.getItem('theme') || 'light'
  const isDarkMode = ref(savedTheme === 'dark')

  // Apply theme to document
  const applyTheme = (dark) => {
    if (dark) {
      document.documentElement.classList.add('dark')
      document.documentElement.classList.remove('light')
    } else {
      document.documentElement.classList.add('light')
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }

  // Toggle theme
  const toggleTheme = () => {
    isDarkMode.value = !isDarkMode.value
    applyTheme(isDarkMode.value)
  }

  // Set specific theme
  const setTheme = (dark) => {
    isDarkMode.value = dark
    applyTheme(dark)
  }

  // Watch for changes
  watch(isDarkMode, (newVal) => {
    applyTheme(newVal)
  }, { immediate: true })

  return {
    isDarkMode,
    toggleTheme,
    setTheme
  }
})
