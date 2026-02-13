<!--
  ExplorePage.vue

  Browse all categories with business counts and a featured-businesses
  grid. Supports bilingual category names (EN / MY).
-->

<template>
  <div class="explore-page">
    <AppHeader />

    <!-- Hero Banner -->
    <section class="explore-hero">
      <div class="explore-hero-overlay"></div>
      <div class="explore-hero-content">
        <span class="explore-badge">🗾 {{ $t('explore.badge') }}</span>
        <h1 class="explore-hero-title">{{ $t('explore.title') }} <span class="text-gold">{{ $t('explore.titleHighlight') }}</span> {{ $t('explore.titleEnd') }}</h1>
        <p class="explore-hero-subtitle">{{ $t('explore.subtitle') }}</p>
      </div>
    </section>

    <!-- Categories Grid -->
    <section class="explore-section">
      <div class="explore-container">
        <h2 class="section-title">{{ $t('explore.allCategories') }}</h2>

        <div v-if="loading" class="loading-container">
          <div class="loading-spinner"></div>
          <p>{{ $t('explore.loadingCategories') }}</p>
        </div>

        <div v-else-if="categories.length === 0" class="empty-state">
          <div class="empty-icon">📭</div>
          <p>{{ $t('explore.noCategories') }}</p>
        </div>

        <div v-else class="categories-grid">
          <router-link
            v-for="cat in categories"
            :key="cat.id"
            :to="`/categories/${cat.slug}`"
            class="category-card"
          >
            <div class="category-card-icon">
              <span>{{ cat.icon }}</span>
            </div>
            <div class="category-card-body">
              <h3 class="category-card-name">{{ currentLocale === 'my' ? cat.name_my : cat.name_en }}</h3>
              <p class="category-card-count">{{ cat.businessCount || 0 }} {{ $t('explore.businessCount') }}</p>
            </div>
            <span class="category-card-arrow">→</span>
          </router-link>
        </div>

        <!-- Featured Businesses -->
        <div v-if="businesses.length > 0" class="featured-section">
          <h2 class="section-title">{{ $t('home.featured') }}</h2>
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

    <!-- Footer -->
    <footer class="explore-footer">
      <div class="explore-container">
        <p>{{ $t('footer.copyright') }}</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
/**
 * ExplorePage script
 *
 * Loads all categories and businesses on mount.
 * Counts businesses per category and picks the first 6 as “featured.”
 */
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import axios from 'axios'
import AppHeader from '../components/layout/AppHeader.vue'

const { locale } = useI18n()
const currentLocale = computed(() => locale.value)

/* ---------- State ---------- */
const categories = ref([])
const businesses = ref([])   // featured subset (first 6)
const loading    = ref(true)

/* ---------- Data Loading ---------- */
onMounted(async () => {
  try {
    /* 1. Fetch categories */
    const catRes = await axios.get('http://localhost:5000/api/categories')
    const cats = catRes.data.categories || catRes.data || []

    /* 2. Fetch all businesses for per-category counts */
    const bizRes = await axios.get('http://localhost:5000/api/businesses')
    const allBusinesses = bizRes.data.businesses || bizRes.data || []

    /* 3. Build { categoryId: count } map */
    const countMap = {}
    allBusinesses.forEach(b => {
      const cid = b.category_id
      countMap[cid] = (countMap[cid] || 0) + 1
    })

    categories.value = cats.map(c => ({
      ...c,
      businessCount: countMap[c.id] || 0
    }))

    /* 4. First 6 businesses as featured */
    businesses.value = allBusinesses.slice(0, 6)
  } catch (err) {
    console.error('Error loading explore data:', err)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.explore-page {
  min-height: 100vh;
  background: var(--bg-primary);
}

.explore-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

/* Hero */
.explore-hero {
  position: relative;
  min-height: 360px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  background: var(--gradient-hero);
  overflow: hidden;
}

.explore-hero-overlay {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 30% 50%, rgba(201, 169, 98, 0.12) 0%, transparent 60%);
}

.explore-hero-content {
  position: relative;
  z-index: 1;
  padding: 3rem 1.5rem;
}

.explore-badge {
  display: inline-block;
  padding: 0.5rem 1.25rem;
  background: rgba(201, 169, 98, 0.15);
  border: 1px solid rgba(201, 169, 98, 0.3);
  border-radius: var(--radius-full);
  color: var(--color-primary);
  font-size: 0.875rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  margin-bottom: 1.5rem;
}

.explore-hero-title {
  font-size: 3rem;
  color: #ffffff;
  font-weight: 800;
  line-height: 1.2;
  margin-bottom: 1rem;
}

.text-gold {
  background: var(--color-primary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.explore-hero-subtitle {
  font-size: 1.125rem;
  color: rgba(255, 255, 255, 0.7);
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
}

/* Section */
.explore-section {
  padding: 3rem 0 5rem;
}

.section-title {
  font-size: 1.75rem;
  color: var(--text-primary);
  font-weight: 700;
  margin-bottom: 2rem;
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

/* Empty */
.empty-state {
  text-align: center;
  padding: 5rem 1rem;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-state p {
  color: var(--text-secondary);
  font-size: 1.125rem;
}

/* Categories Grid */
.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.25rem;
  margin-bottom: 4rem;
}

.category-card {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 1.5rem;
  background: var(--bg-card);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  text-decoration: none;
  transition: all var(--transition-base);
}

.category-card:hover {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-md);
  transform: translateY(-3px);
}

.category-card-icon {
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-primary-light);
  border-radius: var(--radius-md);
  font-size: 2rem;
  flex-shrink: 0;
}

.category-card-body {
  flex: 1;
  min-width: 0;
}

.category-card-name {
  font-size: 1.0625rem;
  color: var(--text-primary);
  font-weight: 700;
  margin-bottom: 0.25rem;
}

.category-card-count {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.category-card-arrow {
  color: var(--color-primary);
  font-size: 1.25rem;
  font-weight: 600;
  transition: transform var(--transition-fast);
}

.category-card:hover .category-card-arrow {
  transform: translateX(4px);
}

/* Featured Businesses */
.featured-section {
  margin-top: 2rem;
}

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

/* Footer */
.explore-footer {
  padding: 2rem 0;
  border-top: 1px solid var(--border-light);
  text-align: center;
}

.explore-footer p {
  color: var(--text-secondary);
  font-size: 0.875rem;
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
  .explore-hero-title {
    font-size: 2rem;
  }

  .explore-hero {
    min-height: 280px;
  }

  .categories-grid {
    grid-template-columns: 1fr;
  }

  .businesses-grid {
    grid-template-columns: 1fr;
  }

  .section-title {
    font-size: 1.375rem;
  }
}

@media (max-width: 480px) {
  .explore-hero-title {
    font-size: 1.5rem;
  }

  .explore-hero-subtitle {
    font-size: 0.9375rem;
  }

  .explore-hero {
    min-height: 240px;
  }

  .explore-badge {
    font-size: 0.75rem;
    padding: 0.375rem 1rem;
  }

  .category-card {
    padding: 1rem;
    gap: 1rem;
  }

  .category-card-icon {
    width: 48px;
    height: 48px;
    font-size: 1.5rem;
  }

  .card-content {
    padding: 1rem;
  }
}
</style>
