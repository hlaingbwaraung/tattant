<!--
  RegisterPage.vue

  Account creation form with Google OAuth option.
  Fields: name, email, birthdate, password, confirm password.
-->

<template>
  <div class="auth-page">
    <div class="auth-container">
      <!-- Left Side - Branding -->
      <div class="auth-branding">
        <router-link to="/" class="brand-logo">🎌 Suteki</router-link>
        <h1 class="brand-title">{{ $t('auth.joinTitle') }}</h1>
        <p class="brand-subtitle">{{ $t('auth.joinSubtitle') }}</p>
        <div class="brand-features">
          <div class="brand-feature">
            <span class="feature-icon">✓</span>
            <span>{{ $t('auth.accessGuides') }}</span>
          </div>
          <div class="brand-feature">
            <span class="feature-icon">✓</span>
            <span>{{ $t('auth.saveOrganize') }}</span>
          </div>
          <div class="brand-feature">
            <span class="feature-icon">✓</span>
            <span>{{ $t('auth.getRecommendations') }}</span>
          </div>
          <div class="brand-feature">
            <span class="feature-icon">✓</span>
            <span>{{ $t('auth.connectTravelers') }}</span>
          </div>
        </div>
      </div>

      <!-- Right Side - Form -->
      <div class="auth-form-container">
        <div class="auth-card">
          <div class="auth-header">
            <h2 class="auth-title">{{ $t('auth.createAccount') }}</h2>
            <p class="auth-subtitle">{{ $t('auth.fillDetails') }}</p>
          </div>

          <form @submit.prevent="handleRegister" class="auth-form">
            <div class="form-group">
              <label for="name" class="form-label">{{ $t('auth.fullName') }}</label>
              <input
                id="name"
                v-model="form.name"
                type="text"
                class="form-input"
                :placeholder="$t('auth.enterFullName')"
                required
              />
            </div>

            <div class="form-group">
              <label for="email" class="form-label">{{ $t('auth.emailAddress') }}</label>
              <input
                id="email"
                v-model="form.email"
                type="email"
                class="form-input"
                :placeholder="$t('auth.enterEmail')"
                required
              />
            </div>

            <div class="form-group">
              <label for="birthdate" class="form-label">{{ $t('auth.birthdate') }} <span class="optional">({{ $t('auth.optional') }})</span></label>
              <input
                id="birthdate"
                v-model="form.birthdate"
                type="date"
                class="form-input"
              />
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="password" class="form-label">{{ $t('auth.password') }}</label>
                <div class="password-wrapper">
                  <input
                    id="password"
                    v-model="form.password"
                    :type="showPassword ? 'text' : 'password'"
                    class="form-input password-input"
                    :placeholder="$t('auth.minCharacters')"
                    required
                    minlength="6"
                  />
                  <button type="button" class="password-toggle" @click="showPassword = !showPassword" tabindex="-1">
                    <svg v-if="showPassword" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                    <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  </button>
                </div>
              </div>
              <div class="form-group">
                <label for="confirmPassword" class="form-label">{{ $t('auth.confirmPassword') }}</label>
                <div class="password-wrapper">
                  <input
                    id="confirmPassword"
                    v-model="form.confirmPassword"
                    :type="showConfirmPassword ? 'text' : 'password'"
                    class="form-input password-input"
                    :placeholder="$t('auth.confirmPasswordPlaceholder')"
                    required
                  />
                  <button type="button" class="password-toggle" @click="showConfirmPassword = !showConfirmPassword" tabindex="-1">
                    <svg v-if="showConfirmPassword" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                    <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <div v-if="error" class="error-message">
              <span class="error-icon">⚠️</span>
              {{ error }}
            </div>

            <div v-if="success" class="success-message">
              <span class="success-icon">✓</span>
              {{ success }}
            </div>

            <button type="submit" class="btn-submit" :disabled="loading">
              <span v-if="loading" class="loading-spinner"></span>
              {{ loading ? $t('auth.creatingAccount') : $t('auth.createAccount') }}
            </button>
          </form>

          <div class="auth-divider">
            <span>{{ $t('auth.orContinueWith') }}</span>
          </div>

          <button v-if="isGoogleAvailable" class="btn-google" @click="triggerGoogleSignIn" :disabled="googleLoading">
            <span v-if="googleLoading" class="loading-spinner google-spinner"></span>
            <svg v-else viewBox="0 0 24 24" width="20" height="20">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {{ googleLoading ? $t('auth.signingIn') : $t('auth.continueWithGoogle') }}
          </button>

          <div class="auth-footer">
            <p>{{ $t('auth.haveAccount') }} <router-link to="/login" class="auth-link">{{ $t('auth.signInHere') }}</router-link></p>
            <router-link to="/" class="back-link">{{ $t('auth.backToHome') }}</router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * RegisterPage script
 *
 * Handles new-user registration (email/password) and Google OAuth.
 * Validates password match before submission.
 * On success redirects to /dashboard after a short delay.
 */
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../store/auth'
import { useGoogleAuth } from '../composables/useGoogleAuth'

const router    = useRouter()
const authStore = useAuthStore()

/* ---------- Form State ---------- */
const form = ref({
  name:            '',
  email:           '',
  birthdate:       '',
  password:        '',
  confirmPassword: ''
})
const loading             = ref(false)
const error               = ref('')
const success             = ref('')
const showPassword        = ref(false)
const showConfirmPassword = ref(false)

const handleGoogleSuccess = async (credential) => {
  error.value = ''
  await authStore.googleLogin(credential)
  router.push('/dashboard')
}

const handleGoogleError = (msg) => {
  error.value = msg
}

const { googleLoading, isGoogleAvailable, triggerGoogleSignIn } = useGoogleAuth(
  handleGoogleSuccess,
  handleGoogleError
)

const handleRegister = async () => {
  loading.value = true
  error.value = ''
  success.value = ''

  if (form.value.password !== form.value.confirmPassword) {
    error.value = 'Passwords do not match'
    loading.value = false
    return
  }

  try {
    await authStore.register({
      name: form.value.name,
      email: form.value.email,
      birthdate: form.value.birthdate,
      password: form.value.password
    })
    
    success.value = 'Account created successfully! Redirecting to dashboard...'
    
    setTimeout(() => {
      router.push('/dashboard')
    }, 1000)
  } catch (err) {
    error.value = err.response?.data?.message || 'Registration failed. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  background: var(--bg-primary);
}

.auth-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 100vh;
}

/* Branding Side */
.auth-branding {
  background: var(--gradient-hero);
  padding: 4rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.auth-branding::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 30% 70%, rgba(201, 169, 98, 0.15) 0%, transparent 50%);
}

.brand-logo {
  position: absolute;
  top: 2rem;
  left: 2rem;
  font-size: 1.5rem;
  font-weight: 700;
  background: var(--color-primary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-decoration: none;
}

.brand-title {
  font-size: 3rem;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 1rem;
  position: relative;
  z-index: 1;
}

.brand-subtitle {
  font-size: 1.25rem;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 3rem;
  position: relative;
  z-index: 1;
  max-width: 400px;
}

.brand-features {
  position: relative;
  z-index: 1;
}

.brand-feature {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  color: rgba(255, 255, 255, 0.8);
  font-size: 1rem;
}

.feature-icon {
  width: 24px;
  height: 24px;
  background: var(--color-primary);
  color: #1a1a2e;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
}

/* Form Side */
.auth-form-container {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: var(--bg-secondary);
  overflow-y: auto;
}

.auth-card {
  width: 100%;
  max-width: 480px;
  padding: 1rem 0;
}

.auth-header {
  margin-bottom: 2rem;
}

.auth-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.auth-subtitle {
  font-size: 1rem;
  color: var(--text-secondary);
}

/* Form */
.auth-form {
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.optional {
  font-weight: 400;
  text-transform: none;
  color: var(--text-tertiary);
}

.form-input {
  width: 100%;
  padding: 1rem 1.25rem;
  font-size: 1rem;
  font-family: inherit;
  background: var(--bg-tertiary);
  border: 2px solid var(--border-light);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  transition: all var(--transition-fast);
}

.form-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 4px var(--color-primary-light);
}

.password-wrapper {
  position: relative;
}

.password-input {
  padding-right: 3rem;
}

.password-toggle {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--text-tertiary);
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color var(--transition-fast);
}

.password-toggle:hover {
  color: var(--color-primary);
}

.form-input::placeholder {
  color: var(--text-tertiary);
}

.error-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--color-error-bg);
  color: var(--color-error);
  padding: 1rem;
  border-radius: var(--radius-md);
  margin-bottom: 1rem;
  font-size: 0.9375rem;
}

.success-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--color-success-bg);
  color: var(--color-success);
  padding: 1rem;
  border-radius: var(--radius-md);
  margin-bottom: 1rem;
  font-size: 0.9375rem;
}

.error-icon,
.success-icon {
  font-size: 1rem;
}

.btn-submit {
  width: 100%;
  padding: 1rem;
  background: var(--color-primary-gradient);
  color: #1a1a2e;
  border: none;
  border-radius: var(--radius-md);
  font-size: 1rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  cursor: pointer;
  transition: all var(--transition-base);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md), var(--shadow-glow);
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #1a1a2e;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Divider */
.auth-divider {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 1.5rem 0;
  color: var(--text-tertiary);
  font-size: 0.875rem;
}

.auth-divider::before,
.auth-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--border-light);
}

/* Google Button */
.btn-google {
  width: 100%;
  padding: 1rem;
  background: var(--bg-tertiary);
  border: 2px solid var(--border-light);
  border-radius: var(--radius-md);
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  transition: all var(--transition-fast);
}

.btn-google:hover:not(:disabled) {
  border-color: var(--color-primary);
  background: var(--bg-elevated);
}

.btn-google:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.google-spinner {
  border-color: var(--text-secondary);
  border-top-color: transparent;
  width: 18px;
  height: 18px;
}



/* Footer */
.auth-footer {
  text-align: center;
  margin-top: 2rem;
}

.auth-footer p {
  color: var(--text-secondary);
  margin-bottom: 1rem;
}

.auth-link {
  color: var(--color-primary);
  font-weight: 600;
  text-decoration: none;
}

.auth-link:hover {
  text-decoration: underline;
}

.back-link {
  color: var(--text-tertiary);
  font-size: 0.875rem;
  text-decoration: none;
  transition: color var(--transition-fast);
}

.back-link:hover {
  color: var(--color-primary);
}

/* Responsive */
@media (max-width: 1024px) {
  .auth-container {
    grid-template-columns: 1fr;
  }
  
  .auth-branding {
    display: none;
  }
  
  .auth-form-container {
    padding: 2rem 1rem;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .auth-form-container {
    padding: 1rem 0.75rem;
  }

  .auth-card {
    padding: 1.5rem;
  }

  .auth-title {
    font-size: 1.375rem;
  }

  .btn-submit {
    padding: 0.75rem;
    font-size: 0.875rem;
  }

  .form-input {
    padding: 0.625rem 0.75rem;
    font-size: 0.875rem;
  }
}
</style>
