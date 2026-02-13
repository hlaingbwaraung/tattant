/**
 * Category Store (Pinia)
 *
 * Caches the list of business categories fetched from the API.
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getCategories } from '../services/categoryService'

export const useCategoryStore = defineStore('category', () => {
  const categories = ref([])
  const loading    = ref(false)
  const error      = ref(null)

  /** Fetch all categories from the server */
  async function fetchCategories() {
    try {
      loading.value = true
      error.value   = null
      const response = await getCategories()
      categories.value = response.data
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to fetch categories'
      throw err
    } finally {
      loading.value = false
    }
  }

  return { categories, loading, error, fetchCategories }
})
