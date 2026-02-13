<!--
  AppHeader.vue

  Global navigation bar shared by all pages.
    - Logo + main nav links (Home, Explore, About, Learn Japanese, Points Shop)
    - Language toggle (EN / MY)
    - Dark / light theme toggle
    - Auth area: login/register buttons or user dropdown menu
    - Mobile hamburger menu with overlay
-->

<template>
  <header class="header">
    <div class="header-container">
      <router-link to="/" class="logo">
        <span class="logo-icon">&#127884;</span>
        <span class="logo-text">Suteki</span>
      </router-link>
      
      <nav class="nav" :class="{ open: mobileMenuOpen }">
        <router-link to="/" class="nav-link" @click="closeMobile">{{ $t('nav.home') }}</router-link>
        <router-link to="/explore" class="nav-link" @click="closeMobile">{{ $t('nav.explore') }}</router-link>
        <router-link to="/about-japan" class="nav-link" @click="closeMobile">{{ $t('nav.about') }}</router-link>
        <router-link to="/learn-japanese" class="nav-link premium-link" @click="closeMobile">🎌 {{ $t('nav.learnJapanese') }}</router-link>
        <router-link to="/points-shop" class="nav-link" @click="closeMobile">🪙 {{ $t('nav.pointsShop') }}</router-link>

        <!-- Mobile-only auth links -->
        <div class="mobile-auth" v-if="mobileMenuOpen">
          <template v-if="!authStore.isAuthenticated">
            <router-link to="/login" class="nav-link" @click="closeMobile">{{ $t('nav.login') }}</router-link>
            <router-link to="/register" class="nav-link mobile-signup" @click="closeMobile">{{ $t('nav.getStarted') }}</router-link>
          </template>
          <template v-else>
            <router-link v-if="authStore.user?.is_admin" to="/admin" class="nav-link" @click="closeMobile">
               {{ $t('nav.adminDashboard') }}
            </router-link>
            <router-link v-if="authStore.user?.is_shop_owner" to="/shop-owner" class="nav-link" @click="closeMobile">
               Shop Dashboard
            </router-link>
            <router-link to="/dashboard" class="nav-link" @click="closeMobile"> {{ $t('nav.dashboard') }}</router-link>
            <router-link to="/favorites" class="nav-link" @click="closeMobile"> {{ $t('nav.favorites') }}</router-link>
            <router-link to="/profile/settings" class="nav-link" @click="closeMobile"> {{ $t('nav.settings') }}</router-link>
            <button @click="handleLogout" class="nav-link mobile-logout"> {{ $t('nav.signOut') }}</button>
          </template>
        </div>
      </nav>
      
      <div class="header-actions">
        <button @click="toggleLanguage" class="lang-toggle" :title="currentLang === 'en' ? 'Switch to Myanmar' : 'Switch to English'">
          <svg class="lang-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="2" y1="12" x2="22" y2="12"/>
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
          </svg>
          <span class="lang-label">{{ currentLang === 'en' ? 'EN' : 'MY' }}</span>
        </button>
        <button @click="themeStore.toggleTheme" class="theme-toggle" :title="themeStore.isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'">
          <svg v-if="themeStore.isDarkMode" class="theme-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="5"/>
            <line x1="12" y1="1" x2="12" y2="3"/>
            <line x1="12" y1="21" x2="12" y2="23"/>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
            <line x1="1" y1="12" x2="3" y2="12"/>
            <line x1="21" y1="12" x2="23" y2="12"/>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
          </svg>
          <svg v-else class="theme-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
        </button>
        
        <template v-if="!authStore.isAuthenticated">
          <router-link to="/login" class="nav-link login-link desktop-only">{{ $t('nav.login') }}</router-link>
          <router-link to="/register" class="btn-signup desktop-only">{{ $t('nav.getStarted') }}</router-link>
        </template>
        
        <template v-else>
          <div class="user-menu desktop-only" ref="userMenuRef">
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
                  <span class="dropdown-icon">&#9881;</span> {{ $t('nav.adminDashboard') }}
                </router-link>
                <router-link v-if="authStore.user?.is_shop_owner" to="/shop-owner" class="dropdown-item shop-owner" @click="closeMenu">
                  <span class="dropdown-icon">&#127978;</span> Shop Dashboard
                </router-link>
                <router-link to="/dashboard" class="dropdown-item" @click="closeMenu">
                  <span class="dropdown-icon">&#128202;</span> {{ $t('nav.dashboard') }}
                </router-link>
                <router-link to="/favorites" class="dropdown-item" @click="closeMenu">
                  <span class="dropdown-icon">&#10084;</span> {{ $t('nav.favorites') }}
                </router-link>
                <router-link to="/profile/settings" class="dropdown-item" @click="closeMenu">
                  <span class="dropdown-icon">&#9881;</span> {{ $t('nav.settings') }}
                </router-link>
                <div class="dropdown-divider"></div>
                <button @click="handleLogout" class="dropdown-item logout">
                  <span class="dropdown-icon">&#10140;</span> {{ $t('nav.signOut') }}
                </button>
              </div>
            </Transition>
          </div>
        </template>

        <button class="hamburger" @click="toggleMobile" :class="{ open: mobileMenuOpen }">
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </div>
    <div class="mobile-overlay" :class="{ show: mobileMenuOpen }" @click="closeMobile"></div>
  </header>
</template>

<script setup>
/**
 * AppHeader script
 *
 * Manages desktop user-dropdown, mobile hamburger menu,
 * language toggle (EN ↔ MY), and theme toggle.
 */
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../../store/auth'
import { useThemeStore } from '../../store/theme'

const { locale } = useI18n()
const authStore  = useAuthStore()
const themeStore = useThemeStore()

/* ---------- State ---------- */
const showUserMenu   = ref(false)
const userMenuRef    = ref(null)    // template ref for click-outside detection
const mobileMenuOpen = ref(false)

/* ---------- Computed ---------- */
const currentLang = computed(() => locale.value)

/* ---------- Language ---------- */
const toggleLanguage = () => {
  const newLang = locale.value === 'en' ? 'my' : 'en'
  locale.value = newLang
  localStorage.setItem('locale', newLang)
}

/* ---------- Desktop User Menu ---------- */
const toggleUserMenu = () => { showUserMenu.value = !showUserMenu.value }
const closeMenu      = () => { showUserMenu.value = false }

/* ---------- Mobile Menu ---------- */
const toggleMobile = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
  document.body.style.overflow = mobileMenuOpen.value ? 'hidden' : ''
}

const closeMobile = () => {
  mobileMenuOpen.value = false
  document.body.style.overflow = ''
}

/* ---------- Auth ---------- */
const handleLogout = () => {
  authStore.logout()
  showUserMenu.value = false
  closeMobile()
}

/* ---------- Click-outside (close dropdown) ---------- */
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
  document.body.style.overflow = ''
})
</script>

<style scoped>
.header {
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-light);
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

.logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  transition: transform var(--transition-fast);
  z-index: 102;
}
.logo:hover { transform: scale(1.02); }
.logo-icon { font-size: 1.75rem; }
.logo-text {
  font-size: 1.5rem;
  font-weight: 700;
  background: var(--color-primary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.02em;
}

.nav { display: flex; gap: 0.5rem; align-items: center; }

.nav-link {
  padding: 0.625rem 1rem;
  text-decoration: none;
  color: var(--text-secondary);
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
  font-weight: 500;
  font-size: 0.9375rem;
  background: none;
  border: none;
  cursor: pointer;
  font-family: inherit;
}
.nav-link:hover { color: var(--text-primary); background: var(--bg-tertiary); }
.nav-link.router-link-active { color: var(--color-primary); background: var(--color-primary-light); }

.premium-link {
  background: linear-gradient(135deg, rgba(212, 175, 55, 0.1), rgba(212, 175, 55, 0.05)) !important;
  border: 1px solid rgba(212, 175, 55, 0.3);
  color: var(--color-primary) !important;
  font-weight: 600;
}
.premium-link:hover {
  background: linear-gradient(135deg, rgba(212, 175, 55, 0.2), rgba(212, 175, 55, 0.1)) !important;
  border-color: var(--color-primary);
}

.mobile-auth { display: none; }

.header-actions { display: flex; align-items: center; gap: 0.75rem; z-index: 102; }

.lang-toggle {
  display: flex; align-items: center; gap: 0.375rem;
  padding: 0.5rem 0.75rem;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: all var(--transition-fast);
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--text-secondary);
}
.lang-toggle:hover { background: var(--bg-elevated); border-color: var(--color-primary); color: var(--color-primary); }
.lang-icon { flex-shrink: 0; }
.lang-label { letter-spacing: 0.05em; }

.theme-toggle {
  width: 40px; height: 40px;
  display: flex; align-items: center; justify-content: center;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: all var(--transition-fast);
  color: var(--text-secondary);
}
.theme-toggle:hover { background: var(--bg-elevated); border-color: var(--color-primary); color: var(--color-primary); transform: rotate(15deg); }
.theme-icon { display: flex; align-items: center; justify-content: center; }

.login-link { color: var(--text-secondary); }
.login-link:hover { color: var(--color-primary); background: transparent; }

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
.btn-signup:hover { transform: translateY(-2px); box-shadow: var(--shadow-md), var(--shadow-glow); }

.user-menu { position: relative; }

.user-button {
  display: flex; align-items: center; gap: 0.75rem;
  padding: 0.5rem 1rem 0.5rem 0.5rem;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: all var(--transition-fast);
}
.user-button:hover { border-color: var(--color-primary); box-shadow: var(--shadow-sm); }

.user-avatar {
  width: 36px; height: 36px;
  background: var(--color-primary-gradient);
  color: var(--color-accent);
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-weight: 700; font-size: 0.9375rem;
}
.user-name {
  font-weight: 600; color: var(--text-primary); font-size: 0.9375rem;
  max-width: 120px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.dropdown-arrow { color: var(--text-tertiary); transition: transform var(--transition-fast); }
.dropdown-arrow.rotate { transform: rotate(180deg); }

.user-dropdown {
  position: absolute; top: calc(100% + 0.75rem); right: 0;
  background: var(--bg-card);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  min-width: 260px; z-index: 200; overflow: hidden;
}
.dropdown-header { padding: 1.25rem 1rem; background: var(--bg-tertiary); }
.dropdown-user-name { display: block; font-weight: 700; color: var(--text-primary); font-size: 1rem; }
.dropdown-user-email { display: block; font-size: 0.8125rem; color: var(--text-tertiary); margin-top: 0.25rem; }
.dropdown-divider { height: 1px; background: var(--border-light); }

.dropdown-item {
  display: flex; align-items: center; gap: 0.75rem; width: 100%;
  padding: 0.875rem 1rem; text-decoration: none; color: var(--text-secondary);
  background: none; border: none; cursor: pointer;
  transition: all var(--transition-fast); text-align: left;
  font-size: 0.9375rem; font-weight: 500; font-family: inherit;
}
.dropdown-item:hover { background: var(--bg-tertiary); color: var(--text-primary); }
.dropdown-icon { font-size: 1rem; width: 20px; text-align: center; }
.dropdown-item.admin { color: var(--color-primary); font-weight: 600; }
.dropdown-item.admin:hover { background: var(--color-primary-light); }
.dropdown-item.shop-owner { color: var(--color-info); font-weight: 600; }
.dropdown-item.shop-owner:hover { background: var(--color-info-bg); }
.dropdown-item.logout { color: var(--color-error); }
.dropdown-item.logout:hover { background: var(--color-error-bg); }

.dropdown-enter-active, .dropdown-leave-active { transition: all 0.2s ease; }
.dropdown-enter-from, .dropdown-leave-to { opacity: 0; transform: translateY(-10px); }

/* Hamburger */
.hamburger {
  display: none; flex-direction: column; justify-content: center; align-items: center;
  gap: 5px; width: 40px; height: 40px;
  background: var(--bg-tertiary); border: 1px solid var(--border-light);
  border-radius: var(--radius-sm); cursor: pointer; z-index: 102; padding: 0;
}
.hamburger span {
  display: block; width: 20px; height: 2px;
  background: var(--text-primary); border-radius: 2px; transition: all 0.3s ease;
}
.hamburger.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
.hamburger.open span:nth-child(2) { opacity: 0; }
.hamburger.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

.mobile-overlay {
  display: none; position: fixed; inset: 0;
  background: rgba(0,0,0,0.5); z-index: 90; opacity: 0; transition: opacity 0.3s;
}
.mobile-overlay.show { opacity: 1; }

.desktop-only { display: flex; }

/* === RESPONSIVE === */
@media (max-width: 768px) {
  .header-container { padding: 0.75rem 1rem; }
  .desktop-only { display: none !important; }
  .hamburger { display: flex; }
  .lang-label { display: none; }

  .nav {
    position: fixed; top: 0; right: -100%; width: 280px; height: 100vh;
    background: var(--bg-secondary); flex-direction: column; align-items: stretch;
    padding: 5rem 1.5rem 2rem; gap: 0.25rem; z-index: 101;
    transition: right 0.3s ease; box-shadow: var(--shadow-xl); overflow-y: auto;
  }
  .nav.open { right: 0; }
  .nav .nav-link { padding: 0.875rem 1rem; font-size: 1rem; border-radius: var(--radius-md); }

  .mobile-auth {
    display: flex; flex-direction: column; gap: 0.25rem;
    margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border-light);
  }
  .mobile-signup {
    background: var(--color-primary-gradient); color: #1a1a2e !important;
    font-weight: 700; text-align: center; text-transform: uppercase;
    letter-spacing: 0.05em; margin-top: 0.5rem;
  }
  .mobile-logout { color: var(--color-error) !important; text-align: left; width: 100%; }

  .mobile-overlay { display: block; pointer-events: none; }
  .mobile-overlay.show { pointer-events: auto; }
}

@media (max-width: 480px) {
  .logo-text { font-size: 1.25rem; }
  .theme-toggle { width: 36px; height: 36px; }
  .lang-toggle { padding: 0.4rem 0.5rem; }
}
</style>
