<template>
  <div class="favorites-page">
    <AppHeader />

    <div class="container">
      <div class="page-header">
        <h1>❤️ {{ $t('favorites.title') }}</h1>
        <p class="subtitle">{{ $t('favorites.subtitle') }}</p>
      </div>

      <div v-if="loading" class="loading-container">
        <p class="loading">{{ $t('favorites.loading') }}</p>
      </div>

      <div v-else-if="error" class="error-container">
        <p class="error">{{ error }}</p>
      </div>

      <div v-else-if="favorites.length === 0" class="empty-state">
        <div class="empty-icon">💔</div>
        <h2>{{ $t('favorites.empty') }}</h2>
        <p>{{ $t('favorites.emptyDesc') }}</p>
        <router-link to="/" class="browse-btn">{{ $t('favorites.browseBusiness') }}</router-link>
      </div>

      <div v-else class="favorites-grid">
        <div v-for="business in favorites" :key="business.id" class="business-card">
          <router-link :to="`/business/${business.id}`" class="card-link">
            <div class="card-image">
              <img :src="business.photos?.[0] || 'https://via.placeholder.com/400x250'" :alt="business.name" />
            </div>
            <div class="card-content">
              <div class="card-header">
                <h3 class="business-name">{{ business.name }}</h3>
                <span v-if="business.category" class="category-badge">
                  {{ business.category.icon }} {{ business.category.name_en }}
                </span>
              </div>
              <p class="description">{{ truncate(business.description_en, 120) }}</p>
              <div class="card-meta">
                <span class="price">{{ business.price_range }}</span>
                <span class="address">📍 {{ truncateAddress(business.address) }}</span>
              </div>
              <div class="tags">
                <span v-for="tag in business.tags?.slice(0, 3)" :key="tag" class="tag">{{ tag }}</span>
              </div>
            </div>
          </router-link>
          <button @click.prevent="handleRemoveFavorite(business.id)" class="remove-btn" title="Remove from favorites">
            ✕
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * FavoritesPage script
 *
 * Lists the current user’s saved / bookmarked businesses.
 * Allows inline removal with a confirm dialog.
 */
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '../components/layout/AppHeader.vue'
import { getSavedBusinesses, unsaveBusiness } from '../services/favoriteService'
import { useAuthStore } from '../store/auth'

const router    = useRouter()
const authStore = useAuthStore()

/* ---------- State ---------- */
const favorites = ref([])
const loading   = ref(true)
const error     = ref('')

/* ---------- Helpers ---------- */

/** Truncate text to `length` chars, appending ‘…’ if longer */
const truncate = (text, length) => {
  if (!text) return ''
  return text.length > length ? text.substring(0, length) + '...' : text
}

/** Keep only the first two comma-separated parts of an address */
const truncateAddress = (address) => {
  if (!address) return ''
  const parts = address.split(',')
  return parts.length > 2 ? parts.slice(0, 2).join(',') : address
}

/* ---------- Actions ---------- */

/** Remove a business from favourites after user confirmation */
const handleRemoveFavorite = async (businessId) => {
  if (!confirm('Remove this business from your favorites?')) {
    return
  }

  try {
    await unsaveBusiness(businessId)
    favorites.value = favorites.value.filter(b => b.id !== businessId)
  } catch (err) {
    console.error('Error removing favorite:', err)
    alert('Failed to remove from favorites')
  }
}

onMounted(async () => {
  // Check if user is logged in
  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }

  try {
    const response = await getSavedBusinesses()
    favorites.value = response.data
  } catch (err) {
    error.value = 'Failed to load favorites. Please try again later.'
    console.error(err)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.favorites-page {
  min-height: 100vh;
  background: var(--bg-primary);
}

.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
}

.page-header {
  margin-bottom: 2.5rem;
  padding: 2rem;
  background: var(--gradient-hero);
  border-radius: var(--radius-xl);
  position: relative;
  overflow: hidden;
}

.page-header::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 100% 50%, rgba(201, 169, 98, 0.15) 0%, transparent 50%);
}

.page-header h1 {
  font-size: 2rem;
  color: #ffffff;
  margin-bottom: 0.5rem;
  position: relative;
  z-index: 1;
}

.subtitle {
  color: rgba(255, 255, 255, 0.7);
  font-size: 1rem;
  position: relative;
  z-index: 1;
}

/* Loading & Error */
.loading-container,
.error-container {
  text-align: center;
  padding: 4rem 1rem;
}

.loading,
.error {
  font-size: 1.125rem;
  color: var(--text-secondary);
}

.error {
  color: var(--color-error);
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 5rem 1rem;
  background: var(--bg-card);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-state h2 {
  color: var(--text-primary);
  margin-bottom: 0.5rem;
  font-size: 1.5rem;
}

.empty-state p {
  color: var(--text-secondary);
  margin-bottom: 2rem;
}

.browse-btn {
  display: inline-block;
  padding: 1rem 2.5rem;
  background: var(--color-primary-gradient);
  color: #1a1a2e;
  text-decoration: none;
  border-radius: var(--radius-sm);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  transition: all var(--transition-base);
}

.browse-btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md), var(--shadow-glow);
}

/* Favorites Grid */
.favorites-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 1.5rem;
}

.business-card {
  position: relative;
  background: var(--bg-card);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition: all var(--transition-base);
}

.business-card:hover {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-md);
  transform: translateY(-4px);
}

.card-link {
  text-decoration: none;
  color: inherit;
  display: block;
}

.card-image {
  width: 100%;
  height: 200px;
  overflow: hidden;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.business-card:hover .card-image img {
  transform: scale(1.05);
}

.card-content {
  padding: 1.5rem;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.business-name {
  font-size: 1.125rem;
  color: var(--text-primary);
  margin: 0;
  flex: 1;
  font-weight: 700;
}

.category-badge {
  background: var(--color-primary-light);
  padding: 0.25rem 0.75rem;
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  color: var(--color-primary);
  white-space: nowrap;
  font-weight: 600;
}

.description {
  color: var(--text-secondary);
  font-size: 0.9375rem;
  margin-bottom: 0.75rem;
  line-height: 1.5;
}

.card-meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
  margin-bottom: 0.75rem;
  color: var(--text-secondary);
}

.price {
  font-weight: 700;
  background: var(--color-primary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag {
  background: var(--bg-tertiary);
  padding: 0.25rem 0.75rem;
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.remove-btn {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  width: 36px;
  height: 36px;
  background: var(--bg-card);
  border: 1px solid var(--border-light);
  border-radius: 50%;
  font-size: 1rem;
  color: var(--color-error);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-fast);
  z-index: 10;
}

.remove-btn:hover {
  background: var(--color-error);
  color: white;
  border-color: var(--color-error);
  transform: scale(1.1);
}

@media (max-width: 768px) {
  .favorites-grid {
    grid-template-columns: 1fr;
  }

  .page-title {
    font-size: 1.75rem;
  }
}

@media (max-width: 480px) {
  .card-content {
    padding: 1rem;
  }

  .page-title {
    font-size: 1.375rem;
  }

  .page-subtitle {
    font-size: 0.875rem;
  }

  .container {
    padding: 0 1rem;
  }
}
</style>
