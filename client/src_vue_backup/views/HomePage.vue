<!--
  HomePage.vue

  Landing page with:
    - Hero banner with CTA buttons
    - Category grid (6 featured categories)
    - Floating emoji decorations
    - Footer
-->

<template>
  <div class="home-page">
    <AppHeader />

    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-bg"></div>
      <div class="hero-content">
        <span class="hero-badge">{{ $t('home.badge') }}</span>
        <h1 class="hero-title">
          {{ $t('home.title') }} <span class="text-gold">{{ $t('home.titleHighlight') }}</span> {{ $t('home.titleEnd') }}
        </h1>
        <p class="hero-subtitle">
          {{ $t('home.subtitle') }}
        </p>
        <div class="hero-actions">
          <router-link to="/categories" class="btn-hero-primary">
            {{ $t('home.exploreNow') }}
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M4 10H16M16 10L11 5M16 10L11 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </router-link>
          <router-link to="/about-japan" class="btn-hero-secondary">{{ $t('home.learnMore') }}</router-link>
        </div>
        
      </div>
      
      <!-- Floating Elements -->
      <div class="hero-float hero-float-1">🗻</div>
      <div class="hero-float hero-float-2">🌸</div>
      <div class="hero-float hero-float-3">⛩️</div>
    </section>

    <!-- Categories Section -->
    <section class="categories-section">
      <div class="section-container">
        <div class="section-header">
          <span class="section-badge">{{ $t('nav.explore') }}</span>
          <h2 class="section-title">{{ $t('home.categoriesTitle') }}</h2>
          <p class="section-subtitle">{{ $t('home.categoriesSubtitle') }}</p>
        </div>
        
        <div class="category-grid">
          <router-link 
            v-for="category in categories" 
            :key="category.id" 
            :to="`/categories/${category.slug}`"
            class="category-card"
          >
            <div class="category-icon-wrapper">
              <span class="category-icon">{{ category.icon }}</span>
            </div>
            <div class="category-content">
              <h3 class="category-name">{{ category.name }}</h3>
              <p class="category-description">{{ category.description }}</p>
            </div>
            <div class="category-arrow">→</div>
          </router-link>
        </div>
      </div>
    </section>

    <!-- Stats Section -->
    <section class="stats-section">
      <div class="section-container">
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">📍</div>
            <div class="stat-number">{{ businessCount }}+</div>
            <div class="stat-label">{{ $t('home.statsBusinesses') }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">📂</div>
            <div class="stat-number">{{ categoryCount }}</div>
            <div class="stat-label">{{ $t('home.statsCategories') }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">🌐</div>
            <div class="stat-number">2</div>
            <div class="stat-label">{{ $t('home.statsLanguages') }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">⭐</div>
            <div class="stat-number">5.0</div>
            <div class="stat-label">{{ $t('home.statsRating') }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features-section">
      <div class="section-container">
        <div class="section-header">
          <span class="section-badge">{{ $t('home.featuredTitle') }}</span>
          <h2 class="section-title">{{ $t('home.featuredSubtitle') }}</h2>
        </div>
        
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">🎯</div>
            <h3 class="feature-title">{{ $t('home.featureCurated') }}</h3>
            <p class="feature-description">{{ $t('home.featureCuratedDesc') }}</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🌏</div>
            <h3 class="feature-title">{{ $t('home.featureMultilingual') }}</h3>
            <p class="feature-description">{{ $t('home.featureMultilingualDesc') }}</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">💎</div>
            <h3 class="feature-title">{{ $t('home.featurePremium') }}</h3>
            <p class="feature-description">{{ $t('home.featurePremiumDesc') }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta-section">
      <div class="section-container">
        <div class="cta-card">
          <div class="cta-content">
            <h2 class="cta-title">{{ $t('home.ctaTitle') }}</h2>
            <p class="cta-subtitle">{{ $t('home.ctaSubtitle') }}</p>
          </div>
          <router-link v-if="!authStore.isAuthenticated" to="/register" class="btn-cta">
            {{ $t('home.ctaButton') }}
          </router-link>
          <router-link v-else to="/dashboard" class="btn-cta">
            {{ $t('nav.dashboard') }}
          </router-link>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
      <div class="section-container">
        <div class="footer-grid">
          <div class="footer-brand">
            <div class="footer-logo">🎌 Suteki</div>
            <p class="footer-tagline">{{ $t('footer.tagline') }}</p>
          </div>
          <div class="footer-links">
            <h4>{{ $t('footer.explore') }}</h4>
            <router-link to="/categories">{{ $t('nav.categories') }}</router-link>
            <router-link to="/about-japan">{{ $t('nav.about') }}</router-link>
            <router-link to="/faq">{{ $t('nav.faq') }}</router-link>
          </div>
          <div class="footer-links">
            <h4>{{ $t('footer.quickLinks') }}</h4>
            <router-link to="/login">{{ $t('nav.login') }}</router-link>
            <router-link to="/register">{{ $t('nav.register') }}</router-link>
            <router-link to="/dashboard">{{ $t('nav.dashboard') }}</router-link>
          </div>
          <div class="footer-links">
            <h4>{{ $t('footer.support') }}</h4>
            <router-link to="/contact">{{ $t('footer.contact') }}</router-link>
            <a href="#">{{ $t('footer.privacy') }}</a>
            <a href="#">{{ $t('footer.terms') }}</a>
          </div>
        </div>
        <div class="footer-bottom">
          <p>{{ $t('footer.copyright') }}</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
/**
 * HomePage script
 *
 * - Uses i18n for bilingual labels (English / Burmese)
 * - Hard-coded 6 featured categories (linked to /categories/:slug)
 */
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../store/auth'
import AppHeader from '../components/layout/AppHeader.vue'

const { t } = useI18n()
const authStore = useAuthStore()

/* ---------- Stats shown in the hero section ---------- */
const businessCount = ref(150)
const categoryCount = ref(6)

/* ---------- Featured categories ---------- */
const categories = computed(() => [
  { id: 1, slug: 'sim-cards',         name: t('category.simCards'),         icon: '📶', description: t('category.simCardsDesc') },
  { id: 2, slug: 'ramen',             name: t('category.ramen'),            icon: '🍜', description: t('category.ramenDesc') },
  { id: 3, slug: 'sushi',             name: t('category.sushi'),            icon: '🍣', description: t('category.sushiDesc') },
  { id: 4, slug: 'yakiniku',          name: t('category.yakiniku'),         icon: '🥩', description: t('category.yakinikuDesc') },
  { id: 5, slug: 'bookstores',        name: t('category.bookstores'),       icon: '📚', description: t('category.bookstoresDesc') },
  { id: 6, slug: 'currency-exchange', name: t('category.currencyExchange'), icon: '💱', description: t('category.currencyExchangeDesc') },
])
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  background: var(--bg-primary);
}

.section-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

/* Hero Section */
.hero {
  position: relative;
  min-height: 85vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: var(--gradient-hero);
}

.hero-bg {
  position: absolute;
  inset: 0;
  background-image: 
    radial-gradient(circle at 20% 50%, rgba(201, 169, 98, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 50%, rgba(201, 169, 98, 0.05) 0%, transparent 50%);
}

.hero-content {
  position: relative;
  z-index: 10;
  text-align: center;
  max-width: 800px;
  padding: 2rem;
}

.hero-badge {
  display: inline-block;
  padding: 0.5rem 1.5rem;
  background: rgba(201, 169, 98, 0.15);
  border: 1px solid rgba(201, 169, 98, 0.3);
  border-radius: var(--radius-full);
  color: var(--color-primary);
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 2rem;
}

.hero-title {
  font-size: clamp(2.5rem, 6vw, 4.5rem);
  font-weight: 700;
  color: #ffffff;
  line-height: 1.1;
  margin-bottom: 1.5rem;
  letter-spacing: -0.02em;
}

.text-gold {
  background: var(--color-primary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 1.25rem;
  color: rgba(255, 255, 255, 0.7);
  max-width: 600px;
  margin: 0 auto 2.5rem;
  line-height: 1.6;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 3rem;
}

.btn-hero-primary {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 2rem;
  background: var(--color-primary-gradient);
  color: #1a1a2e;
  font-weight: 700;
  font-size: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-radius: var(--radius-sm);
  text-decoration: none;
  transition: all var(--transition-base);
  box-shadow: 0 0 30px rgba(201, 169, 98, 0.3);
}

.btn-hero-primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 40px rgba(201, 169, 98, 0.4);
}

.btn-hero-secondary {
  display: inline-flex;
  align-items: center;
  padding: 1rem 2rem;
  background: transparent;
  color: #ffffff;
  font-weight: 600;
  font-size: 1rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: var(--radius-sm);
  text-decoration: none;
  transition: all var(--transition-base);
}

.btn-hero-secondary:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

/* Floating elements */
.hero-float {
  position: absolute;
  font-size: 4rem;
  opacity: 0.1;
  animation: float 6s ease-in-out infinite;
}

.hero-float-1 { top: 15%; left: 10%; animation-delay: 0s; }
.hero-float-2 { top: 60%; right: 15%; animation-delay: 2s; }
.hero-float-3 { bottom: 20%; left: 20%; animation-delay: 4s; }

@keyframes float {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(5deg); }
}

/* Section Styles */
.section-header {
  text-align: center;
  margin-bottom: 4rem;
}

.section-badge {
  display: inline-block;
  padding: 0.375rem 1rem;
  background: var(--color-primary-light);
  border-radius: var(--radius-full);
  color: var(--color-primary);
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 1rem;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.75rem;
  letter-spacing: -0.02em;
}

.section-subtitle {
  font-size: 1.125rem;
  color: var(--text-secondary);
}

/* Categories Section */
.categories-section {
  padding: 6rem 0;
  background: var(--bg-secondary);
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem;
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
  box-shadow: var(--shadow-md), var(--shadow-glow);
  transform: translateY(-4px);
}

.category-icon-wrapper {
  width: 60px;
  height: 60px;
  background: var(--color-primary-light);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.category-icon {
  font-size: 1.75rem;
}

.category-content {
  flex: 1;
  min-width: 0;
}

.category-name {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.category-description {
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.5;
}

.category-arrow {
  font-size: 1.25rem;
  color: var(--color-primary);
  transition: transform var(--transition-fast);
}

.category-card:hover .category-arrow {
  transform: translateX(4px);
}

/* Stats Section */
.stats-section {
  padding: 5rem 0;
  background: var(--bg-tertiary);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
}

.stat-card {
  text-align: center;
  padding: 2rem;
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-light);
}

.stat-icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.stat-number {
  font-size: 3rem;
  font-weight: 700;
  background: var(--color-primary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 0.9375rem;
  color: var(--text-secondary);
  font-weight: 500;
}

/* Features Section */
.features-section {
  padding: 6rem 0;
  background: var(--bg-secondary);
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.feature-card {
  padding: 2.5rem;
  background: var(--bg-card);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  text-align: center;
  transition: all var(--transition-base);
}

.feature-card:hover {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-md);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 1.5rem;
}

.feature-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.75rem;
}

.feature-description {
  font-size: 0.9375rem;
  color: var(--text-secondary);
  line-height: 1.6;
}

/* CTA Section */
.cta-section {
  padding: 6rem 0;
  background: var(--bg-primary);
}

.cta-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 2rem;
  padding: 3rem;
  background: var(--gradient-hero);
  border-radius: var(--radius-xl);
  position: relative;
  overflow: hidden;
}

.cta-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 100% 50%, rgba(201, 169, 98, 0.15) 0%, transparent 50%);
}

.cta-content {
  position: relative;
  z-index: 1;
}

.cta-title {
  font-size: 2rem;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 0.5rem;
}

.cta-subtitle {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.7);
  max-width: 400px;
}

.btn-cta {
  position: relative;
  z-index: 1;
  padding: 1rem 2.5rem;
  background: var(--color-primary);
  color: #1a1a2e;
  font-weight: 700;
  font-size: 0.9375rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-radius: var(--radius-sm);
  text-decoration: none;
  transition: all var(--transition-base);
}

.btn-cta:hover {
  transform: scale(1.05);
  box-shadow: 0 0 30px rgba(201, 169, 98, 0.4);
}

/* Footer */
.footer {
  padding: 4rem 0 2rem;
  background: var(--bg-tertiary);
  border-top: 1px solid var(--border-light);
}

.footer-grid {
  display: grid;
  grid-template-columns: 2fr repeat(3, 1fr);
  gap: 3rem;
  margin-bottom: 3rem;
}

.footer-logo {
  font-size: 1.5rem;
  font-weight: 700;
  background: var(--color-primary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.5rem;
}

.footer-tagline {
  color: var(--text-secondary);
  font-size: 0.9375rem;
}

.footer-links h4 {
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--text-primary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 1rem;
}

.footer-links a {
  display: block;
  color: var(--text-secondary);
  font-size: 0.9375rem;
  margin-bottom: 0.75rem;
  text-decoration: none;
  transition: color var(--transition-fast);
}

.footer-links a:hover {
  color: var(--color-primary);
}

.footer-bottom {
  padding-top: 2rem;
  border-top: 1px solid var(--border-light);
  text-align: center;
}

.footer-bottom p {
  color: var(--text-tertiary);
  font-size: 0.875rem;
}

/* Responsive */
@media (max-width: 1024px) {
  .category-grid {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  }

  .features-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 768px) {
  .hero {
    min-height: 100vh;
  }

  .hero-subtitle {
    font-size: 1rem;
  }

  .hero-actions {
    flex-direction: column;
    align-items: center;
  }

  .btn-hero-primary,
  .btn-hero-secondary {
    width: 100%;
    max-width: 320px;
    justify-content: center;
  }

  .section-title {
    font-size: 1.75rem;
  }

  .categories-section,
  .features-section,
  .cta-section {
    padding: 4rem 0;
  }

  .stats-section {
    padding: 3rem 0;
  }
  
  .category-grid {
    grid-template-columns: 1fr;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }

  .stats-grid {
    grid-template-columns: 1fr 1fr;
  }
  
  .footer-grid {
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
  }
  
  .footer-brand {
    grid-column: 1 / -1;
  }
  
  .cta-card {
    flex-direction: column;
    text-align: center;
    padding: 2rem;
  }
  
  .cta-subtitle {
    max-width: 100%;
  }

  .section-header {
    margin-bottom: 2.5rem;
  }

  .hero-float {
    display: none;
  }
}

@media (max-width: 480px) {
  .hero-badge {
    font-size: 0.75rem;
    padding: 0.375rem 1rem;
  }

  .hero-subtitle {
    font-size: 0.9375rem;
  }

  .hero-content {
    padding: 1.5rem 1rem;
  }

  .section-container {
    padding: 0 1rem;
  }

  .section-title {
    font-size: 1.375rem;
  }

  .section-subtitle {
    font-size: 0.9375rem;
  }

  .categories-section,
  .features-section,
  .cta-section {
    padding: 3rem 0;
  }

  .stat-number {
    font-size: 2rem;
  }

  .stat-card {
    padding: 1.25rem;
  }

  .stats-grid {
    gap: 1rem;
  }

  .feature-card {
    padding: 1.75rem;
  }

  .category-card {
    padding: 1.25rem;
    gap: 1rem;
  }

  .category-icon-wrapper {
    width: 48px;
    height: 48px;
  }

  .category-icon {
    font-size: 1.5rem;
  }

  .footer-grid {
    grid-template-columns: 1fr;
  }

  .footer {
    padding: 2.5rem 0 1.5rem;
  }

  .cta-title {
    font-size: 1.375rem;
  }

  .btn-cta {
    width: 100%;
    text-align: center;
  }

}
</style>
