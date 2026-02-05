import api from './api'

// Get all saved businesses
export const getSavedBusinesses = () => {
  return api.get('/favorites')
}

// Save a business to favorites
export const saveBusiness = (businessId) => {
  return api.post('/favorites/save', { businessId })
}

// Remove a business from favorites
export const unsaveBusiness = (businessId) => {
  return api.delete(`/favorites/${businessId}`)
}

// Check if a business is saved
export const checkIfSaved = (businessId) => {
  return api.get(`/favorites/check/${businessId}`)
}

// Legacy aliases for backward compatibility
export const getFavorites = getSavedBusinesses
export const addFavorite = saveBusiness
export const removeFavorite = unsaveBusiness
