<!--
  BusinessDetailPage.vue

  Displays a single business / shop with:
    - Hero image, breadcrumb, name & tags
    - Description (bilingual EN / MY)
    - Opening hours, location, contact
    - Sidebar: active coupons, save/unsave toggle, photo gallery
    - Back button at the bottom of the content
-->

<template>
  <div class="business-detail-page">
    <AppHeader />

    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>{{ $t('business.loadingDetails') }}</p>
    </div>

    <div v-else-if="error" class="error-container">
      <div class="error-icon">⚠️</div>
      <p class="error">{{ error }}</p>
      <router-link to="/" class="back-btn">{{ $t('auth.backToHome') }}</router-link>
    </div>

    <div v-else-if="business" class="business-detail">
      <!-- Hero Image -->
      <div class="business-hero">
        <img :src="business.photos?.[0] || 'https://via.placeholder.com/1200x400'" :alt="business.name" />
        <div class="hero-overlay"></div>
      </div>

      <div class="container">
        <div class="breadcrumb">
          <router-link to="/">{{ $t('common.home') }}</router-link>
          <span class="separator">/</span>
          <span class="current">{{ business.name }}</span>
        </div>

        <div class="business-content">
          <div class="main-content">
            <div class="title-section">
              <h1 class="business-name">{{ business.name }}</h1>
              <span class="price-badge">{{ business.price_range }}</span>
            </div>
            
            <div class="business-meta">
              <span class="languages">🌐 {{ business.languages_supported?.join(', ') }}</span>
            </div>

            <div class="business-tags">
              <span v-for="tag in business.tags" :key="tag" class="tag">{{ tag }}</span>
            </div>

            <div class="section">
              <h2>{{ $t('business.about') }}</h2>
              <p>{{ currentLocale === 'my' ? (business.description_my || business.description_en) : business.description_en }}</p>
            </div>

            <div v-if="business.opening_hours" class="section">
              <h2>{{ $t('business.hours') }}</h2>
              <div class="opening-hours">
                <div v-for="(hours, day) in business.opening_hours" :key="day" class="hours-row">
                  <span class="day">{{ day.toUpperCase() }}</span>
                  <span class="hours">{{ hours }}</span>
                </div>
              </div>
            </div>

            <div class="section">
              <h2>{{ $t('business.location') }}</h2>
              <p class="address">📍 {{ business.address }}</p>
            </div>

            <div v-if="business.phone" class="section">
              <h2>{{ $t('business.contact') }}</h2>
              <p class="phone">📞 {{ business.phone }}</p>
              <p v-if="business.website">
                <a :href="business.website" target="_blank" class="website-link">🌐 {{ $t('business.visitWebsite') }} →</a>
              </p>
            </div>
          </div>

          <div class="sidebar">
            <!-- Coupons Card -->
            <div v-if="business.coupons && business.coupons.length > 0" class="coupons-card">
              <h3>🎟️ Available Coupons</h3>
              <div class="coupon-list">
                <div v-for="coupon in business.coupons" :key="coupon.id" class="coupon-item">
                  <div class="coupon-header">
                    <span class="coupon-badge" :class="coupon.discount_type">
                      {{ coupon.discount_type === 'percentage' ? coupon.discount_value + '%' : coupon.discount_type === 'fixed' ? '¥' + coupon.discount_value : '🎁' }}
                      {{ coupon.discount_type === 'freebie' ? 'FREE' : 'OFF' }}
                    </span>
                    <span class="coupon-code">{{ coupon.code }}</span>
                  </div>
                  <div class="coupon-title">{{ coupon.title }}</div>
                  <p v-if="coupon.description" class="coupon-desc">{{ coupon.description }}</p>
                  <div class="coupon-meta">
                    <span v-if="coupon.min_purchase">Min: ¥{{ coupon.min_purchase }}</span>
                    <span v-if="coupon.end_date">Expires: {{ new Date(coupon.end_date).toLocaleDateString() }}</span>
                  </div>
                  <button class="coupon-copy-btn" @click="copyCoupon(coupon.code)">📋 Copy Code</button>
                </div>
              </div>
            </div>

            <div class="action-card">
              <h3>{{ $t('business.quickActions') }}</h3>
              <button 
                @click="handleToggleFavorite" 
                :disabled="!isAuthenticated || isSaving"
                class="action-btn save-btn"
                :class="{ 'saved': isSaved }"
              >
                <span class="btn-icon">{{ isSaved ? '❤️' : '🤍' }}</span>
                {{ isSaved ? $t('business.savedToFavorites') : $t('business.saveToFavorites') }}
              </button>
              <button class="action-btn share-btn" @click="handleShare">
                <span class="btn-icon">📤</span>
                {{ $t('business.shareBusiness') }}
              </button>
              <p v-if="!isAuthenticated" class="login-hint">
                <router-link to="/login">{{ $t('nav.login') }}</router-link> {{ $t('business.loginToSave') }}
              </p>
            </div>

            <div v-if="business.photos && business.photos.length > 1" class="photos-card">
              <h3>{{ $t('business.photos') }}</h3>
              <div class="photo-grid">
                <img 
                  v-for="(photo, index) in business.photos.slice(1, 5)" 
                  :key="index"
                  :src="photo" 
                  :alt="`${business.name} - ${index}`"
                />
              </div>
            </div>

            <div class="info-card">
              <h3>{{ $t('business.quickInfo') }}</h3>
              <div class="info-row">
                <span class="info-label">{{ $t('business.priceRange') }}</span>
                <span class="info-value price">{{ business.price_range }}</span>
              </div>
              <div class="info-row" v-if="business.languages_supported">
                <span class="info-label">{{ $t('business.languages') }}</span>
                <span class="info-value">{{ business.languages_supported.length }}</span>
              </div>
            </div>
          </div>
        </div>

        <button class="page-back-btn" @click="goBack" type="button">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 12H5M5 12L12 19M5 12L12 5"/>
          </svg>
          Back
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * BusinessDetailPage script
 *
 * Fetches a single business by ID from the API.
 * Supports bilingual descriptions and the save/unsave (favourite) toggle.
 */
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import axios from 'axios'
import AppHeader from '../components/layout/AppHeader.vue'
import { saveBusiness, unsaveBusiness, checkIfSaved } from '../services/favoriteService'
import { useAuthStore } from '../store/auth'

const route  = useRoute()
const router = useRouter()
const { locale, t } = useI18n()
const authStore = useAuthStore()

/* ---------- State ---------- */
const business = ref(null)   // business object from API
const loading  = ref(true)
const error    = ref('')
const isSaved  = ref(false)  // whether the current user has saved this business
const isSaving = ref(false)  // optimistic lock while toggling save

/* ---------- Computed ---------- */
const isAuthenticated = computed(() => authStore.isAuthenticated)
const currentLocale   = computed(() => locale.value)

/* ---------- Navigation ---------- */

/** Navigate back or fall back to home */
const goBack = () => {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/')
  }
}

const handleToggleFavorite = async () => {
  if (!isAuthenticated.value) {
    router.push('/login')
    return
  }

  isSaving.value = true
  try {
    if (isSaved.value) {
      await unsaveBusiness(business.value.id)
      isSaved.value = false
    } else {
      await saveBusiness(business.value.id)
      isSaved.value = true
    }
  } catch (err) {
    console.error('Error toggling favorite:', err)
    alert(err.response?.data?.message || 'Failed to update favorites')
  } finally {
    isSaving.value = false
  }
}

const handleShare = async () => {
  try {
    await navigator.clipboard.writeText(window.location.href)
    alert(t('business.linkCopied'))
  } catch (err) {
    console.error('Error sharing:', err)
  }
}

const copyCoupon = async (code) => {
  try {
    await navigator.clipboard.writeText(code)
    alert(`Coupon code "${code}" copied!`)
  } catch (err) {
    console.error('Error copying coupon:', err)
  }
}

onMounted(async () => {
  const id = route.params.id

  try {
    const response = await axios.get(`http://localhost:5000/api/businesses/${id}`)
    business.value = response.data

    if (isAuthenticated.value) {
      try {
        const savedResponse = await checkIfSaved(id)
        isSaved.value = savedResponse.data.isSaved
      } catch (err) {
        console.error('Error checking saved status:', err)
      }
    }
  } catch (err) {
    error.value = t('business.failedToLoad')
    console.error(err)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.business-detail-page {
  min-height: 100vh;
  background: var(--bg-primary);
}

.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

/* Loading & Error */
.loading-container,
.error-container {
  min-height: 60vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 3px solid var(--border-light);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-container p {
  color: var(--text-secondary);
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
  transition: opacity var(--transition-fast);
}

.back-btn:hover {
  opacity: 0.8;
}

/* Hero Image */
.business-hero {
  position: relative;
  width: 100%;
  height: 400px;
  overflow: hidden;
}

.business-hero img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, transparent 50%, var(--bg-primary) 100%);
}

/* Breadcrumb */
.breadcrumb {
  padding: 1.5rem 0;
  font-size: 0.875rem;
}

.breadcrumb a {
  color: var(--color-primary);
  text-decoration: none;
  transition: opacity var(--transition-fast);
}

.breadcrumb a:hover {
  opacity: 0.8;
}

.page-back-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 0.9rem;
  margin-bottom: 1rem;
  border-radius: 10px;
  background: transparent;
  color: var(--text-secondary);
  border: 1px solid var(--border-light);
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  box-shadow: none;
}

.page-back-btn:hover {
  color: var(--color-primary);
  border-color: var(--color-primary);
  background: rgba(212, 175, 55, 0.08);
}

.breadcrumb .separator {
  color: var(--text-muted);
  margin: 0 0.5rem;
}

.breadcrumb .current {
  color: var(--text-secondary);
}

/* Content Layout */
.business-content {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 2rem;
  padding-bottom: 4rem;
}

/* Main Content */
.main-content {
  background: var(--bg-card);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  padding: 2rem;
}

.title-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
}

.business-name {
  font-size: 2rem;
  color: var(--text-primary);
  font-weight: 700;
  flex: 1;
}

.price-badge {
  background: var(--color-primary-gradient);
  color: #1a1a2e;
  padding: 0.5rem 1rem;
  border-radius: var(--radius-sm);
  font-weight: 700;
  font-size: 1rem;
  white-space: nowrap;
}

.business-meta {
  margin-bottom: 1rem;
  color: var(--text-secondary);
}

.business-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 2rem;
}

.tag {
  background: var(--color-primary-light);
  color: var(--color-primary);
  padding: 0.375rem 0.875rem;
  border-radius: var(--radius-full);
  font-size: 0.8125rem;
  font-weight: 600;
}

.section {
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid var(--border-light);
}

.section:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.section h2 {
  font-size: 1.25rem;
  margin-bottom: 1rem;
  color: var(--text-primary);
  font-weight: 700;
}

.section p {
  color: var(--text-secondary);
  line-height: 1.7;
}

.opening-hours {
  background: var(--bg-secondary);
  padding: 1rem;
  border-radius: var(--radius-md);
}

.hours-row {
  display: flex;
  justify-content: space-between;
  padding: 0.625rem 0;
  border-bottom: 1px solid var(--border-light);
}

.hours-row:last-child {
  border-bottom: none;
}

.day {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.875rem;
}

.hours {
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.address,
.phone {
  color: var(--text-secondary);
}

.website-link {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  color: var(--color-primary);
  text-decoration: none;
  font-weight: 600;
  transition: opacity var(--transition-fast);
}

.website-link:hover {
  opacity: 0.8;
}

/* Sidebar */
.sidebar {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.action-card,
.photos-card,
.info-card {
  background: var(--bg-card);
  border: 1px solid var(--border-light);
  padding: 1.5rem;
  border-radius: var(--radius-lg);
}

.action-card h3,
.photos-card h3,
.info-card h3 {
  margin-bottom: 1rem;
  color: var(--text-primary);
  font-size: 1rem;
  font-weight: 700;
}

.action-btn {
  width: 100%;
  padding: 1rem;
  border: none;
  border-radius: var(--radius-md);
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 0.75rem;
  transition: all var(--transition-base);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.action-btn:last-of-type {
  margin-bottom: 0;
}

.action-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-icon {
  font-size: 1.125rem;
}

.save-btn {
  background: var(--color-primary-light);
  color: var(--color-primary);
}

.save-btn.saved {
  background: var(--color-primary-gradient);
  color: #1a1a2e;
}

.share-btn {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.login-hint {
  text-align: center;
  font-size: 0.8125rem;
  color: var(--text-muted);
  margin-top: 0.75rem;
}

.login-hint a {
  color: var(--color-primary);
  text-decoration: none;
  font-weight: 600;
}

.photo-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
}

.photo-grid img {
  width: 100%;
  height: 100px;
  object-fit: cover;
  border-radius: var(--radius-sm);
  transition: transform var(--transition-fast);
}

.photo-grid img:hover {
  transform: scale(1.05);
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--border-light);
}

.info-row:last-child {
  border-bottom: none;
}

.info-label {
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.info-value {
  color: var(--text-primary);
  font-weight: 600;
  font-size: 0.875rem;
}

.info-value.price {
  background: var(--color-primary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Coupons Card */
.coupons-card {
  background: var(--bg-card);
  border: 1px solid var(--color-primary);
  padding: 1.5rem;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-glow);
}

.coupons-card h3 {
  margin-bottom: 1rem;
  color: var(--text-primary);
  font-size: 1rem;
  font-weight: 700;
}

.coupon-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.coupon-item {
  padding: 1rem;
  background: var(--bg-tertiary);
  border: 1px dashed var(--color-primary);
  border-radius: var(--radius-md);
}

.coupon-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.coupon-badge {
  padding: 0.25rem 0.75rem;
  border-radius: var(--radius-full);
  font-weight: 700;
  font-size: 0.8125rem;
}

.coupon-badge.percentage { background: var(--color-success-bg); color: var(--color-success); }
.coupon-badge.fixed { background: var(--color-info-bg); color: var(--color-info); }
.coupon-badge.freebie { background: var(--color-warning-bg); color: var(--color-warning); }

.coupon-code {
  font-family: monospace;
  font-weight: 700;
  font-size: 0.875rem;
  color: var(--color-primary);
  letter-spacing: 0.05em;
}

.coupon-title {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.9375rem;
  margin-bottom: 0.25rem;
}

.coupon-desc {
  font-size: 0.8125rem;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}

.coupon-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.75rem;
  color: var(--text-tertiary);
  margin-bottom: 0.75rem;
}

.coupon-copy-btn {
  width: 100%;
  padding: 0.5rem;
  background: var(--color-primary-light);
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
  border-radius: var(--radius-sm);
  font-weight: 600;
  font-size: 0.8125rem;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.coupon-copy-btn:hover {
  background: var(--color-primary);
  color: #1a1a2e;
}

@media (max-width: 968px) {
  .business-content {
    grid-template-columns: 1fr;
  }
  
  .business-hero {
    height: 300px;
  }
  
  .business-name {
    font-size: 1.5rem;
  }
  
  .title-section {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .business-hero {
    height: 220px;
  }

  .business-name {
    font-size: 1.25rem;
  }

  .container {
    padding: 0 1rem;
  }

  .section h2 {
    font-size: 1.125rem;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .action-card {
    padding: 1.25rem;
  }

  .coupons-card {
    padding: 1.25rem;
  }

  .coupon-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.375rem;
  }

  .photos-grid {
    grid-template-columns: 1fr 1fr;
  }

  .breadcrumb {
    font-size: 0.75rem;
  }
}
</style>
