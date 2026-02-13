<template>
  <div class="category-list-page">
    <AppHeader />

    <!-- Category Header -->
    <section class="category-header">
      <div class="container">
        <div class="breadcrumb">
          <router-link to="/">{{ $t('common.home') }}</router-link>
          <span class="separator">/</span>
          <span class="current">{{ categoryName }}</span>
        </div>
        <div class="header-content">
          <span class="category-icon">{{ categoryIcon }}</span>
          <div>
            <h1 class="category-title">{{ categoryName }}</h1>
            <p class="category-description">{{ categoryDescription }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Businesses List -->
    <section class="businesses-section">
      <div class="container">
        <div v-if="loading" class="loading-container">
          <div class="loading-spinner"></div>
          <p>{{ $t('business.loadingBusinesses') }}</p>
        </div>
        
        <div v-else-if="error" class="error-container">
          <div class="error-icon">⚠️</div>
          <p class="error">{{ error }}</p>
          <router-link to="/" class="back-btn">{{ $t('auth.backToHome') }}</router-link>
        </div>
        
        <div v-else-if="businesses.length === 0" class="empty-state">
          <div class="empty-icon">📭</div>
          <h2>{{ $t('business.noResults') }}</h2>
          <p>{{ $t('business.noResultsDesc') }}</p>
          <router-link to="/" class="browse-btn">{{ $t('business.browseAll') }}</router-link>
        </div>
        
        <div v-else>
          <p class="results-count">{{ businesses.length }} {{ $t('business.businessesFound') }}</p>
          <div class="businesses-grid">
            <router-link 
              v-for="business in businesses" 
              :key="business.id" 
              :to="`/businesses/${business.id}`"
              class="business-card"
            >
              <div class="card-image">
                <img :src="business.photos?.[0] || 'https://via.placeholder.com/400x250'" :alt="business.name" />
                <span class="price-badge">{{ business.price_range }}</span>
                <span v-if="business.coupons && business.coupons.length > 0" class="coupon-badge-overlay">
                  🎟️ {{ business.coupons.length }} {{ business.coupons.length === 1 ? 'Coupon' : 'Coupons' }}
                </span>
              </div>
              <div class="card-content">
                <h3 class="business-name">{{ business.name }}</h3>
                <p class="business-description">{{ currentLocale === 'my' ? (business.description_my || business.description_en) : business.description_en }}</p>
                <div class="business-meta">
                  <span class="address">📍 {{ business.address }}</span>
                </div>
                <div class="business-tags">
                  <span v-for="tag in business.tags?.slice(0, 3)" :key="tag" class="tag">{{ tag }}</span>
                </div>
                <span class="view-link">{{ $t('business.viewDetails') }} →</span>
              </div>
            </router-link>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
/**
 * CategoryListPage script
 *
 * Displays businesses filtered by a category slug from the URL.
 * Uses a static slug→meta map for names/icons; fetches businesses from API.
 */
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import axios from 'axios'
import AppHeader from '../components/layout/AppHeader.vue'

const route = useRoute()
const { t, locale } = useI18n()

/* ---------- State ---------- */
const businesses          = ref([])
const loading             = ref(true)
const error               = ref('')
const categoryName        = ref('')
const categoryDescription = ref('')
const categoryIcon        = ref('')
const currentLocale       = computed(() => locale.value)

/** Map slug → { name, icon, description } using i18n keys */
const getCategoryMap = () => ({
  'sim-cards':         { name: t('category.simCards'),         icon: '📶', description: t('category.simCardsDesc') },
  'ramen':             { name: t('category.ramen'),            icon: '🍜', description: t('category.ramenDesc') },
  'sushi':             { name: t('category.sushi'),            icon: '🍣', description: t('category.sushiDesc') },
  'yakiniku':          { name: t('category.yakiniku'),         icon: '🥩', description: t('category.yakinikuDesc') },
  'bookstores':        { name: t('category.bookstores'),       icon: '📚', description: t('category.bookstoresDesc') },
  'currency-exchange': { name: t('category.currencyExchange'), icon: '💱', description: t('category.currencyExchangeDesc') },
})

onMounted(async () => {
  const slug = route.params.slug
  const categoryMap = getCategoryMap()
  const category = categoryMap[slug] || { name: slug, icon: '📂', description: '' }
  
  categoryName.value = category.name
  categoryIcon.value = category.icon
  categoryDescription.value = category.description

  try {
    const response = await axios.get(`http://localhost:5000/api/businesses?category=${slug}`)
    businesses.value = response.data.businesses || response.data
  } catch (err) {
    error.value = 'Failed to load businesses. Please try again later.'
    console.error(err)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.category-list-page {
  min-height: 100vh;
  background: var(--bg-primary);
}

.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

/* Category Header */
.category-header {
  background: var(--gradient-hero);
  padding: 3rem 0;
  position: relative;
  overflow: hidden;
}

.category-header::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 100% 50%, rgba(201, 169, 98, 0.15) 0%, transparent 50%);
}

.breadcrumb {
  margin-bottom: 1.5rem;
  font-size: 0.875rem;
  position: relative;
  z-index: 1;
}

.breadcrumb a {
  color: var(--color-primary);
  text-decoration: none;
  transition: opacity var(--transition-fast);
}

.breadcrumb a:hover {
  opacity: 0.8;
}

.breadcrumb .separator {
  color: rgba(255, 255, 255, 0.4);
  margin: 0 0.5rem;
}

.breadcrumb .current {
  color: rgba(255, 255, 255, 0.7);
}

.header-content {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  position: relative;
  z-index: 1;
}

.category-icon {
  font-size: 4rem;
  background: rgba(255, 255, 255, 0.1);
  width: 100px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-lg);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.category-title {
  font-size: 2.5rem;
  color: #ffffff;
  margin-bottom: 0.5rem;
  font-weight: 700;
}

.category-description {
  font-size: 1.125rem;
  color: rgba(255, 255, 255, 0.7);
}

/* Businesses Section */
.businesses-section {
  padding: 3rem 0 5rem;
}

.results-count {
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
  font-size: 0.9375rem;
}

/* Loading */
.loading-container {
  text-align: center;
  padding: 5rem 1rem;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 3px solid var(--border-light);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-container p {
  color: var(--text-secondary);
}

/* Error */
.error-container {
  text-align: center;
  padding: 5rem 1rem;
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.error {
  color: var(--color-error);
  margin-bottom: 1.5rem;
}

.back-btn {
  color: var(--color-primary);
  text-decoration: none;
  font-weight: 600;
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

/* Business Grid */
.businesses-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 1.5rem;
}

.business-card {
  background: var(--bg-card);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  overflow: hidden;
  text-decoration: none;
  transition: all var(--transition-base);
}

.business-card:hover {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-md);
  transform: translateY(-4px);
}

.card-image {
  position: relative;
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

.price-badge {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  background: var(--color-primary-gradient);
  color: #1a1a2e;
  padding: 0.375rem 0.75rem;
  border-radius: var(--radius-sm);
  font-weight: 700;
  font-size: 0.875rem;
}

.card-content {
  padding: 1.5rem;
}

.business-name {
  font-size: 1.125rem;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
  font-weight: 700;
}

.business-description {
  color: var(--text-secondary);
  font-size: 0.9375rem;
  margin-bottom: 0.75rem;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.business-meta {
  margin-bottom: 0.75rem;
}

.address {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.business-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.tag {
  background: var(--bg-tertiary);
  padding: 0.25rem 0.75rem;
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.view-link {
  display: inline-block;
  color: var(--color-primary);
  font-weight: 600;
  font-size: 0.9375rem;
  transition: transform var(--transition-fast);
}

.business-card:hover .view-link {
  transform: translateX(4px);
}

/* Coupon Badge Overlay */
.coupon-badge-overlay {
  position: absolute;
  bottom: 0.75rem;
  left: 0.75rem;
  background: linear-gradient(135deg, #e74c3c, #c0392b);
  color: #fff;
  padding: 0.3rem 0.75rem;
  border-radius: var(--radius-sm);
  font-weight: 700;
  font-size: 0.75rem;
  letter-spacing: 0.02em;
  box-shadow: 0 2px 8px rgba(231, 76, 60, 0.4);
  animation: couponPulse 2s ease-in-out infinite;
}

@keyframes couponPulse {
  0%, 100% { box-shadow: 0 2px 8px rgba(231, 76, 60, 0.4); }
  50% { box-shadow: 0 2px 16px rgba(231, 76, 60, 0.6); }
}

@media (max-width: 768px) {
  .businesses-grid {
    grid-template-columns: 1fr;
  }
  
  .header-content {
    flex-direction: column;
    text-align: center;
  }
  
  .category-title {
    font-size: 2rem;
  }

  .category-icon {
    font-size: 3rem;
    width: 80px;
    height: 80px;
  }
}

@media (max-width: 480px) {
  .category-header {
    padding: 2rem 0;
  }

  .category-title {
    font-size: 1.5rem;
  }

  .category-description {
    font-size: 0.9375rem;
  }

  .card-content {
    padding: 1rem;
  }
}
</style>
