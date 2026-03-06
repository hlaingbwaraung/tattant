/**
 * AI Search Service
 *
 * API calls for the AI Deep Search bot (admin only).
 */

import api from './api'

/** Run AI deep search for restaurants */
export const aiDeepSearch = (data) => api.post('/ai-search/search', data)

/** Import selected AI search results into businesses */
export const aiImportResults = (data) => api.post('/ai-search/import', data)
