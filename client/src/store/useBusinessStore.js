/**
 * Business Store (Zustand)
 *
 * Manages the list of businesses and the currently selected one.
 * Provides filter helpers for category / search queries.
 */

import { create } from 'zustand'
import { getBusinesses, getBusinessById } from '../services/businessService'

const useBusinessStore = create((set, get) => ({
    /* ---------- State ---------- */
    businesses: [],
    selectedBusiness: null,
    loading: false,
    error: null,
    filters: { category: null, search: '', lat: null, lng: null },

    /* ---------- Actions ---------- */

    /** Fetch businesses with optional query params */
    fetchBusinesses: async (params = {}) => {
        try {
            set({ loading: true, error: null })
            const response = await getBusinesses(params)
            set({ businesses: response.data, loading: false })
            return response
        } catch (err) {
            set({ error: err.response?.data?.error || 'Failed to fetch businesses', loading: false })
            throw err
        }
    },

    /** Fetch a single business by UUID */
    fetchBusinessById: async (id) => {
        try {
            set({ loading: true, error: null })
            const response = await getBusinessById(id)
            set({ selectedBusiness: response.data, loading: false })
            return response
        } catch (err) {
            set({ error: err.response?.data?.error || 'Failed to fetch business', loading: false })
            throw err
        }
    },

    /** Merge new filter values and re-fetch */
    applyFilters: (newFilters) => {
        const filters = { ...get().filters, ...newFilters }
        set({ filters })
        get().fetchBusinesses(filters)
    },

    /** Reset all filters to defaults */
    resetFilters: () => {
        set({ filters: { category: null, search: '', lat: null, lng: null } })
    }
}))

export default useBusinessStore
