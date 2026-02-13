/**
 * Category Store (Zustand)
 *
 * Caches the list of business categories fetched from the API.
 */

import { create } from 'zustand'
import { getCategories } from '../services/categoryService'

const useCategoryStore = create((set) => ({
    categories: [],
    loading: false,
    error: null,

    /** Fetch all categories from the server */
    fetchCategories: async () => {
        try {
            set({ loading: true, error: null })
            const response = await getCategories()
            set({ categories: response.data, loading: false })
        } catch (err) {
            set({ error: err.response?.data?.error || 'Failed to fetch categories', loading: false })
            throw err
        }
    }
}))

export default useCategoryStore
