/**
 * Vue Router Configuration
 *
 * Defines all application routes with lazy-loaded views.
 * Includes a navigation guard for auth-protected pages.
 *
 * Base path: /suteki/  (GitHub Pages sub-directory)
 */

import { createRouter, createWebHistory } from 'vue-router'

/* ============================
 *  Route Definitions
 * ============================ */
const routes = [
  /* --- Public pages --- */
  { path: '/',                   name: 'Home',          component: () => import('../views/HomePage.vue') },
  { path: '/explore',            name: 'Explore',       component: () => import('../views/ExplorePage.vue') },
  { path: '/categories/:slug',   name: 'CategoryList',  component: () => import('../views/CategoryListPage.vue') },
  { path: '/categories',         name: 'Categories',    redirect: '/explore' },
  { path: '/businesses/:id',     name: 'BusinessDetail', component: () => import('../views/BusinessDetailPage.vue') },
  { path: '/login',              name: 'Login',         component: () => import('../views/LoginPage.vue') },
  { path: '/register',           name: 'Register',      component: () => import('../views/RegisterPage.vue') },
  { path: '/about-japan',        name: 'About',         component: () => import('../views/AboutJapan.vue') },
  { path: '/contact',            name: 'Contact',       component: () => import('../views/ContactPage.vue') },
  { path: '/faq',                name: 'FAQ',           component: () => import('../views/FAQPage.vue') },
  { path: '/premium',            name: 'Premium',       component: () => import('../views/PremiumPage.vue') },

  /* --- Auth-protected pages --- */
  { path: '/dashboard',          name: 'Dashboard',          component: () => import('../views/UserDashboard.vue'),        meta: { requiresAuth: true } },
  { path: '/admin',              name: 'AdminDashboard',     component: () => import('../views/AdminDashboard.vue'),       meta: { requiresAuth: true, requiresAdmin: true } },
  { path: '/shop-owner',         name: 'ShopOwnerDashboard', component: () => import('../views/ShopOwnerDashboard.vue'),   meta: { requiresAuth: true } },
  { path: '/favorites',          name: 'Favorites',          component: () => import('../views/FavoritesPage.vue'),       meta: { requiresAuth: true } },
  { path: '/profile/settings',   name: 'ProfileSettings',    component: () => import('../views/ProfileSettings.vue'),     meta: { requiresAuth: true } },
  { path: '/learn-japanese',     name: 'LearnJapanese',      component: () => import('../views/JLPTQuizPage.vue'),        meta: { requiresAuth: true } },
  { path: '/points-shop',        name: 'PointsShop',         component: () => import('../views/PointsShopPage.vue'),      meta: { requiresAuth: true } }
]

/* ============================
 *  Router Instance
 * ============================ */
const router = createRouter({
  history: createWebHistory('/suteki/'),
  routes,
  scrollBehavior(_to, _from, savedPosition) {
    // Restore scroll on back/forward, else scroll to top
    return savedPosition || { top: 0 }
  }
})

/* ============================
 *  Navigation Guard
 * ============================ */
router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem('token')

  // Redirect unauthenticated users to login, preserving the intended destination
  if (to.meta.requiresAuth && !token) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
  } else {
    next()
  }
})

export default router
