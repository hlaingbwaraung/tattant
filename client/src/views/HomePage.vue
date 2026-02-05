<template>
  <div class="home-page">
    <AppHeader />

    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-bg"></div>
      <div class="hero-content">
        <span class="hero-badge">Your Premium Japan Guide</span>
        <h1 class="hero-title">
          Discover the <span class="text-gold">Beauty</span> of Japan
        </h1>
        <p class="hero-subtitle">
          Curated experiences, essential services, and hidden gems for the discerning traveler
        </p>
        <div class="hero-actions">
          <router-link to="/categories" class="btn-hero-primary">
            Explore Now
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M4 10H16M16 10L11 5M16 10L11 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </router-link>
          <router-link to="/about-japan" class="btn-hero-secondary">Learn More</router-link>
        </div>
        
        <!-- Language Selector -->
        <div class="language-selector">
          <button class="lang-btn active">EN</button>
          <button class="lang-btn">日本語</button>
          <button class="lang-btn">中文</button>
          <button class="lang-btn">한국어</button>
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
          <span class="section-badge">Explore</span>
          <h2 class="section-title">Curated Categories</h2>
          <p class="section-subtitle">Everything you need for an unforgettable journey</p>
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
            <div class="stat-label">Verified Businesses</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">📂</div>
            <div class="stat-number">{{ categoryCount }}</div>
            <div class="stat-label">Categories</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">🌐</div>
            <div class="stat-number">4</div>
            <div class="stat-label">Languages</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">⭐</div>
            <div class="stat-number">5.0</div>
            <div class="stat-label">User Rating</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features-section">
      <div class="section-container">
        <div class="section-header">
          <span class="section-badge">Why Tattant</span>
          <h2 class="section-title">Designed for Excellence</h2>
        </div>
        
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">🎯</div>
            <h3 class="feature-title">Curated Selection</h3>
            <p class="feature-description">Hand-picked businesses and services vetted for quality and authenticity</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🌏</div>
            <h3 class="feature-title">Multilingual Support</h3>
            <p class="feature-description">Browse in English, Japanese, Chinese, or Korean for seamless navigation</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">💎</div>
            <h3 class="feature-title">Premium Experience</h3>
            <p class="feature-description">Luxury recommendations tailored to discerning travelers</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta-section">
      <div class="section-container">
        <div class="cta-card">
          <div class="cta-content">
            <h2 class="cta-title">Start Your Journey Today</h2>
            <p class="cta-subtitle">Create an account to save favorites, leave reviews, and personalize your experience</p>
          </div>
          <router-link v-if="!authStore.isAuthenticated" to="/register" class="btn-cta">
            Get Started Free
          </router-link>
          <router-link v-else to="/dashboard" class="btn-cta">
            Go to Dashboard
          </router-link>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
      <div class="section-container">
        <div class="footer-grid">
          <div class="footer-brand">
            <div class="footer-logo">🎌 Tattant</div>
            <p class="footer-tagline">Your Premium Japan Tourist Guide</p>
          </div>
          <div class="footer-links">
            <h4>Explore</h4>
            <router-link to="/categories">Categories</router-link>
            <router-link to="/about-japan">About Japan</router-link>
            <router-link to="/faq">FAQ</router-link>
          </div>
          <div class="footer-links">
            <h4>Account</h4>
            <router-link to="/login">Login</router-link>
            <router-link to="/register">Register</router-link>
            <router-link to="/dashboard">Dashboard</router-link>
          </div>
          <div class="footer-links">
            <h4>Support</h4>
            <router-link to="/contact">Contact</router-link>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
        </div>
        <div class="footer-bottom">
          <p>&copy; 2026 Tattant. All rights reserved.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../store/auth'
import AppHeader from '../components/layout/AppHeader.vue'

const authStore = useAuthStore()
const categories = ref([])
const businessCount = ref(0)
const categoryCount = ref(0)

onMounted(async () => {
  categories.value = [
    { id: 1, slug: 'sim-cards', name: 'SIM Cards & WiFi', icon: '📱', description: 'Stay connected with local SIM cards and pocket WiFi' },
    { id: 2, slug: 'ramen', name: 'Ramen', icon: '🍜', description: 'Discover the best ramen shops across Japan' },
    { id: 3, slug: 'currency-exchange', name: 'Currency Exchange', icon: '💴', description: 'Find the best rates for currency exchange' },
    { id: 4, slug: 'temples-shrines', name: 'Temples & Shrines', icon: '⛩️', description: 'Explore sacred temples and shrines' },
    { id: 5, slug: 'hotels', name: 'Hotels & Ryokan', icon: '🏨', description: 'Traditional and modern accommodations' },
    { id: 6, slug: 'transportation', name: 'Transportation', icon: '🚄', description: 'Navigate Japan with ease' },
  ]
  categoryCount.value = categories.value.length
  businessCount.value = 150
})
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

.language-selector {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}

.lang-btn {
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.7);
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all var(--transition-fast);
}

.lang-btn:hover,
.lang-btn.active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: #1a1a2e;
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
@media (max-width: 768px) {
  .hero {
    min-height: 100vh;
  }
  
  .category-grid {
    grid-template-columns: 1fr;
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
  }
  
  .cta-subtitle {
    max-width: 100%;
  }
}
</style>
