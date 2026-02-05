<template>
  <div class="auth-page">
    <div class="auth-container">
      <!-- Left Side - Branding -->
      <div class="auth-branding">
        <router-link to="/" class="brand-logo">🎌 Tattant</router-link>
        <h1 class="brand-title">Welcome Back</h1>
        <p class="brand-subtitle">Sign in to continue your journey through Japan</p>
        <div class="brand-features">
          <div class="brand-feature">
            <span class="feature-icon">✓</span>
            <span>Save your favorite places</span>
          </div>
          <div class="brand-feature">
            <span class="feature-icon">✓</span>
            <span>Personalized recommendations</span>
          </div>
          <div class="brand-feature">
            <span class="feature-icon">✓</span>
            <span>Exclusive member content</span>
          </div>
        </div>
      </div>

      <!-- Right Side - Form -->
      <div class="auth-form-container">
        <div class="auth-card">
          <div class="auth-header">
            <h2 class="auth-title">Sign In</h2>
            <p class="auth-subtitle">Enter your credentials to access your account</p>
          </div>

          <div class="test-credentials">
            <div class="test-header">
              <span class="test-icon">🔑</span>
              <span>Test Account</span>
            </div>
            <div class="test-info">
              <span>test@example.com</span>
              <span class="test-divider">•</span>
              <span>test123</span>
            </div>
          </div>

          <form @submit.prevent="handleLogin" class="auth-form">
            <div class="form-group">
              <label for="email" class="form-label">Email Address</label>
              <input
                id="email"
                v-model="form.email"
                type="email"
                class="form-input"
                placeholder="Enter your email"
                required
              />
            </div>

            <div class="form-group">
              <label for="password" class="form-label">Password</label>
              <input
                id="password"
                v-model="form.password"
                type="password"
                class="form-input"
                placeholder="Enter your password"
                required
              />
            </div>

            <div v-if="error" class="error-message">
              <span class="error-icon">⚠️</span>
              {{ error }}
            </div>

            <button type="submit" class="btn-submit" :disabled="loading">
              <span v-if="loading" class="loading-spinner"></span>
              {{ loading ? 'Signing in...' : 'Sign In' }}
            </button>
          </form>

          <div class="auth-divider">
            <span>or continue with</span>
          </div>

          <button class="btn-google" disabled>
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google (Coming Soon)
          </button>

          <div class="auth-footer">
            <p>Don't have an account? <router-link to="/register" class="auth-link">Create one</router-link></p>
            <router-link to="/" class="back-link">← Back to Home</router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../store/auth'

const router = useRouter()
const authStore = useAuthStore()
const form = ref({
  email: '',
  password: ''
})
const loading = ref(false)
const error = ref('')

const handleLogin = async () => {
  loading.value = true
  error.value = ''

  try {
    await authStore.login(form.value)
    router.push('/dashboard')
  } catch (err) {
    error.value = err.response?.data?.message || 'Login failed. Please try again.'
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
}

.auth-card {
  width: 100%;
  max-width: 420px;
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

/* Test Credentials */
.test-credentials {
  background: var(--color-primary-light);
  border: 1px solid var(--color-primary);
  border-radius: var(--radius-md);
  padding: 1rem;
  margin-bottom: 2rem;
}

.test-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: var(--color-primary);
  margin-bottom: 0.5rem;
}

.test-icon {
  font-size: 1rem;
}

.test-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
  font-family: monospace;
}

.test-divider {
  color: var(--color-primary);
}

/* Form */
.auth-form {
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
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

.error-icon {
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
}
</style>
