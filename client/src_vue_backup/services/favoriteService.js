/**
 * Favorite (Saved Businesses) Service
 *
 * API calls for saving / un-saving businesses to the user's favourites list.
 */

import api from './api'

/* ---------- CRUD ---------- */

/** Get all businesses the current user has saved */
export const getSavedBusinesses = () => api.get('/favorites')

/** Save a business to favorites */
export const saveBusiness = (businessId) => api.post('/favorites/save', { businessId })

/** Remove a business from favorites */
export const unsaveBusiness = (businessId) => api.delete(`/favorites/${businessId}`)

/** Check whether a specific business is already saved */
export const checkIfSaved = (businessId) => api.get(`/favorites/check/${businessId}`)

/* ---------- Legacy aliases (backward-compat) ---------- */
export const getFavorites   = getSavedBusinesses
export const addFavorite    = saveBusiness
export const removeFavorite = unsaveBusiness
