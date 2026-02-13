/**
 * Category Service
 *
 * API calls for fetching business categories.
 */

import api from './api'

/** Fetch all categories */
export const getCategories    = ()     => api.get('/categories')

/** Fetch a single category by its URL slug */
export const getCategoryBySlug = (slug) => api.get(`/categories/${slug}`)
