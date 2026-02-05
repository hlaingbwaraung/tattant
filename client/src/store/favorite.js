import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getFavorites, addFavorite, removeFavorite } from '../services/favoriteService'

export const useFavoriteStore = defineStore('favorite', () => {
  const favorites = ref([])
  const loading = ref(false)
  const error = ref(null)

  async function fetchFavorites() {
    try {
      loading.value = true
      error.value = null
      const response = await getFavorites()
      favorites.value = response.data
      return response
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to fetch favorites'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function add(businessId) {
    try {
      loading.value = true
      error.value = null
      await addFavorite(businessId)
      await fetchFavorites()
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to add favorite'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function remove(businessId) {
    try {
      loading.value = true
      error.value = null
      await removeFavorite(businessId)
      favorites.value = favorites.value.filter(fav => fav.business_id !== businessId)
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to remove favorite'
      throw err
    } finally {
      loading.value = false
    }
  }

  function isFavorite(businessId) {
    return favorites.value.some(fav => fav.business_id === businessId)
  }

  return {
    favorites,
    loading,
    error,
    fetchFavorites,
    add,
    remove,
    isFavorite
  }
})
