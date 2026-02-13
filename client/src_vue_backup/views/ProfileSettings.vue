<template>
  <div class="settings-page">
    <AppHeader />

    <div class="container">
      <!-- Page Header -->
      <div class="page-header">
        <h1>Account Settings</h1>
        <p class="subtitle">Manage your profile and account preferences</p>
      </div>

      <div class="settings-content">
        <!-- Profile Section -->
        <section class="settings-section">
          <div class="section-header">
            <div class="section-icon">👤</div>
            <div>
              <h2>Profile Information</h2>
              <p>Update your personal details</p>
            </div>
          </div>

          <form @submit.prevent="updateProfile" class="settings-form">
            <div class="form-group">
              <label for="name">Full Name</label>
              <input 
                type="text" 
                id="name" 
                v-model="profileForm.name" 
                placeholder="Enter your full name"
                :disabled="isUpdatingProfile"
              />
            </div>

            <div class="form-group">
              <label for="email">Email Address</label>
              <input 
                type="email" 
                id="email" 
                v-model="profileForm.email" 
                placeholder="Enter your email"
                :disabled="isUpdatingProfile"
              />
            </div>

            <div class="form-actions">
              <button type="submit" class="btn-primary" :disabled="isUpdatingProfile">
                <span v-if="isUpdatingProfile" class="spinner"></span>
                {{ isUpdatingProfile ? 'Saving...' : 'Save Changes' }}
              </button>
            </div>

            <div v-if="profileMessage" class="message" :class="profileMessageType">
              {{ profileMessage }}
            </div>
          </form>
        </section>

        <!-- Password Section -->
        <section class="settings-section">
          <div class="section-header">
            <div class="section-icon">🔐</div>
            <div>
              <h2>Change Password</h2>
              <p>Update your password to keep your account secure</p>
            </div>
          </div>

          <form @submit.prevent="updatePassword" class="settings-form">
            <div class="form-group">
              <label for="currentPassword">Current Password</label>
              <input 
                type="password" 
                id="currentPassword" 
                v-model="passwordForm.currentPassword" 
                placeholder="Enter current password"
                :disabled="isUpdatingPassword"
              />
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="newPassword">New Password</label>
                <input 
                  type="password" 
                  id="newPassword" 
                  v-model="passwordForm.newPassword" 
                  placeholder="Enter new password"
                  :disabled="isUpdatingPassword"
                />
              </div>

              <div class="form-group">
                <label for="confirmPassword">Confirm New Password</label>
                <input 
                  type="password" 
                  id="confirmPassword" 
                  v-model="passwordForm.confirmPassword" 
                  placeholder="Confirm new password"
                  :disabled="isUpdatingPassword"
                />
              </div>
            </div>

            <div class="form-actions">
              <button type="submit" class="btn-primary" :disabled="isUpdatingPassword">
                <span v-if="isUpdatingPassword" class="spinner"></span>
                {{ isUpdatingPassword ? 'Updating...' : 'Update Password' }}
              </button>
            </div>

            <div v-if="passwordMessage" class="message" :class="passwordMessageType">
              {{ passwordMessage }}
            </div>
          </form>
        </section>

        <!-- Danger Zone -->
        <section class="settings-section danger-zone">
          <div class="section-header">
            <div class="section-icon">⚠️</div>
            <div>
              <h2>Danger Zone</h2>
              <p>Irreversible and destructive actions</p>
            </div>
          </div>

          <div class="danger-content">
            <div class="danger-item">
              <div>
                <h4>Delete Account</h4>
                <p>Permanently remove your account and all associated data. This action cannot be undone.</p>
              </div>
              <button class="btn-danger" @click="confirmDeleteAccount">
                Delete Account
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * ProfileSettings script
 *
 * Two forms:
 *   1. Profile – update name & email
 *   2. Password – change password with current-password verification
 */
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import AppHeader from '../components/layout/AppHeader.vue'
import { useAuthStore } from '../store/auth'

const router    = useRouter()
const authStore = useAuthStore()

/* ---------- Profile Form ---------- */
const profileForm        = ref({ name: '', email: '' })
const isUpdatingProfile  = ref(false)
const profileMessage     = ref('')
const profileMessageType = ref('success')

/* ---------- Password Form ---------- */
const passwordForm = ref({
  currentPassword: '',
  newPassword:     '',
  confirmPassword: ''
})
const isUpdatingPassword  = ref(false)
const passwordMessage     = ref('')
const passwordMessageType = ref('success')

// Load user data
onMounted(() => {
  if (authStore.user) {
    profileForm.value.name = authStore.user.name || ''
    profileForm.value.email = authStore.user.email || ''
  }
})

// Update profile
const updateProfile = async () => {
  profileMessage.value = ''
  
  if (!profileForm.value.name || !profileForm.value.email) {
    profileMessage.value = 'Name and email are required'
    profileMessageType.value = 'error'
    return
  }

  isUpdatingProfile.value = true
  
  try {
    const token = localStorage.getItem('token')
    const response = await axios.put(
      'http://localhost:5000/api/auth/profile',
      {
        name: profileForm.value.name,
        email: profileForm.value.email
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    )
    
    // Update the auth store with new user data
    authStore.user = response.data.user
    localStorage.setItem('user', JSON.stringify(response.data.user))
    
    profileMessage.value = 'Profile updated successfully!'
    profileMessageType.value = 'success'
  } catch (err) {
    profileMessage.value = err.response?.data?.message || 'Failed to update profile'
    profileMessageType.value = 'error'
  } finally {
    isUpdatingProfile.value = false
  }
}

// Update password
const updatePassword = async () => {
  passwordMessage.value = ''
  
  if (!passwordForm.value.currentPassword || !passwordForm.value.newPassword) {
    passwordMessage.value = 'Current and new passwords are required'
    passwordMessageType.value = 'error'
    return
  }

  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    passwordMessage.value = 'New passwords do not match'
    passwordMessageType.value = 'error'
    return
  }

  if (passwordForm.value.newPassword.length < 6) {
    passwordMessage.value = 'New password must be at least 6 characters'
    passwordMessageType.value = 'error'
    return
  }

  isUpdatingPassword.value = true
  
  try {
    const token = localStorage.getItem('token')
    await axios.put(
      'http://localhost:5000/api/auth/password',
      {
        currentPassword: passwordForm.value.currentPassword,
        newPassword: passwordForm.value.newPassword
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    )
    
    passwordMessage.value = 'Password updated successfully!'
    passwordMessageType.value = 'success'
    
    // Clear form
    passwordForm.value = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  } catch (err) {
    passwordMessage.value = err.response?.data?.message || 'Failed to update password'
    passwordMessageType.value = 'error'
  } finally {
    isUpdatingPassword.value = false
  }
}

// Delete account
const confirmDeleteAccount = () => {
  if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
    deleteAccount()
  }
}

const deleteAccount = async () => {
  try {
    const token = localStorage.getItem('token')
    await axios.delete('http://localhost:5000/api/auth/account', {
      headers: { Authorization: `Bearer ${token}` }
    })
    
    authStore.logout()
    router.push('/')
  } catch (err) {
    alert(err.response?.data?.message || 'Failed to delete account')
  }
}
</script>

<style scoped>
.settings-page {
  min-height: 100vh;
  background: var(--bg-primary);
}

.container {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem 1.5rem 4rem;
}

/* Page Header */
.page-header {
  margin-bottom: 2.5rem;
  padding: 2rem;
  background: var(--gradient-hero);
  border-radius: var(--radius-xl);
  position: relative;
  overflow: hidden;
}

.page-header::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 100% 50%, rgba(201, 169, 98, 0.15) 0%, transparent 50%);
}

.page-header h1 {
  font-size: 2rem;
  color: #ffffff;
  margin-bottom: 0.5rem;
  position: relative;
  z-index: 1;
}

.subtitle {
  color: rgba(255, 255, 255, 0.7);
  font-size: 1rem;
  position: relative;
  z-index: 1;
}

/* Settings Content */
.settings-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Settings Section */
.settings-section {
  background: var(--bg-card);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  padding: 2rem;
}

.section-header {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--border-light);
}

.section-icon {
  width: 48px;
  height: 48px;
  background: var(--color-primary-light);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.section-header h2 {
  font-size: 1.25rem;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.section-header p {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

/* Form */
.settings-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
}

input {
  padding: 0.875rem 1rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-size: 1rem;
  transition: all var(--transition-fast);
}

input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-light);
}

input::placeholder {
  color: var(--text-muted);
}

input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.form-actions {
  padding-top: 0.5rem;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.875rem 2rem;
  background: var(--color-primary-gradient);
  color: #1a1a2e;
  border: none;
  border-radius: var(--radius-sm);
  font-size: 0.9375rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  cursor: pointer;
  transition: all var(--transition-base);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md), var(--shadow-glow);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(26, 26, 46, 0.3);
  border-top-color: #1a1a2e;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.message {
  padding: 0.875rem 1rem;
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: 500;
}

.message.success {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
  border: 1px solid rgba(34, 197, 94, 0.2);
}

.message.error {
  background: rgba(239, 68, 68, 0.1);
  color: var(--color-error);
  border: 1px solid rgba(239, 68, 68, 0.2);
}

/* Danger Zone */
.danger-zone {
  border-color: rgba(239, 68, 68, 0.3);
}

.danger-zone .section-icon {
  background: rgba(239, 68, 68, 0.1);
}

.danger-zone .section-header h2 {
  color: var(--color-error);
}

.danger-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.danger-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
}

.danger-item h4 {
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.danger-item p {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.btn-danger {
  padding: 0.75rem 1.5rem;
  background: transparent;
  color: var(--color-error);
  border: 1px solid var(--color-error);
  border-radius: var(--radius-sm);
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all var(--transition-fast);
}

.btn-danger:hover {
  background: var(--color-error);
  color: white;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .danger-item {
    flex-direction: column;
    text-align: center;
  }

  .page-title {
    font-size: 1.75rem;
  }
}

@media (max-width: 480px) {
  .settings-card {
    padding: 1.25rem;
  }

  .page-title {
    font-size: 1.375rem;
  }

  .page-subtitle {
    font-size: 0.875rem;
  }

  .container {
    padding: 0 1rem;
  }

  .form-input,
  .form-select {
    font-size: 0.875rem;
    padding: 0.625rem 0.75rem;
  }

  .btn-primary {
    width: 100%;
  }
}
</style>
