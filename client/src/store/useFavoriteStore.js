/**
 * Favorite Store (Zustand)
 *
 * Tracks which businesses the current user has saved ("favourited").
 * Provides add / remove / check helpers.
 */

import { create } from 'zustand'
import { getFavorites, addFavorite, removeFavorite } from '../services/favoriteService'

const useFavoriteStore = create((set, get) => ({
    favorites: [],
    loading: false,
    error: null,

    /** Load all saved businesses for the current user */
    fetchFavorites: async () => {
        try {
            set({ loading: true, error: null })
            const response = await getFavorites()
            set({ favorites: response.data, loading: false })
            return response
        } catch (err) {
            set({ error: err.response?.data?.error || 'Failed to fetch favorites', loading: false })
            throw err
        }
    },

    /** Save a business and refresh the list */
    add: async (businessId) => {
        try {
            set({ loading: true, error: null })
            await addFavorite(businessId)
            await get().fetchFavorites()
        } catch (err) {
            set({ error: err.response?.data?.error || 'Failed to add favorite', loading: false })
            throw err
        }
    },

    /** Unsave a business (optimistic local removal) */
    remove: async (businessId) => {
        try {
            set({ loading: true, error: null })
            await removeFavorite(businessId)
            set({
                favorites: get().favorites.filter(fav => fav.business_id !== businessId),
                loading: false
            })
        } catch (err) {
            set({ error: err.response?.data?.error || 'Failed to remove favorite', loading: false })
            throw err
        }
    },

    /** Check whether a business is currently in the user's favourites */
    isFavorite: (businessId) => {
        return get().favorites.some(fav => fav.business_id === businessId)
    }
}))

export default useFavoriteStore
