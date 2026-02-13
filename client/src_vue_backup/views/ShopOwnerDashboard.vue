<!--
  ShopOwnerDashboard.vue

  Dashboard for shop owners to:
    - View aggregated stats (businesses, coupons, usage)
    - Manage their businesses (edit details)
    - Create / edit / delete coupons
    - Back button at bottom of content
-->

<template>
  <div class="shop-owner-dashboard">
    <AppHeader />

    <div class="dashboard-container">
      <div class="container">
        <div class="page-header">
          <h1>🏪 Shop Owner Dashboard</h1>
          <p class="subtitle">Manage your businesses and coupons</p>
        </div>

        <!-- Stats Grid -->
        <div v-if="stats" class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">🏢</div>
            <div class="stat-info">
              <div class="stat-number">{{ stats.totalBusinesses }}</div>
              <div class="stat-label">My Businesses</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">🎟️</div>
            <div class="stat-info">
              <div class="stat-number">{{ stats.totalCoupons }}</div>
              <div class="stat-label">Total Coupons</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">✅</div>
            <div class="stat-info">
              <div class="stat-number">{{ stats.activeCoupons }}</div>
              <div class="stat-label">Active Coupons</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">📊</div>
            <div class="stat-info">
              <div class="stat-number">{{ stats.totalCouponUses }}</div>
              <div class="stat-label">Total Coupon Uses</div>
            </div>
          </div>
        </div>

        <!-- Tab Navigation -->
        <div class="tab-nav">
          <button 
            :class="['tab-btn', { active: activeTab === 'businesses' }]"
            @click="activeTab = 'businesses'"
          >
            🏢 My Businesses
          </button>
          <button 
            :class="['tab-btn', { active: activeTab === 'coupons' }]"
            @click="activeTab = 'coupons'"
          >
            🎟️ Coupons
          </button>
        </div>

        <!-- BUSINESSES TAB -->
        <div v-show="activeTab === 'businesses'">
          <div v-if="loadingBusinesses" class="loading-container">
            <div class="loading-spinner"></div>
            <p>Loading your businesses...</p>
          </div>

          <div v-else-if="businesses.length === 0" class="empty-state">
            <div class="empty-icon">🏢</div>
            <h3>No businesses assigned</h3>
            <p>Contact an administrator to assign businesses to your account.</p>
          </div>

          <div v-else class="businesses-list">
            <div v-for="biz in businesses" :key="biz.id" class="business-row">
              <div class="business-row-image">
                <img :src="biz.photos?.[0] || 'https://via.placeholder.com/120x80'" :alt="biz.name" />
              </div>
              <div class="business-row-info">
                <h3>{{ biz.name }}</h3>
                <p class="biz-category">{{ biz.category?.name_en || 'Uncategorized' }}</p>
                <p class="biz-address">📍 {{ biz.address }}</p>
              </div>
              <div class="business-row-meta">
                <span class="coupon-count">{{ biz.coupons?.length || 0 }} coupons</span>
                <span class="price-badge">{{ biz.price_range }}</span>
              </div>
              <div class="business-row-actions">
                <button class="btn-sm btn-outline" @click="editBusiness(biz)">✏️ Edit</button>
                <router-link :to="`/businesses/${biz.id}`" class="btn-sm btn-primary">👁️ View</router-link>
              </div>
            </div>
          </div>
        </div>

        <!-- COUPONS TAB -->
        <div v-show="activeTab === 'coupons'">
          <div class="section-header">
            <h2>Manage Coupons</h2>
            <button class="btn btn-primary" @click="openCouponModal()">+ Add Coupon</button>
          </div>

          <div v-if="loadingCoupons" class="loading-container">
            <div class="loading-spinner"></div>
            <p>Loading coupons...</p>
          </div>

          <div v-else-if="coupons.length === 0" class="empty-state">
            <div class="empty-icon">🎟️</div>
            <h3>No coupons yet</h3>
            <p>Create your first coupon to attract more customers.</p>
            <button class="btn btn-primary" @click="openCouponModal()">+ Create Coupon</button>
          </div>

          <div v-else class="coupons-table-wrapper">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Title</th>
                  <th>Business</th>
                  <th>Discount</th>
                  <th>Uses</th>
                  <th>Status</th>
                  <th>Expires</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="coupon in coupons" :key="coupon.id">
                  <td><code class="coupon-code">{{ coupon.code }}</code></td>
                  <td>{{ coupon.title }}</td>
                  <td>{{ coupon.business?.name || 'N/A' }}</td>
                  <td>
                    <span class="discount-badge" :class="coupon.discount_type">
                      {{ coupon.discount_type === 'percentage' ? coupon.discount_value + '%' : coupon.discount_type === 'fixed' ? '¥' + coupon.discount_value : '🎁 Freebie' }}
                    </span>
                  </td>
                  <td>{{ coupon.used_count || 0 }} / {{ coupon.max_uses || '∞' }}</td>
                  <td>
                    <span class="status-badge" :class="coupon.is_active ? 'active' : 'inactive'">
                      {{ coupon.is_active ? 'Active' : 'Inactive' }}
                    </span>
                  </td>
                  <td>{{ coupon.end_date ? new Date(coupon.end_date).toLocaleDateString() : 'No expiry' }}</td>
                  <td class="actions-cell">
                    <button class="btn-icon" title="Edit" @click="openCouponModal(coupon)">✏️</button>
                    <button class="btn-icon" title="Toggle" @click="toggleCoupon(coupon)">{{ coupon.is_active ? '⏸️' : '▶️' }}</button>
                    <button class="btn-icon danger" title="Delete" @click="deleteCoupon(coupon)">🗑️</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Edit Business Modal -->
        <div v-if="showBusinessModal" class="modal-overlay" @click.self="showBusinessModal = false">
          <div class="modal-content">
            <div class="modal-header">
              <h2>✏️ Edit Business</h2>
              <button class="modal-close" @click="showBusinessModal = false">✕</button>
            </div>
            <form @submit.prevent="saveBusiness" class="modal-form">
              <div class="form-group">
                <label>Business Name</label>
                <input v-model="editingBusiness.name" type="text" required />
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Description (EN)</label>
                  <textarea v-model="editingBusiness.description_en" rows="3"></textarea>
                </div>
                <div class="form-group">
                  <label>Description (MY)</label>
                  <textarea v-model="editingBusiness.description_my" rows="3"></textarea>
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Phone</label>
                  <input v-model="editingBusiness.phone" type="text" />
                </div>
                <div class="form-group">
                  <label>Website</label>
                  <input v-model="editingBusiness.website" type="text" />
                </div>
              </div>
              <div class="form-group">
                <label>Address</label>
                <input v-model="editingBusiness.address" type="text" />
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Price Range</label>
                  <select v-model="editingBusiness.price_range">
                    <option value="¥">¥ - Budget</option>
                    <option value="¥¥">¥¥ - Moderate</option>
                    <option value="¥¥¥">¥¥¥ - Premium</option>
                    <option value="¥¥¥¥">¥¥¥¥ - Luxury</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Hours</label>
                  <input v-model="editingBusiness.hours" type="text" placeholder="e.g. 9:00-21:00" />
                </div>
              </div>
              <div class="modal-actions">
                <button type="button" class="btn btn-outline" @click="showBusinessModal = false">Cancel</button>
                <button type="submit" class="btn btn-primary" :disabled="savingBusiness">
                  {{ savingBusiness ? 'Saving...' : 'Save Changes' }}
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Coupon Modal -->
        <div v-if="showCouponModal" class="modal-overlay" @click.self="showCouponModal = false">
          <div class="modal-content">
            <div class="modal-header">
              <h2>{{ editingCoupon.id ? '✏️ Edit Coupon' : '➕ New Coupon' }}</h2>
              <button class="modal-close" @click="showCouponModal = false">✕</button>
            </div>
            <form @submit.prevent="saveCoupon" class="modal-form">
              <div class="form-group">
                <label>Business *</label>
                <select v-model="editingCoupon.business_id" required>
                  <option value="">Select business</option>
                  <option v-for="b in businesses" :key="b.id" :value="b.id">{{ b.name }}</option>
                </select>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Coupon Code *</label>
                  <input v-model="editingCoupon.code" type="text" required placeholder="e.g. SAVE20" />
                </div>
                <div class="form-group">
                  <label>Title *</label>
                  <input v-model="editingCoupon.title" type="text" required placeholder="e.g. 20% Off Lunch" />
                </div>
              </div>
              <div class="form-group">
                <label>Description</label>
                <textarea v-model="editingCoupon.description" rows="2" placeholder="Optional coupon description"></textarea>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Discount Type *</label>
                  <select v-model="editingCoupon.discount_type" required>
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (¥)</option>
                    <option value="freebie">Freebie / Gift</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Discount Value</label>
                  <input v-model.number="editingCoupon.discount_value" type="number" min="0" step="0.01" :placeholder="editingCoupon.discount_type === 'percentage' ? 'e.g. 20' : 'e.g. 500'" />
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Min Purchase (¥)</label>
                  <input v-model.number="editingCoupon.min_purchase" type="number" min="0" step="0.01" placeholder="Optional" />
                </div>
                <div class="form-group">
                  <label>Max Uses</label>
                  <input v-model.number="editingCoupon.max_uses" type="number" min="0" placeholder="Leave empty for unlimited" />
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Start Date</label>
                  <input v-model="editingCoupon.start_date" type="date" />
                </div>
                <div class="form-group">
                  <label>End Date</label>
                  <input v-model="editingCoupon.end_date" type="date" />
                </div>
              </div>
              <div class="form-group checkbox-group">
                <label>
                  <input v-model="editingCoupon.is_active" type="checkbox" />
                  <span>Active</span>
                </label>
              </div>
              <div class="modal-actions">
                <button type="button" class="btn btn-outline" @click="showCouponModal = false">Cancel</button>
                <button type="submit" class="btn btn-primary" :disabled="savingCoupon">
                  {{ savingCoupon ? 'Saving...' : editingCoupon.id ? 'Update Coupon' : 'Create Coupon' }}
                </button>
              </div>
            </form>
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
 * ShopOwnerDashboard script
 *
 * Loads the shop owner’s businesses, coupons, and stats.
 * Provides CRUD modals for editing business details and managing coupons.
 */
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '../components/layout/AppHeader.vue'
import { getOwnerStats, getMyBusinesses, updateMyBusiness } from '../services/shopOwnerService'
import { getMyCoupons, createCoupon, updateCoupon, deleteCoupon as deleteCouponApi } from '../services/couponService'

const router = useRouter()

/* ---------- Tab & Stats ---------- */
const activeTab  = ref('businesses')
const stats      = ref(null)
const businesses = ref([])
const coupons    = ref([])
const loadingBusinesses = ref(true)
const loadingCoupons    = ref(true)

/* ---------- Business editing ---------- */
const showBusinessModal = ref(false)
const savingBusiness    = ref(false)
const editingBusiness   = ref({})

/* ---------- Coupon editing ---------- */
const showCouponModal = ref(false)
const savingCoupon    = ref(false)
const editingCoupon   = ref({
  business_id: '',
  code: '',
  title: '',
  description: '',
  discount_type: 'percentage',
  discount_value: 0,
  min_purchase: null,
  max_uses: null,
  start_date: '',
  end_date: '',
  is_active: true
})

/* ---------- Navigation ---------- */

/** Navigate back or fall back to home */
const goBack = () => {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/')
  }
}

onMounted(async () => {
  await Promise.all([
    loadStats(),
    loadBusinesses(),
    loadCoupons()
  ])
})

async function loadStats() {
  try {
    const res = await getOwnerStats()
    stats.value = res.data
  } catch (err) {
    console.error('Error loading stats:', err)
  }
}

async function loadBusinesses() {
  loadingBusinesses.value = true
  try {
    const res = await getMyBusinesses()
    businesses.value = res.data.businesses || res.data || []
  } catch (err) {
    console.error('Error loading businesses:', err)
  } finally {
    loadingBusinesses.value = false
  }
}

async function loadCoupons() {
  loadingCoupons.value = true
  try {
    const res = await getMyCoupons()
    coupons.value = res.data.coupons || res.data || []
  } catch (err) {
    console.error('Error loading coupons:', err)
  } finally {
    loadingCoupons.value = false
  }
}

// Business editing
function editBusiness(biz) {
  editingBusiness.value = { ...biz }
  showBusinessModal.value = true
}

async function saveBusiness() {
  savingBusiness.value = true
  try {
    await updateMyBusiness(editingBusiness.value.id, {
      name: editingBusiness.value.name,
      description_en: editingBusiness.value.description_en,
      description_my: editingBusiness.value.description_my,
      phone: editingBusiness.value.phone,
      website: editingBusiness.value.website,
      address: editingBusiness.value.address,
      price_range: editingBusiness.value.price_range,
      hours: editingBusiness.value.hours
    })
    showBusinessModal.value = false
    await loadBusinesses()
    await loadStats()
  } catch (err) {
    alert('Failed to save business: ' + (err.response?.data?.message || err.message))
  } finally {
    savingBusiness.value = false
  }
}

// Coupon management
function openCouponModal(coupon = null) {
  if (coupon) {
    editingCoupon.value = {
      ...coupon,
      start_date: coupon.start_date ? coupon.start_date.split('T')[0] : '',
      end_date: coupon.end_date ? coupon.end_date.split('T')[0] : ''
    }
  } else {
    editingCoupon.value = {
      business_id: businesses.value[0]?.id || '',
      code: '',
      title: '',
      description: '',
      discount_type: 'percentage',
      discount_value: 0,
      min_purchase: null,
      max_uses: null,
      start_date: '',
      end_date: '',
      is_active: true
    }
  }
  showCouponModal.value = true
}

async function saveCoupon() {
  savingCoupon.value = true
  try {
    const data = { ...editingCoupon.value }
    if (!data.start_date) delete data.start_date
    if (!data.end_date) delete data.end_date
    if (!data.min_purchase) delete data.min_purchase
    if (!data.max_uses) delete data.max_uses

    if (data.id) {
      await updateCoupon(data.id, data)
    } else {
      await createCoupon(data)
    }
    showCouponModal.value = false
    await loadCoupons()
    await loadStats()
  } catch (err) {
    alert('Failed to save coupon: ' + (err.response?.data?.message || err.message))
  } finally {
    savingCoupon.value = false
  }
}

async function toggleCoupon(coupon) {
  try {
    await updateCoupon(coupon.id, { is_active: !coupon.is_active })
    await loadCoupons()
    await loadStats()
  } catch (err) {
    alert('Failed to toggle coupon: ' + (err.response?.data?.message || err.message))
  }
}

async function deleteCoupon(coupon) {
  if (!confirm(`Delete coupon "${coupon.code}"? This cannot be undone.`)) return
  try {
    await deleteCouponApi(coupon.id)
    await loadCoupons()
    await loadStats()
  } catch (err) {
    alert('Failed to delete coupon: ' + (err.response?.data?.message || err.message))
  }
}
</script>

<style scoped>
.shop-owner-dashboard {
  min-height: 100vh;
  background: var(--bg-primary);
}

.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.dashboard-container {
  padding: 2rem 0 5rem;
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

.page-header {
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 2rem;
  color: var(--text-primary);
  font-weight: 700;
  margin-bottom: 0.25rem;
}

.page-header .subtitle {
  color: var(--text-secondary);
  font-size: 1rem;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.25rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: var(--bg-card);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all var(--transition-base);
}

.stat-card:hover {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-md);
}

.stat-icon {
  font-size: 2rem;
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-primary-light);
  border-radius: var(--radius-md);
}

.stat-number {
  font-size: 1.75rem;
  font-weight: 800;
  color: var(--text-primary);
}

.stat-label {
  font-size: 0.8125rem;
  color: var(--text-secondary);
  font-weight: 500;
}

/* Tabs */
.tab-nav {
  display: flex;
  gap: 0.5rem;
  border-bottom: 1px solid var(--border-light);
  margin-bottom: 2rem;
}

.tab-btn {
  padding: 0.75rem 1.5rem;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  color: var(--text-secondary);
  font-weight: 600;
  font-size: 0.9375rem;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.tab-btn:hover {
  color: var(--text-primary);
}

.tab-btn.active {
  color: var(--color-primary);
  border-bottom-color: var(--color-primary);
}

/* Section Header */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-header h2 {
  font-size: 1.25rem;
  color: var(--text-primary);
  font-weight: 700;
}

/* Buttons */
.btn {
  padding: 0.625rem 1.5rem;
  border-radius: var(--radius-sm);
  font-weight: 700;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all var(--transition-fast);
  border: none;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.btn-primary {
  background: var(--color-primary-gradient);
  color: #1a1a2e;
}

.btn-primary:hover {
  box-shadow: var(--shadow-glow);
  transform: translateY(-1px);
}

.btn-outline {
  background: transparent;
  color: var(--text-secondary);
  border: 1px solid var(--border-light);
}

.btn-outline:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.btn-sm {
  padding: 0.375rem 0.875rem;
  border-radius: var(--radius-sm);
  font-weight: 600;
  font-size: 0.8125rem;
  cursor: pointer;
  transition: all var(--transition-fast);
  border: none;
  text-decoration: none;
  display: inline-block;
}

.btn-sm.btn-primary {
  background: var(--color-primary-gradient);
  color: #1a1a2e;
}

.btn-sm.btn-outline {
  background: transparent;
  color: var(--text-secondary);
  border: 1px solid var(--border-light);
}

.btn-sm.btn-outline:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.btn-icon {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  padding: 0.25rem;
  transition: transform var(--transition-fast);
}

.btn-icon:hover { transform: scale(1.15); }
.btn-icon.danger:hover { filter: brightness(1.3); }

/* Loading / Empty */
.loading-container {
  text-align: center;
  padding: 4rem 1rem;
}

.loading-spinner {
  width: 40px;
  height: 40px;
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

.empty-state {
  text-align: center;
  padding: 4rem 1rem;
  background: var(--bg-card);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.empty-state h3 {
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
}

/* Business List */
.businesses-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.business-row {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 1.25rem;
  background: var(--bg-card);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  transition: all var(--transition-base);
}

.business-row:hover {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-sm);
}

.business-row-image {
  width: 120px;
  height: 80px;
  border-radius: var(--radius-md);
  overflow: hidden;
  flex-shrink: 0;
}

.business-row-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.business-row-info {
  flex: 1;
  min-width: 0;
}

.business-row-info h3 {
  font-size: 1.0625rem;
  color: var(--text-primary);
  font-weight: 700;
  margin-bottom: 0.25rem;
}

.biz-category {
  font-size: 0.8125rem;
  color: var(--color-primary);
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.biz-address {
  font-size: 0.8125rem;
  color: var(--text-secondary);
}

.business-row-meta {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: flex-end;
  flex-shrink: 0;
}

.coupon-count {
  font-size: 0.75rem;
  color: var(--text-secondary);
  background: var(--bg-tertiary);
  padding: 0.25rem 0.625rem;
  border-radius: var(--radius-full);
  font-weight: 500;
}

.price-badge {
  font-size: 0.8125rem;
  font-weight: 700;
  color: var(--color-primary);
}

.business-row-actions {
  display: flex;
  gap: 0.5rem;
  flex-shrink: 0;
}

/* Data Table */
.coupons-table-wrapper {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  background: var(--bg-card);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.data-table th,
.data-table td {
  padding: 0.875rem 1rem;
  text-align: left;
  border-bottom: 1px solid var(--border-light);
  white-space: nowrap;
}

.data-table th {
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
}

.data-table td {
  font-size: 0.875rem;
  color: var(--text-primary);
}

.coupon-code {
  font-family: monospace;
  background: var(--bg-tertiary);
  padding: 0.2rem 0.5rem;
  border-radius: var(--radius-sm);
  font-weight: 700;
  font-size: 0.8125rem;
  color: var(--color-primary);
}

.discount-badge {
  display: inline-block;
  padding: 0.2rem 0.625rem;
  border-radius: var(--radius-full);
  font-weight: 700;
  font-size: 0.75rem;
}

.discount-badge.percentage { background: rgba(39, 174, 96, 0.15); color: #27ae60; }
.discount-badge.fixed { background: rgba(52, 152, 219, 0.15); color: #3498db; }
.discount-badge.freebie { background: rgba(243, 156, 18, 0.15); color: #f39c12; }

.status-badge {
  display: inline-block;
  padding: 0.2rem 0.625rem;
  border-radius: var(--radius-full);
  font-weight: 700;
  font-size: 0.75rem;
}

.status-badge.active { background: rgba(39, 174, 96, 0.15); color: #27ae60; }
.status-badge.inactive { background: rgba(231, 76, 60, 0.15); color: #e74c3c; }

.actions-cell {
  display: flex;
  gap: 0.25rem;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: var(--bg-card);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  width: 100%;
  max-width: 640px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: var(--shadow-lg);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--border-light);
}

.modal-header h2 {
  font-size: 1.25rem;
  color: var(--text-primary);
  font-weight: 700;
}

.modal-close {
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 1.25rem;
  cursor: pointer;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
}

.modal-close:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.modal-form {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 0.375rem;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 0.625rem 0.875rem;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  font-size: 0.9375rem;
  transition: border-color var(--transition-fast);
  font-family: inherit;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--color-primary);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.checkbox-group label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  text-transform: none;
  letter-spacing: normal;
  font-size: 0.9375rem;
  color: var(--text-primary);
}

.checkbox-group input[type="checkbox"] {
  width: auto;
  accent-color: var(--color-primary);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-light);
  margin-top: 0.5rem;
}

/* Responsive */
@media (max-width: 1024px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
  }

  .stat-card {
    padding: 1rem;
  }

  .stat-icon {
    width: 44px;
    height: 44px;
    font-size: 1.5rem;
  }

  .stat-number {
    font-size: 1.375rem;
  }

  .tab-nav {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    gap: 0;
  }

  .tab-btn {
    padding: 0.625rem 1rem;
    font-size: 0.8125rem;
    white-space: nowrap;
  }

  .business-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .business-row-image {
    width: 100%;
    height: 160px;
  }

  .business-row-meta {
    flex-direction: row;
    align-items: center;
    width: 100%;
  }

  .business-row-actions {
    width: 100%;
  }

  .business-row-actions .btn-sm {
    flex: 1;
    text-align: center;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .modal-content {
    max-width: 100%;
    margin: 0;
    border-radius: var(--radius-md);
  }

  .page-header h1 {
    font-size: 1.5rem;
  }

  .data-table th,
  .data-table td {
    padding: 0.625rem 0.75rem;
    font-size: 0.8125rem;
  }
}

@media (max-width: 480px) {
  .dashboard-container {
    padding: 1rem 0 3rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .page-header h1 {
    font-size: 1.25rem;
  }

  .modal-form {
    padding: 1rem;
  }
}
</style>
