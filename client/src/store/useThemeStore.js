/**
 * Theme Store (Zustand)
 *
 * Handles dark / light mode toggle.
 * Persists the user's preference in localStorage and
 * applies the corresponding CSS class to <html>.
 */

import { create } from 'zustand'

/** Apply the "dark" or "light" class to <html> and persist */
const applyTheme = (dark) => {
    document.documentElement.classList.toggle('dark', dark)
    document.documentElement.classList.toggle('light', !dark)
    localStorage.setItem('theme', dark ? 'dark' : 'light')
}

const useThemeStore = create((set, get) => {
    const savedTheme = localStorage.getItem('theme') || 'light'
    const initialDark = savedTheme === 'dark'

    // Apply immediately on store creation
    applyTheme(initialDark)

    return {
        isDarkMode: initialDark,

        /** Toggle between dark and light */
        toggleTheme: () => {
            const newVal = !get().isDarkMode
            applyTheme(newVal)
            set({ isDarkMode: newVal })
        },

        /** Explicitly set dark or light */
        setTheme: (dark) => {
            applyTheme(dark)
            set({ isDarkMode: dark })
        }
    }
})

export default useThemeStore
