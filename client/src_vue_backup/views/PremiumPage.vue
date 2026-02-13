<template>
  <div class="premium-page">
    <AppHeader />

    <section class="premium-hero">
      <div class="hero-content">
        <span class="premium-badge">⭐ {{ $t('premium.badge') }}</span>
        <h1 class="premium-title">
          {{ $t('premium.title') }} <span class="text-gold">{{ $t('premium.titleHighlight') }}</span>
        </h1>
        <p class="premium-subtitle">{{ $t('premium.subtitle') }}</p>
      </div>
    </section>

    <section class="pricing-section">
      <div class="pricing-container">

        <!-- Already Premium -->
        <div v-if="authStore.user?.is_premium" class="already-premium">
          <div class="premium-active-card">
            <div class="active-icon">🎌</div>
            <h2>{{ $t('premium.alreadyPremium') }}</h2>
            <p>{{ $t('premium.enjoyFeatures') }}</p>
            <div class="plan-badge-active">
              {{ authStore.user.premium_type === 'monthly' ? $t('premium.monthlyPlan') : $t('premium.lifetimePlan') }}
            </div>
            <router-link to="/learn-japanese" class="btn-primary-lg">
              {{ $t('premium.goToLearning') }}
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M4 10H16M16 10L11 5M16 10L11 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </router-link>
          </div>
        </div>

        <!-- Pricing Cards -->
        <div v-else class="pricing-grid">
          <!-- Monthly Plan -->
          <div class="pricing-card">
            <div class="plan-header">
              <span class="plan-icon">📅</span>
              <h3>{{ $t('premium.monthlyPlan') }}</h3>
              <p class="plan-desc">{{ $t('premium.monthlyDesc') }}</p>
            </div>
            <div class="plan-price">
              <span class="price-currency">$</span>
              <span class="price-amount">4.99</span>
              <span class="price-period">/{{ $t('premium.month') }}</span>
            </div>
            <ul class="plan-features">
              <li><span class="check">✓</span> {{ $t('premium.feature1') }}</li>
              <li><span class="check">✓</span> {{ $t('premium.feature2') }}</li>
              <li><span class="check">✓</span> {{ $t('premium.feature3') }}</li>
              <li><span class="check">✓</span> {{ $t('premium.feature4') }}</li>
              <li class="muted"><span class="x">✗</span> {{ $t('premium.feature5') }}</li>
            </ul>
            <button class="btn-plan monthly" @click="selectPlan('monthly')" :disabled="purchasing">
              {{ purchasing && selectedPlan === 'monthly' ? $t('premium.processing') : $t('premium.getMonthly') }}
            </button>
          </div>

          <!-- Lifetime Plan -->
          <div class="pricing-card featured">
            <div class="popular-tag">🔥 {{ $t('premium.mostPopular') }}</div>
            <div class="plan-header">
              <span class="plan-icon">♾️</span>
              <h3>{{ $t('premium.lifetimePlan') }}</h3>
              <p class="plan-desc">{{ $t('premium.lifetimeDesc') }}</p>
            </div>
            <div class="plan-price">
              <span class="price-currency">$</span>
              <span class="price-amount">29.99</span>
              <span class="price-period">{{ $t('premium.oneTime') }}</span>
            </div>
            <ul class="plan-features">
              <li><span class="check">✓</span> {{ $t('premium.feature1') }}</li>
              <li><span class="check">✓</span> {{ $t('premium.feature2') }}</li>
              <li><span class="check">✓</span> {{ $t('premium.feature3') }}</li>
              <li><span class="check">✓</span> {{ $t('premium.feature4') }}</li>
              <li><span class="check gold">✓</span> {{ $t('premium.feature5') }}</li>
            </ul>
            <button class="btn-plan lifetime" @click="selectPlan('lifetime')" :disabled="purchasing">
              {{ purchasing && selectedPlan === 'lifetime' ? $t('premium.processing') : $t('premium.getLifetime') }}
            </button>
          </div>
        </div>

        <!-- Payment Modal -->
        <Transition name="modal">
          <div v-if="showPaymentModal" class="modal-overlay" @click.self="closePayment">
            <div class="payment-modal">
              <button class="modal-close" @click="closePayment">&times;</button>
              <div class="modal-header">
                <h2>{{ $t('premium.completePayment') }}</h2>
                <p>{{ selectedPlan === 'monthly' ? $t('premium.monthlyPlan') + ' — $4.99/mo' : $t('premium.lifetimePlan') + ' — $29.99' }}</p>
              </div>

              <div class="payment-methods">
                <h3>{{ $t('premium.paymentMethod') }}</h3>
                <div class="method-options">
                  <button class="method-btn" :class="{ active: paymentMethod === 'card' }" @click="paymentMethod = 'card'">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                      <line x1="1" y1="10" x2="23" y2="10"/>
                    </svg>
                    {{ $t('premium.creditCard') }}
                  </button>
                  <button class="method-btn" :class="{ active: paymentMethod === 'kbzpay' }" @click="paymentMethod = 'kbzpay'">
                    <span class="method-emoji">🏦</span>
                    KBZ Pay
                  </button>
                  <button class="method-btn" :class="{ active: paymentMethod === 'wavepay' }" @click="paymentMethod = 'wavepay'">
                    <span class="method-emoji">📱</span>
                    Wave Pay
                  </button>
                </div>
              </div>

              <!-- Simulated Payment Form -->
              <div class="payment-form">
                <div v-if="paymentMethod === 'card'" class="card-form">
                  <div class="form-group">
                    <label>{{ $t('premium.cardNumber') }}</label>
                    <input type="text" v-model="cardForm.number" placeholder="4242 4242 4242 4242" maxlength="19" />
                  </div>
                  <div class="form-row">
                    <div class="form-group">
                      <label>{{ $t('premium.expiry') }}</label>
                      <input type="text" v-model="cardForm.expiry" placeholder="MM/YY" maxlength="5" />
                    </div>
                    <div class="form-group">
                      <label>{{ $t('premium.cvc') }}</label>
                      <input type="text" v-model="cardForm.cvc" placeholder="123" maxlength="3" />
                    </div>
                  </div>
                </div>

                <div v-else class="mobile-pay-info">
                  <div class="qr-placeholder">
                    <span class="qr-icon">📲</span>
                    <p>{{ $t('premium.scanQR') }}</p>
                    <p class="qr-hint">{{ $t('premium.demoNote') }}</p>
                  </div>
                </div>

                <button class="btn-pay" @click="processPayment" :disabled="processingPayment">
                  <span v-if="processingPayment" class="loading-spinner"></span>
                  {{ processingPayment ? $t('premium.processing') : $t('premium.payNow') + (selectedPlan === 'monthly' ? ' $4.99' : ' $29.99') }}
                </button>
              </div>
            </div>
          </div>
        </Transition>

        <!-- Success Modal -->
        <Transition name="modal">
          <div v-if="showSuccessModal" class="modal-overlay">
            <div class="success-modal">
              <div class="success-icon">🎉</div>
              <h2>{{ $t('premium.welcomePremium') }}</h2>
              <p>{{ $t('premium.successMessage') }}</p>
              <router-link to="/learn-japanese" class="btn-primary-lg">
                {{ $t('premium.startLearning') }}
              </router-link>
            </div>
          </div>
        </Transition>

        <!-- Not Logged In -->
        <div v-if="!authStore.isAuthenticated" class="login-prompt">
          <p>{{ $t('premium.loginRequired') }}</p>
          <router-link to="/login" class="btn-primary-lg">{{ $t('nav.login') }}</router-link>
        </div>

      </div>
    </section>

    <footer class="premium-footer">
      <p>{{ $t('footer.copyright') }}</p>
    </footer>
  </div>
</template>

<script setup>
/**
 * PremiumPage script
 *
 * Displays pricing plans and handles a simulated payment flow.
 * On success calls the backend to activate premium status.
 */
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../store/auth'
import api from '../services/api'
import AppHeader from '../components/layout/AppHeader.vue'

const router    = useRouter()
const authStore = useAuthStore()

/* ---------- Payment State ---------- */
const selectedPlan      = ref(null)
const purchasing        = ref(false)
const showPaymentModal  = ref(false)
const showSuccessModal  = ref(false)
const processingPayment = ref(false)
const paymentMethod     = ref('card')

const cardForm = ref({ number: '', expiry: '', cvc: '' })

function selectPlan(plan) {
  if (!authStore.isAuthenticated) {
    router.push('/login?redirect=/premium')
    return
  }
  selectedPlan.value = plan
  showPaymentModal.value = true
}

function closePayment() {
  showPaymentModal.value = false
  processingPayment.value = false
}

async function processPayment() {
  processingPayment.value = true

  // Simulate payment processing (2 seconds)
  await new Promise(resolve => setTimeout(resolve, 2000))

  try {
    // Call backend to activate premium  
    await api.post('/auth/activate-premium', {
      plan: selectedPlan.value
    })

    // Update local user state
    const updatedUser = { ...authStore.user, is_premium: true, premium_type: selectedPlan.value }
    authStore.user = updatedUser
    localStorage.setItem('user', JSON.stringify(updatedUser))

    showPaymentModal.value = false
    showSuccessModal.value = true

    // Auto-redirect after 3 seconds
    setTimeout(() => {
      router.push('/learn-japanese')
    }, 3000)
  } catch (err) {
    console.error('Payment error:', err)
    alert('Payment failed. Please try again.')
  } finally {
    processingPayment.value = false
  }
}
</script>

<style scoped>
.premium-page {
  min-height: 100vh;
  background: var(--bg-primary);
}

/* Hero */
.premium-hero {
  padding: 4rem 2rem 2rem;
  text-align: center;
  background: linear-gradient(180deg, var(--bg-secondary) 0%, var(--bg-primary) 100%);
  border-bottom: 1px solid var(--border-light);
}

.hero-content {
  max-width: 700px;
  margin: 0 auto;
}

.premium-badge {
  display: inline-block;
  padding: 0.5rem 1.25rem;
  background: rgba(212, 175, 55, 0.1);
  border: 1px solid rgba(212, 175, 55, 0.3);
  border-radius: 999px;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-primary);
  margin-bottom: 1rem;
}

.premium-title {
  font-size: 2.5rem;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 0.75rem;
}

.text-gold { color: var(--color-primary); }

.premium-subtitle {
  font-size: 1.1rem;
  color: var(--text-secondary);
  line-height: 1.6;
}

/* Pricing */
.pricing-section {
  padding: 3rem 2rem;
}

.pricing-container {
  max-width: 900px;
  margin: 0 auto;
}

.pricing-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  align-items: start;
}

.pricing-card {
  background: var(--bg-secondary);
  border: 2px solid var(--border-light);
  border-radius: 1.5rem;
  padding: 2rem;
  position: relative;
  transition: transform 0.2s, box-shadow 0.2s;
}

.pricing-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.1);
}

.pricing-card.featured {
  border-color: var(--color-primary);
  box-shadow: 0 8px 30px rgba(212, 175, 55, 0.15);
}

.popular-tag {
  position: absolute;
  top: -14px;
  left: 50%;
  transform: translateX(-50%);
  padding: 0.375rem 1.25rem;
  background: linear-gradient(135deg, var(--color-primary), #d4a853);
  color: white;
  font-weight: 700;
  font-size: 0.8rem;
  border-radius: 999px;
  white-space: nowrap;
}

.plan-header {
  text-align: center;
  margin-bottom: 1.5rem;
}

.plan-icon {
  font-size: 2.5rem;
  display: block;
  margin-bottom: 0.5rem;
}

.plan-header h3 {
  font-size: 1.375rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.plan-desc {
  font-size: 0.875rem;
  color: var(--text-tertiary);
}

.plan-price {
  text-align: center;
  padding: 1.5rem 0;
  border-top: 1px solid var(--border-light);
  border-bottom: 1px solid var(--border-light);
  margin-bottom: 1.5rem;
}

.price-currency {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-secondary);
  vertical-align: top;
}

.price-amount {
  font-size: 3.5rem;
  font-weight: 900;
  color: var(--text-primary);
  line-height: 1;
}

.price-period {
  font-size: 1rem;
  color: var(--text-tertiary);
  font-weight: 500;
}

.plan-features {
  list-style: none;
  padding: 0;
  margin: 0 0 2rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.plan-features li {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.95rem;
  color: var(--text-secondary);
}

.plan-features li.muted {
  opacity: 0.5;
}

.check {
  color: #16a34a;
  font-weight: 700;
  font-size: 1.1rem;
}

.check.gold { color: var(--color-primary); }

.x {
  color: var(--text-tertiary);
  font-weight: 700;
}

.btn-plan {
  width: 100%;
  padding: 1rem;
  font-size: 1rem;
  font-weight: 700;
  border: none;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-plan.monthly {
  background: var(--bg-tertiary);
  color: var(--text-primary);
  border: 2px solid var(--border-light);
}

.btn-plan.monthly:hover:not(:disabled) {
  border-color: var(--color-primary);
  background: var(--bg-elevated);
}

.btn-plan.lifetime {
  background: linear-gradient(135deg, var(--color-primary), #d4a853);
  color: white;
}

.btn-plan.lifetime:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(212, 175, 55, 0.3);
}

.btn-plan:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Already Premium */
.already-premium {
  display: flex;
  justify-content: center;
}

.premium-active-card {
  text-align: center;
  max-width: 480px;
  padding: 3rem;
  background: var(--bg-secondary);
  border: 2px solid var(--color-primary);
  border-radius: 1.5rem;
  box-shadow: 0 8px 30px rgba(212, 175, 55, 0.1);
}

.active-icon { font-size: 4rem; margin-bottom: 1rem; }

.premium-active-card h2 {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.premium-active-card p {
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
}

.plan-badge-active {
  display: inline-block;
  padding: 0.5rem 1.5rem;
  background: rgba(212, 175, 55, 0.1);
  border: 1px solid rgba(212, 175, 55, 0.3);
  border-radius: 999px;
  font-weight: 700;
  color: var(--color-primary);
  margin-bottom: 1.5rem;
}

.btn-primary-lg {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 2.5rem;
  background: linear-gradient(135deg, var(--color-primary), #d4a853);
  color: white;
  font-weight: 700;
  font-size: 1rem;
  border: none;
  border-radius: 0.75rem;
  cursor: pointer;
  text-decoration: none;
  transition: transform 0.2s, box-shadow 0.2s;
}

.btn-primary-lg:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(212, 175, 55, 0.3);
}

/* Payment Modal */
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.payment-modal {
  background: var(--bg-secondary);
  border-radius: 1.25rem;
  padding: 2rem;
  max-width: 500px;
  width: 100%;
  position: relative;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  color: var(--text-tertiary);
  cursor: pointer;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.modal-close:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.modal-header {
  text-align: center;
  margin-bottom: 1.5rem;
}

.modal-header h2 {
  font-size: 1.375rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.modal-header p {
  color: var(--text-secondary);
  font-size: 0.95rem;
}

.payment-methods h3 {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.75rem;
}

.method-options {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.method-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.375rem;
  padding: 0.75rem;
  background: var(--bg-tertiary);
  border: 2px solid var(--border-light);
  border-radius: 0.75rem;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
}

.method-btn.active {
  border-color: var(--color-primary);
  background: rgba(212, 175, 55, 0.05);
  color: var(--color-primary);
}

.method-btn:hover { border-color: var(--color-primary); }

.method-emoji { font-size: 1.25rem; }

.payment-form {
  margin-top: 1rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 0.375rem;
}

.form-group input {
  width: 100%;
  padding: 0.75rem 1rem;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-light);
  border-radius: 0.5rem;
  font-size: 1rem;
  color: var(--text-primary);
  font-family: monospace;
}

.form-group input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.mobile-pay-info {
  text-align: center;
  padding: 2rem;
}

.qr-placeholder {
  padding: 2rem;
  background: var(--bg-tertiary);
  border-radius: 1rem;
  border: 2px dashed var(--border-light);
}

.qr-icon { font-size: 3rem; display: block; margin-bottom: 0.75rem; }

.qr-placeholder p {
  color: var(--text-secondary);
  font-weight: 600;
}

.qr-hint {
  font-size: 0.8rem;
  color: var(--text-tertiary);
  margin-top: 0.5rem;
  font-weight: 400 !important;
}

.btn-pay {
  width: 100%;
  padding: 1rem;
  margin-top: 1rem;
  background: linear-gradient(135deg, var(--color-primary), #d4a853);
  color: white;
  font-size: 1rem;
  font-weight: 700;
  border: none;
  border-radius: 0.75rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s;
}

.btn-pay:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(212, 175, 55, 0.3);
}

.btn-pay:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.loading-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Success Modal */
.success-modal {
  background: var(--bg-secondary);
  border-radius: 1.25rem;
  padding: 3rem;
  max-width: 420px;
  width: 100%;
  text-align: center;
}

.success-icon { font-size: 4rem; margin-bottom: 1rem; }

.success-modal h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.success-modal p {
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
}

/* Transition */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

/* Login Prompt */
.login-prompt {
  text-align: center;
  margin-top: 2rem;
  padding: 2rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-light);
  border-radius: 1rem;
}

.login-prompt p {
  color: var(--text-secondary);
  margin-bottom: 1rem;
}

/* Footer */
.premium-footer {
  text-align: center;
  padding: 2rem;
  color: var(--text-tertiary);
  font-size: 0.875rem;
  border-top: 1px solid var(--border-light);
  margin-top: 2rem;
}

/* Responsive */
@media (max-width: 640px) {
  .pricing-grid {
    grid-template-columns: 1fr;
  }

  .premium-title {
    font-size: 1.75rem;
  }

  .method-options {
    grid-template-columns: 1fr;
  }
}
</style>
