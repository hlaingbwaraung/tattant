import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getBusinesses, getBusinessById } from '../services/businessService'

export const useBusinessStore = defineStore('business', () => {
  const businesses = ref([])
  const selectedBusiness = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const filters = ref({
    category: null,
    search: '',
    lat: null,
    lng: null
  })

  async function fetchBusinesses(params = {}) {
    try {
      loading.value = true
      error.value = null
      const response = await getBusinesses(params)
      businesses.value = response.data
      return response
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to fetch businesses'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchBusinessById(id) {
    try {
      loading.value = true
      error.value = null
      const response = await getBusinessById(id)
      selectedBusiness.value = response.data
      return response
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to fetch business'
      throw err
    } finally {
      loading.value = false
    }
  }

  function applyFilters(newFilters) {
    filters.value = { ...filters.value, ...newFilters }
    fetchBusinesses(filters.value)
  }

  function resetFilters() {
    filters.value = {
      category: null,
      search: '',
      lat: null,
      lng: null
    }
  }

  return {
    businesses,
    selectedBusiness,
    loading,
    error,
    filters,
    fetchBusinesses,
    fetchBusinessById,
    applyFilters,
    resetFilters
  }
})
