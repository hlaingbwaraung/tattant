/**
 * Vite Configuration
 *
 * - Uses the React plugin for JSX compilation
 * - Sets base path to /tattant/ for production deployment
 * - Proxies /api requests to the Express backend during local dev
 */

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  // Root base for production (tattant.com)
  base: '/',

  server: {
    proxy: {
      // Forward API calls to the Express server running on port 5000
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  },

  /* ===== Performance Optimizations ===== */
  build: {
    // Target modern browsers for smaller bundles
    target: 'es2020',
    // Enable minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,   // Remove console.log in production
        drop_debugger: true,
        pure_funcs: ['console.info', 'console.debug', 'console.warn']
      }
    },
    // Chunk splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-i18n': ['i18next', 'react-i18next'],
          'vendor-state': ['zustand'],
          'vendor-http': ['axios']
        }
      }
    },
    // Increase chunk warning limit
    chunkSizeWarningLimit: 600,
    // Generate source maps only in dev
    sourcemap: false,
    // Asset inlining threshold — inline small assets as base64
    assetsInlineLimit: 4096,
    // Enable CSS code splitting
    cssCodeSplit: true
  },

  // Optimize dependency pre-bundling
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'axios', 'zustand', 'i18next', 'react-i18next']
  }
})
