<template>
  <div class="dashboard-page">
    <AppHeader />

    <main class="dashboard-main">
      <div class="dashboard-container">
        <!-- Welcome Section -->
        <div class="welcome-section">
          <div class="welcome-content">
            <span class="welcome-badge">Dashboard</span>
            <h1 class="welcome-title">Welcome back, <span class="text-gold">{{ userName }}</span></h1>
            <p class="welcome-subtitle">Here's what's happening with your Japan exploration journey</p>
          </div>
          <div class="welcome-avatar">
            <span class="avatar-initial">{{ userName?.charAt(0)?.toUpperCase() || 'U' }}</span>
          </div>
        </div>

        <!-- Stats Grid -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon-wrapper">
              <span class="stat-icon">❤️</span>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ savedBusinessesCount }}</div>
              <div class="stat-label">Saved Places</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon-wrapper">
              <span class="stat-icon">📍</span>
            </div>
            <div class="stat-content">
              <div class="stat-number">0</div>
              <div class="stat-label">Places Visited</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon-wrapper">
              <span class="stat-icon">⭐</span>
            </div>
            <div class="stat-content">
              <div class="stat-number">0</div>
              <div class="stat-label">Reviews Written</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon-wrapper">
              <span class="stat-icon">🎯</span>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ daysActive }}</div>
              <div class="stat-label">Days Active</div>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <section class="section">
          <div class="section-header">
            <h2 class="section-title">Quick Actions</h2>
            <p class="section-subtitle">Jump to your most used features</p>
          </div>
          
          <div class="actions-grid">
            <router-link to="/categories" class="action-card">
              <div class="action-icon">🔍</div>
              <div class="action-content">
                <h3 class="action-title">Explore Categories</h3>
                <p class="action-description">Browse curated Japan experiences</p>
              </div>
              <span class="action-arrow">→</span>
            </router-link>

            <router-link to="/favorites" class="action-card">
              <div class="action-icon">❤️</div>
              <div class="action-content">
                <h3 class="action-title">View Favorites</h3>
                <p class="action-description">Access your saved places</p>
              </div>
              <span class="action-arrow">→</span>
            </router-link>

            <router-link to="/profile/settings" class="action-card">
              <div class="action-icon">⚙️</div>
              <div class="action-content">
                <h3 class="action-title">Account Settings</h3>
                <p class="action-description">Manage your preferences</p>
              </div>
              <span class="action-arrow">→</span>
            </router-link>

            <router-link to="/about-japan" class="action-card">
              <div class="action-icon">📚</div>
              <div class="action-content">
                <h3 class="action-title">Travel Guides</h3>
                <p class="action-description">Learn about Japan</p>
              </div>
              <span class="action-arrow">→</span>
            </router-link>
          </div>
        </section>

        <!-- Recent Activity -->
        <section class="section">
          <div class="section-header">
            <h2 class="section-title">Recent Activity</h2>
          </div>
          
          <div class="activity-card">
            <div class="activity-empty">
              <span class="activity-empty-icon">📋</span>
              <p class="activity-empty-text">No recent activity yet</p>
              <p class="activity-empty-hint">Start exploring Japan to see your activity here</p>
              <router-link to="/categories" class="btn-primary">Start Exploring</router-link>
            </div>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup>
/**
 * UserDashboard script
 *
 * Shows a personalised welcome banner with quick stats:
 *   - user name (from localStorage)
 *   - saved-businesses count (fetched from API)
 *   - days active (placeholder)
 */
import { ref, onMounted } from 'vue'
import AppHeader from '../components/layout/AppHeader.vue'
import { getSavedBusinesses } from '../services/favoriteService'

/* ---------- State ---------- */
const userName             = ref('')
const savedBusinessesCount = ref(0)
const daysActive           = ref(1)

/* ---------- Init ---------- */
onMounted(async () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  userName.value = user.name || 'Guest'

  try {
    const response = await getSavedBusinesses()
    savedBusinessesCount.value = response.data.length
  } catch (err) {
    console.error('Error fetching saved businesses:', err)
  }
})
</script>

<style scoped>
.dashboard-page {
  min-height: 100vh;
  background: var(--bg-primary);
}

.dashboard-main {
  padding: 2rem 0 4rem;
}

.dashboard-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

/* Welcome Section */
.welcome-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 2.5rem;
  background: var(--gradient-hero);
  border-radius: var(--radius-xl);
  margin-bottom: 2rem;
  position: relative;
  overflow: hidden;
}

.welcome-section::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 100% 50%, rgba(201, 169, 98, 0.15) 0%, transparent 50%);
}

.welcome-content {
  position: relative;
  z-index: 1;
}

.welcome-badge {
  display: inline-block;
  padding: 0.375rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-full);
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 1rem;
}

.welcome-title {
  font-size: 2rem;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 0.5rem;
}

.text-gold {
  background: var(--color-primary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.welcome-subtitle {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.7);
}

.welcome-avatar {
  position: relative;
  z-index: 1;
}

.avatar-initial {
  width: 80px;
  height: 80px;
  background: var(--color-primary-gradient);
  color: #1a1a2e;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: 700;
  box-shadow: 0 0 30px rgba(201, 169, 98, 0.3);
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.stat-card {
  background: var(--bg-card);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1.25rem;
  transition: all var(--transition-base);
}

.stat-card:hover {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-md);
}

.stat-icon-wrapper {
  width: 56px;
  height: 56px;
  background: var(--color-primary-light);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-icon {
  font-size: 1.5rem;
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  background: var(--color-primary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
  font-weight: 500;
}

/* Sections */
.section {
  margin-bottom: 3rem;
}

.section-header {
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.section-subtitle {
  font-size: 0.9375rem;
  color: var(--text-secondary);
}

/* Actions Grid */
.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
}

.action-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: var(--bg-card);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  text-decoration: none;
  transition: all var(--transition-base);
}

.action-card:hover {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.action-icon {
  width: 48px;
  height: 48px;
  background: var(--color-primary-light);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  flex-shrink: 0;
}

.action-content {
  flex: 1;
  min-width: 0;
}

.action-title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.action-description {
  font-size: 0.8125rem;
  color: var(--text-secondary);
}

.action-arrow {
  font-size: 1.25rem;
  color: var(--color-primary);
  transition: transform var(--transition-fast);
}

.action-card:hover .action-arrow {
  transform: translateX(4px);
}

/* Activity Card */
.activity-card {
  background: var(--bg-card);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  padding: 3rem;
}

.activity-empty {
  text-align: center;
}

.activity-empty-icon {
  font-size: 3rem;
  display: block;
  margin-bottom: 1rem;
}

.activity-empty-text {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.activity-empty-hint {
  font-size: 0.9375rem;
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.875rem 2rem;
  background: var(--color-primary-gradient);
  color: #1a1a2e;
  font-weight: 700;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-radius: var(--radius-sm);
  text-decoration: none;
  transition: all var(--transition-base);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md), var(--shadow-glow);
}

/* Responsive */
@media (max-width: 768px) {
  .welcome-section {
    flex-direction: column;
    text-align: center;
    gap: 1.5rem;
  }
  
  .welcome-avatar {
    order: -1;
  }
  
  .stats-grid {
    grid-template-columns: 1fr 1fr;
  }
  
  .actions-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .stat-card {
    padding: 1rem;
  }

  .stat-number {
    font-size: 1.5rem;
  }

  .welcome-title {
    font-size: 1.375rem;
  }

  .section-title {
    font-size: 1.25rem;
  }

  .action-card {
    padding: 1rem;
  }

  .container {
    padding: 0 1rem;
  }
}
</style>
