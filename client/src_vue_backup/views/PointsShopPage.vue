<template>
  <div class="points-shop-page">
    <AppHeader />

    <section class="shop-hero">
      <div class="shop-hero-content">
        <span class="shop-badge">🪙 {{ $t('pointsShop.badge') }}</span>
        <h1 class="shop-title">
          {{ $t('pointsShop.title') }} <span class="text-gold">{{ $t('pointsShop.titleHighlight') }}</span>
        </h1>
        <p class="shop-subtitle">{{ $t('pointsShop.subtitle') }}</p>
      </div>
    </section>

    <section class="shop-main">
      <div class="shop-container">

        <!-- Points Balance Card -->
        <div class="balance-card" v-if="authStore.isAuthenticated">
          <div class="balance-left">
            <span class="balance-icon">🪙</span>
            <div class="balance-info">
              <span class="balance-label">{{ $t('pointsShop.yourPoints') }}</span>
              <span class="balance-amount">{{ userPoints }}</span>
            </div>
          </div>
          <router-link to="/learn-japanese" class="earn-more-btn">
            🎌 {{ $t('pointsShop.earnMore') }}
          </router-link>
        </div>

        <!-- Not Logged In -->
        <div v-if="!authStore.isAuthenticated" class="login-prompt">
          <p>{{ $t('pointsShop.loginRequired') }}</p>
          <router-link to="/login" class="btn-login">{{ $t('nav.login') }}</router-link>
        </div>

        <!-- Tabs -->
        <div v-if="authStore.isAuthenticated" class="tab-bar">
          <button class="tab-btn" :class="{ active: activeTab === 'shop' }" @click="activeTab = 'shop'">
            🛍️ {{ $t('pointsShop.shopTab') }}
          </button>
          <button class="tab-btn" :class="{ active: activeTab === 'my-coupons' }" @click="activeTab = 'my-coupons'; loadMyCoupons()">
            🎟️ {{ $t('pointsShop.myCouponsTab') }}
          </button>
        </div>

        <!-- SHOP TAB -->
        <div v-if="authStore.isAuthenticated && activeTab === 'shop'" class="shop-panel">
          <div v-if="shopLoading" class="loading">
            <div class="loading-spinner"></div>
            <span>{{ $t('common.loading') }}</span>
          </div>

          <div v-else-if="coupons.length === 0" class="empty-state">
            <span class="empty-icon">🛍️</span>
            <h3>{{ $t('pointsShop.noCoupons') }}</h3>
            <p>{{ $t('pointsShop.noCouponsDesc') }}</p>
          </div>

          <div v-else class="coupons-grid">
            <div v-for="coupon in coupons" :key="coupon.id" class="coupon-card" :class="{ 'can-afford': userPoints >= coupon.points_cost }">
              <div class="coupon-header">
                <span class="coupon-shop">{{ coupon.business?.name || 'Shop' }}</span>
                <span class="coupon-discount">
                  <template v-if="coupon.discount_type === 'percentage'">{{ coupon.discount_value }}% OFF</template>
                  <template v-else-if="coupon.discount_type === 'fixed'">${{ coupon.discount_value }} OFF</template>
                  <template v-else>🎁 {{ $t('pointsShop.freebie') }}</template>
                </span>
              </div>
              <h3 class="coupon-title">{{ coupon.title }}</h3>
              <p class="coupon-desc" v-if="coupon.description">{{ coupon.description }}</p>
              <div class="coupon-footer">
                <div class="coupon-cost">
                  <span class="cost-icon">🪙</span>
                  <span class="cost-amount">{{ coupon.points_cost }}</span>
                  <span class="cost-label">{{ $t('pointsShop.points') }}</span>
                </div>
                <button
                  class="btn-redeem"
                  :disabled="userPoints < coupon.points_cost || redeeming"
                  @click="redeemCoupon(coupon)"
                >
                  {{ redeeming && redeemingId === coupon.id ? $t('pointsShop.redeeming') : $t('pointsShop.redeem') }}
                </button>
              </div>
              <div v-if="coupon.end_date" class="coupon-expiry">
                {{ $t('pointsShop.expires') }}: {{ formatDate(coupon.end_date) }}
              </div>
            </div>
          </div>
        </div>

        <!-- MY COUPONS TAB -->
        <div v-if="authStore.isAuthenticated && activeTab === 'my-coupons'" class="my-coupons-panel">
          <div v-if="myCouponsLoading" class="loading">
            <div class="loading-spinner"></div>
            <span>{{ $t('common.loading') }}</span>
          </div>

          <div v-else-if="myCoupons.length === 0" class="empty-state">
            <span class="empty-icon">🎟️</span>
            <h3>{{ $t('pointsShop.noRedeemed') }}</h3>
            <p>{{ $t('pointsShop.noRedeemedDesc') }}</p>
            <button class="btn-primary" @click="activeTab = 'shop'">{{ $t('pointsShop.browseShop') }}</button>
          </div>

          <div v-else class="my-coupons-list">
            <div v-for="uc in myCoupons" :key="uc.id" class="my-coupon-card" :class="{ 'is-used': uc.is_used }">
              <div class="my-coupon-left">
                <div class="my-coupon-discount">
                  <template v-if="uc.coupon?.discount_type === 'percentage'">{{ uc.coupon.discount_value }}%</template>
                  <template v-else-if="uc.coupon?.discount_type === 'fixed'">${{ uc.coupon.discount_value }}</template>
                  <template v-else>🎁</template>
                </div>
              </div>
              <div class="my-coupon-info">
                <h4>{{ uc.coupon?.title || 'Coupon' }}</h4>
                <p class="my-coupon-shop">{{ uc.coupon?.business?.name || 'Shop' }}</p>
                <p class="my-coupon-code">{{ $t('pointsShop.code') }}: <strong>{{ uc.coupon?.code }}</strong></p>
                <p class="my-coupon-date">{{ $t('pointsShop.redeemed') }}: {{ formatDate(uc.redeemed_at) }}</p>
              </div>
              <div class="my-coupon-actions">
                <span v-if="uc.is_used" class="used-badge">✓ {{ $t('pointsShop.used') }}</span>
                <button v-else class="btn-use" @click="markUsed(uc)">{{ $t('pointsShop.markUsed') }}</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Success Modal -->
        <Transition name="modal">
          <div v-if="showSuccess" class="modal-overlay" @click="showSuccess = false">
            <div class="modal-card success-modal" @click.stop>
              <div class="success-icon">🎉</div>
              <h2>{{ $t('pointsShop.redeemSuccess') }}</h2>
              <p>{{ $t('pointsShop.redeemSuccessDesc') }}</p>
              <div class="redeemed-coupon-info" v-if="redeemedCoupon">
                <p class="rc-title">{{ redeemedCoupon.coupon?.title }}</p>
                <p class="rc-code">{{ $t('pointsShop.code') }}: <strong>{{ redeemedCoupon.coupon?.code }}</strong></p>
                <p class="rc-shop">{{ redeemedCoupon.coupon?.business?.name }}</p>
              </div>
              <button class="btn-primary" @click="showSuccess = false; activeTab = 'my-coupons'; loadMyCoupons()">
                {{ $t('pointsShop.viewMyCoupons') }}
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </section>

    <footer class="shop-footer">
      <p>{{ $t('footer.copyright') }}</p>
    </footer>
  </div>
</template>

<script setup>
/**
 * PointsShopPage script
 *
 * Tabs:
 *   - Shop: browse & redeem coupons with points
 *   - My Coupons: view previously redeemed coupons
 */
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../store/auth'
import api from '../services/api'
import AppHeader from '../components/layout/AppHeader.vue'

const { t } = useI18n()
const authStore = useAuthStore()

/* ---------- Tab & Points ---------- */
const activeTab  = ref('shop')
const userPoints = ref(authStore.user?.points || 0)

/* ---------- Shop ---------- */
const coupons     = ref([])
const shopLoading = ref(false)
const redeeming   = ref(false)
const redeemingId = ref(null)

/* ---------- My Coupons ---------- */
const myCoupons        = ref([])
const myCouponsLoading = ref(false)

/* ---------- Redeem Success ---------- */
const showSuccess    = ref(false)
const redeemedCoupon = ref(null)

onMounted(async () => {
  if (authStore.isAuthenticated) {
    await loadShop()
  }
})

async function loadShop() {
  shopLoading.value = true
  try {
    const res = await api.get('/points/shop')
    coupons.value = res.data.data || []
    userPoints.value = res.data.userPoints || 0
  } catch (err) {
    console.error('Failed to load shop:', err)
  } finally {
    shopLoading.value = false
  }
}

async function loadMyCoupons() {
  myCouponsLoading.value = true
  try {
    const res = await api.get('/points/my-coupons')
    myCoupons.value = res.data.data || []
  } catch (err) {
    console.error('Failed to load my coupons:', err)
  } finally {
    myCouponsLoading.value = false
  }
}

async function redeemCoupon(coupon) {
  if (redeeming.value) return
  redeeming.value = true
  redeemingId.value = coupon.id
  try {
    const res = await api.post('/points/redeem', { coupon_id: coupon.id })
    redeemedCoupon.value = res.data.data
    userPoints.value = res.data.data.remaining_points
    // Update store
    if (authStore.user) {
      authStore.user.points = res.data.data.remaining_points
      localStorage.setItem('user', JSON.stringify(authStore.user))
    }
    showSuccess.value = true
    await loadShop() // Refresh shop
  } catch (err) {
    console.error('Redeem error:', err)
    alert(err.response?.data?.message || 'Failed to redeem coupon')
  } finally {
    redeeming.value = false
    redeemingId.value = null
  }
}

async function markUsed(uc) {
  try {
    await api.post(`/points/use-coupon/${uc.id}`)
    uc.is_used = true
    uc.used_at = new Date().toISOString()
  } catch (err) {
    console.error('Mark used error:', err)
    alert(err.response?.data?.message || 'Failed to mark coupon as used')
  }
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
</script>

<style scoped>
.points-shop-page {
  min-height: 100vh;
  background: var(--bg-primary);
}

/* Hero */
.shop-hero {
  padding: 5rem 1.5rem 2rem;
  text-align: center;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
}

.shop-hero-content {
  max-width: 600px;
  margin: 0 auto;
}

.shop-badge {
  display: inline-block;
  padding: 0.35rem 1rem;
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  color: #92400e;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.shop-title {
  font-size: 2rem;
  font-weight: 900;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.text-gold {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.shop-subtitle {
  color: var(--text-secondary);
  font-size: 1rem;
}

/* Main Content */
.shop-main {
  padding: 2rem 1.5rem;
}

.shop-container {
  max-width: 900px;
  margin: 0 auto;
}

/* Balance Card */
.balance-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  border: 2px solid #f59e0b;
  border-radius: 16px;
  padding: 1.25rem 1.5rem;
  margin-bottom: 2rem;
}

.balance-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.balance-icon {
  font-size: 2.5rem;
}

.balance-info {
  display: flex;
  flex-direction: column;
}

.balance-label {
  font-size: 0.8rem;
  color: #92400e;
  font-weight: 600;
}

.balance-amount {
  font-size: 2rem;
  font-weight: 900;
  color: #78350f;
}

.earn-more-btn {
  background: #92400e;
  color: white;
  padding: 0.6rem 1.2rem;
  border-radius: 10px;
  text-decoration: none;
  font-weight: 700;
  font-size: 0.85rem;
  transition: background 0.2s;
}

.earn-more-btn:hover {
  background: #78350f;
}

/* Login Prompt */
.login-prompt {
  text-align: center;
  padding: 3rem;
  background: var(--bg-secondary);
  border-radius: 16px;
  border: 1px solid var(--border-color);
}

.login-prompt p {
  color: var(--text-secondary);
  margin-bottom: 1rem;
}

.btn-login {
  background: var(--color-primary);
  color: white;
  padding: 0.6rem 2rem;
  border-radius: 10px;
  text-decoration: none;
  font-weight: 700;
}

/* Tabs */
.tab-bar {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 0.35rem;
  border: 1px solid var(--border-color);
}

.tab-btn {
  flex: 1;
  padding: 0.75rem;
  border: none;
  background: transparent;
  border-radius: 10px;
  font-weight: 700;
  font-size: 0.9rem;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
}

.tab-btn.active {
  background: var(--bg-primary);
  color: var(--text-primary);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* Coupons Grid */
.coupons-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.coupon-card {
  background: var(--bg-secondary);
  border: 2px solid var(--border-color);
  border-radius: 16px;
  padding: 1.5rem;
  transition: all 0.2s;
  opacity: 0.6;
}

.coupon-card.can-afford {
  opacity: 1;
  border-color: #f59e0b;
}

.coupon-card.can-afford:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(245, 158, 11, 0.15);
}

.coupon-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.coupon-shop {
  font-size: 0.75rem;
  color: var(--text-tertiary);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.coupon-discount {
  background: linear-gradient(135deg, #dc2626, #ef4444);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 800;
}

.coupon-title {
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.coupon-desc {
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-bottom: 1rem;
  line-height: 1.4;
}

.coupon-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.coupon-cost {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.cost-icon {
  font-size: 1.25rem;
}

.cost-amount {
  font-size: 1.25rem;
  font-weight: 900;
  color: #92400e;
}

.cost-label {
  font-size: 0.75rem;
  color: var(--text-tertiary);
}

.btn-redeem {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 10px;
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-redeem:hover:not(:disabled) {
  transform: scale(1.02);
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
}

.btn-redeem:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.coupon-expiry {
  margin-top: 0.75rem;
  font-size: 0.75rem;
  color: var(--text-tertiary);
}

/* My Coupons */
.my-coupons-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.my-coupon-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: var(--bg-secondary);
  border: 2px solid var(--border-color);
  border-radius: 14px;
  padding: 1.25rem;
  transition: all 0.2s;
}

.my-coupon-card.is-used {
  opacity: 0.5;
}

.my-coupon-left {
  flex-shrink: 0;
}

.my-coupon-discount {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #dc2626, #ef4444);
  color: white;
  border-radius: 12px;
  font-weight: 900;
  font-size: 1.1rem;
}

.my-coupon-info {
  flex: 1;
}

.my-coupon-info h4 {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.my-coupon-shop {
  font-size: 0.8rem;
  color: var(--text-tertiary);
  margin-bottom: 0.25rem;
}

.my-coupon-code {
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.my-coupon-code strong {
  color: var(--color-primary);
  letter-spacing: 1px;
}

.my-coupon-date {
  font-size: 0.75rem;
  color: var(--text-tertiary);
  margin-top: 0.25rem;
}

.my-coupon-actions {
  flex-shrink: 0;
}

.used-badge {
  background: #dcfce7;
  color: #16a34a;
  padding: 0.4rem 1rem;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.8rem;
}

.btn-use {
  background: var(--color-primary);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-use:hover {
  opacity: 0.9;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 3rem 1rem;
}

.empty-icon {
  font-size: 3rem;
  display: block;
  margin-bottom: 1rem;
}

.empty-state h3 {
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: var(--text-secondary);
  margin-bottom: 1rem;
}

.btn-primary {
  background: var(--color-primary);
  color: white;
  border: none;
  padding: 0.6rem 1.5rem;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary:hover {
  opacity: 0.9;
}

/* Loading */
.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 3rem;
  color: var(--text-secondary);
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--border-color);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Success Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 1rem;
}

.modal-card {
  background: var(--bg-primary);
  border-radius: 20px;
  padding: 2.5rem;
  max-width: 420px;
  width: 100%;
  text-align: center;
}

.success-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.success-modal h2 {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.success-modal p {
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
}

.redeemed-coupon-info {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1.5rem;
}

.rc-title {
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.35rem;
}

.rc-code {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.rc-code strong {
  color: var(--color-primary);
  letter-spacing: 2px;
  font-size: 1.1rem;
}

.rc-shop {
  font-size: 0.8rem;
  color: var(--text-tertiary);
  margin-top: 0.35rem;
}

/* Modal Transition */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s;
}
.modal-enter-active .modal-card,
.modal-leave-active .modal-card {
  transition: transform 0.3s;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-from .modal-card {
  transform: scale(0.9) translateY(20px);
}
.modal-leave-to .modal-card {
  transform: scale(0.9) translateY(20px);
}

/* Footer */
.shop-footer {
  text-align: center;
  padding: 2rem;
  color: var(--text-tertiary);
  font-size: 0.8rem;
  border-top: 1px solid var(--border-color);
}

/* Responsive */
@media (max-width: 640px) {
  .shop-title { font-size: 1.5rem; }
  .balance-card {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  .balance-left { flex-direction: column; }
  .coupons-grid { grid-template-columns: 1fr; }
  .my-coupon-card {
    flex-direction: column;
    text-align: center;
  }
}
</style>
