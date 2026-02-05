<template>
  <header class="header">
    <div class="header-container">
      <router-link to="/" class="logo">
        <span class="logo-icon">🎌</span>
        <span class="logo-text">Tattant</span>
      </router-link>
      
      <nav class="nav">
        <router-link to="/" class="nav-link">Home</router-link>
        <router-link to="/categories" class="nav-link">Explore</router-link>
        <router-link to="/about-japan" class="nav-link">About Japan</router-link>
      </nav>
      
      <div class="header-actions">
        <!-- Theme Toggle -->
        <button @click="themeStore.toggleTheme" class="theme-toggle" :title="themeStore.isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'">
          <span v-if="themeStore.isDarkMode" class="theme-icon">☀️</span>
          <span v-else class="theme-icon">🌙</span>
        </button>
        
        <template v-if="!authStore.isAuthenticated">
          <router-link to="/login" class="nav-link login-link">Login</router-link>
          <router-link to="/register" class="btn-signup">Get Started</router-link>
        </template>
        
        <template v-else>
          <div class="user-menu" ref="userMenuRef">
            <button @click="toggleUserMenu" class="user-button">
              <span class="user-avatar">{{ authStore.user?.name?.charAt(0).toUpperCase() || 'U' }}</span>
              <span class="user-name">{{ authStore.user?.name || 'User' }}</span>
              <svg class="dropdown-arrow" :class="{ 'rotate': showUserMenu }" width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <Transition name="dropdown">
              <div v-if="showUserMenu" class="user-dropdown">
                <div class="dropdown-header">
                  <span class="dropdown-user-name">{{ authStore.user?.name }}</span>
                  <span class="dropdown-user-email">{{ authStore.user?.email }}</span>
                </div>
                <div class="dropdown-divider"></div>
                <router-link v-if="authStore.user?.is_admin" to="/admin" class="dropdown-item admin" @click="closeMenu">
                  <span class="dropdown-icon">👨‍💼</span> Admin Dashboard
                </router-link>
                <router-link to="/dashboard" class="dropdown-item" @click="closeMenu">
                  <span class="dropdown-icon">📊</span> Dashboard
                </router-link>
                <router-link to="/favorites" class="dropdown-item" @click="closeMenu">
                  <span class="dropdown-icon">❤️</span> Favorites
                </router-link>
                <router-link to="/profile/settings" class="dropdown-item" @click="closeMenu">
                  <span class="dropdown-icon">⚙️</span> Settings
                </router-link>
                <div class="dropdown-divider"></div>
                <button @click="handleLogout" class="dropdown-item logout">
                  <span class="dropdown-icon">🚪</span> Sign Out
                </button>
              </div>
            </Transition>
          </div>
        </template>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '../../store/auth'
import { useThemeStore } from '../../store/theme'

const authStore = useAuthStore()
const themeStore = useThemeStore()
const showUserMenu = ref(false)
const userMenuRef = ref(null)

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
}

const closeMenu = () => {
  showUserMenu.value = false
}

const handleLogout = () => {
  authStore.logout()
  showUserMenu.value = false
}

const handleClickOutside = (event) => {
  if (userMenuRef.value && !userMenuRef.value.contains(event.target)) {
    showUserMenu.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.header {
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-light);
  padding: 0;
  position: sticky;
  top: 0;
  z-index: 100;
  transition: all var(--transition-base);
}

.header-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* Logo */
.logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  transition: transform var(--transition-fast);
}

.logo:hover {
  transform: scale(1.02);
}

.logo-icon {
  font-size: 1.75rem;
}

.logo-text {
  font-size: 1.5rem;
  font-weight: 700;
  background: var(--color-primary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.02em;
}

/* Navigation */
.nav {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.nav-link {
  padding: 0.625rem 1rem;
  text-decoration: none;
  color: var(--text-secondary);
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
  font-weight: 500;
  font-size: 0.9375rem;
}

.nav-link:hover {
  color: var(--text-primary);
  background: var(--bg-tertiary);
}

.nav-link.router-link-active {
  color: var(--color-primary);
  background: var(--color-primary-light);
}

/* Header Actions */
.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

/* Theme Toggle */
.theme-toggle {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.theme-toggle:hover {
  background: var(--bg-elevated);
  border-color: var(--color-primary);
  transform: rotate(15deg);
}

.theme-icon {
  font-size: 1.25rem;
}

/* Login Link */
.login-link {
  color: var(--text-secondary);
}

.login-link:hover {
  color: var(--color-primary);
  background: transparent;
}

/* Signup Button */
.btn-signup {
  padding: 0.625rem 1.5rem;
  background: var(--color-primary-gradient);
  color: var(--color-accent);
  font-weight: 600;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-radius: var(--radius-sm);
  text-decoration: none;
  transition: all var(--transition-fast);
  box-shadow: var(--shadow-sm);
}

.btn-signup:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md), var(--shadow-glow);
}

/* User Menu */
.user-menu {
  position: relative;
}

.user-button {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 1rem 0.5rem 0.5rem;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.user-button:hover {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-sm);
}

.user-avatar {
  width: 36px;
  height: 36px;
  background: var(--color-primary-gradient);
  color: var(--color-accent);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.9375rem;
}

.user-name {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.9375rem;
}

.dropdown-arrow {
  color: var(--text-tertiary);
  transition: transform var(--transition-fast);
}

.dropdown-arrow.rotate {
  transform: rotate(180deg);
}

/* User Dropdown */
.user-dropdown {
  position: absolute;
  top: calc(100% + 0.75rem);
  right: 0;
  background: var(--bg-card);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  min-width: 260px;
  z-index: 200;
  overflow: hidden;
}

.dropdown-header {
  padding: 1.25rem 1rem;
  background: var(--bg-tertiary);
}

.dropdown-user-name {
  display: block;
  font-weight: 700;
  color: var(--text-primary);
  font-size: 1rem;
}

.dropdown-user-email {
  display: block;
  font-size: 0.8125rem;
  color: var(--text-tertiary);
  margin-top: 0.25rem;
}

.dropdown-divider {
  height: 1px;
  background: var(--border-light);
  margin: 0;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.875rem 1rem;
  text-decoration: none;
  color: var(--text-secondary);
  background: none;
  border: none;
  cursor: pointer;
  transition: all var(--transition-fast);
  text-align: left;
  font-size: 0.9375rem;
  font-weight: 500;
}

.dropdown-item:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.dropdown-icon {
  font-size: 1rem;
  width: 20px;
  text-align: center;
}

.dropdown-item.admin {
  color: var(--color-primary);
  font-weight: 600;
}

.dropdown-item.admin:hover {
  background: var(--color-primary-light);
}

.dropdown-item.logout {
  color: var(--color-error);
}

.dropdown-item.logout:hover {
  background: var(--color-error-bg);
}

/* Dropdown Animation */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Responsive */
@media (max-width: 768px) {
  .nav {
    display: none;
  }
  
  .user-name {
    display: none;
  }
  
  .header-container {
    padding: 0.75rem 1rem;
  }
}
</style>
