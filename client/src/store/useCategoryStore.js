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
            // API returns { count, categories } — extract the array
            const data = response.data
            set({ categories: data.categories ?? data, loading: false })
        } catch (err) {
            set({ error: err.response?.data?.error || 'Failed to fetch categories', loading: false })
            throw err
        }
    }
}))

export default useCategoryStore
