/**
 * Dictionary Service
 *
 * Looks up Japanese words via a three-tier fallback strategy:
 *   1. Our own backend proxy  (/api/dictionary/search)
 *   2. corsproxy.io           (public CORS proxy)
 *   3. allorigins.win         (public CORS proxy)
 *
 * Returns an array of Jisho word objects on success,
 * or throws if all sources fail.
 */

import axios from 'axios'
import api   from './api'

/** CORS proxy URL builders – used when the backend proxy is down */
const CORS_PROXIES = [
  (url) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
  (url) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`
]

/**
 * Search the Jisho dictionary for a given keyword.
 *
 * @param {string} keyword – Japanese or English word
 * @returns {Promise<object[]>} Array of Jisho word objects
 */
export async function searchDictionary(keyword) {
  const query = typeof keyword === 'string' ? keyword.trim() : ''
  if (!query) return []

  const jishoUrl = `https://jisho.org/api/v1/search/words?keyword=${encodeURIComponent(query)}`

  /* --- 1. Try our own backend proxy first --- */
  try {
    const response = await api.get('/dictionary/search', { params: { q: query } })
    return response.data?.data || []
  } catch (proxyError) {
    console.warn('Backend proxy failed:', proxyError?.message)
  }

  /* --- 2. Fall back to public CORS proxies --- */
  for (const buildUrl of CORS_PROXIES) {
    try {
      const url = buildUrl(jishoUrl)
      const response = await axios.get(url, { timeout: 8000 })
      const payload = typeof response.data === 'string'
        ? JSON.parse(response.data)
        : response.data
      return payload?.data || []
    } catch (err) {
      console.warn('CORS proxy fallback failed:', err?.message)
    }
  }

  throw new Error('All dictionary sources unavailable. Please check your internet connection.')
}
