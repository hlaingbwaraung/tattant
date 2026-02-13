/**
 * Vite Configuration
 *
 * - Uses the React plugin for JSX compilation
 * - Sets base path to /tattant/ for GitHub Pages deployment
 * - Proxies /api requests to the Express backend during local dev
 */

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  // Sub-directory base for GitHub Pages
  base: '/tattant/',

  server: {
    proxy: {
      // Forward API calls to the Express server running on port 5000
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  }
})
