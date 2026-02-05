<template>
  <div class="admin-dashboard">
    <AppHeader />

    <div class="admin-container">
      <div class="container">
        <div class="page-header">
          <h1>👨‍💼 Admin Dashboard</h1>
          <p class="subtitle">User Management & Statistics</p>
        </div>

        <!-- Stats Grid -->
        <div v-if="stats" class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">👥</div>
            <div class="stat-info">
              <div class="stat-number">{{ stats.totalUsers }}</div>
              <div class="stat-label">Total Users</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">✅</div>
            <div class="stat-info">
              <div class="stat-number">{{ stats.verifiedUsers }}</div>
              <div class="stat-label">Verified Users</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">🆕</div>
            <div class="stat-info">
              <div class="stat-number">{{ stats.newUsersLast7Days }}</div>
              <div class="stat-label">New (7 days)</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">👨‍💼</div>
            <div class="stat-info">
              <div class="stat-number">{{ stats.adminUsers }}</div>
              <div class="stat-label">Admins</div>
            </div>
          </div>
        </div>

        <!-- Users Table -->
        <div class="users-section">
          <h2>All Users</h2>
          
          <div v-if="loading" class="loading">Loading users...</div>
          
          <div v-else-if="error" class="error">{{ error }}</div>
          
          <div v-else class="table-container">
            <table class="users-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Birthdate</th>
                  <th>Status</th>
                  <th>Role</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="user in users" :key="user.id">
                  <td>
                    <div class="user-name">
                      {{ user.name || 'N/A' }}
                      <span v-if="user.google_id" class="badge google">Google</span>
                    </div>
                  </td>
                  <td>{{ user.email }}</td>
                  <td>{{ user.birthdate || 'Not provided' }}</td>
                  <td>
                    <span class="badge" :class="user.email_verified ? 'verified' : 'unverified'">
                      {{ user.email_verified ? '✓ Verified' : '✗ Unverified' }}
                    </span>
                  </td>
                  <td>
                    <span class="badge" :class="user.is_admin ? 'admin' : 'user'">
                      {{ user.is_admin ? '👨‍💼 Admin' : '👤 User' }}
                    </span>
                  </td>
                  <td>{{ formatDate(user.created_at) }}</td>
                  <td>
                    <div class="actions">
                      <button 
                        v-if="user.id !== currentUserId"
                        @click="toggleAdmin(user)" 
                        class="btn-action"
                        :class="user.is_admin ? 'demote' : 'promote'"
                      >
                        {{ user.is_admin ? '↓ Remove Admin' : '↑ Make Admin' }}
                      </button>
                      <button 
                        v-if="user.id !== currentUserId"
                        @click="confirmDelete(user)" 
                        class="btn-action delete"
                      >
                        🗑️ Delete
                      </button>
                      <span v-else class="current-user-badge">You</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="deleteModal.show" class="modal-overlay" @click="deleteModal.show = false">
      <div class="modal" @click.stop>
        <h3>Confirm Delete</h3>
        <p>Are you sure you want to delete user <strong>{{ deleteModal.user?.email }}</strong>?</p>
        <p class="warning">This action cannot be undone.</p>
        <div class="modal-actions">
          <button @click="deleteModal.show = false" class="btn-cancel">Cancel</button>
          <button @click="deleteUser" class="btn-confirm-delete">Delete User</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import AppHeader from '../components/layout/AppHeader.vue'
import { useAuthStore } from '../store/auth'

const router = useRouter()
const authStore = useAuthStore()

const users = ref([])
const stats = ref(null)
const loading = ref(true)
const error = ref('')
const deleteModal = ref({ show: false, user: null })

const currentUserId = computed(() => authStore.user?.id)

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const loadData = async () => {
  try {
    loading.value = true
    error.value = ''

    const token = localStorage.getItem('token')
    const headers = { Authorization: `Bearer ${token}` }

    const [usersRes, statsRes] = await Promise.all([
      axios.get('http://localhost:5000/api/admin/users', { headers }),
      axios.get('http://localhost:5000/api/admin/stats', { headers })
    ])

    users.value = usersRes.data.users
    stats.value = statsRes.data
  } catch (err) {
    console.error('Error loading admin data:', err)
    if (err.response?.status === 403) {
      error.value = 'Access denied. Admin privileges required.'
      setTimeout(() => router.push('/'), 2000)
    } else {
      error.value = 'Failed to load admin data'
    }
  } finally {
    loading.value = false
  }
}

const toggleAdmin = async (user) => {
  try {
    const token = localStorage.getItem('token')
    await axios.patch(
      `http://localhost:5000/api/admin/users/${user.id}/admin`,
      { is_admin: !user.is_admin },
      { headers: { Authorization: `Bearer ${token}` } }
    )

    user.is_admin = !user.is_admin
    await loadData() // Refresh stats
  } catch (err) {
    console.error('Error toggling admin status:', err)
    alert('Failed to update admin status')
  }
}

const confirmDelete = (user) => {
  deleteModal.value = { show: true, user }
}

const deleteUser = async () => {
  try {
    const token = localStorage.getItem('token')
    await axios.delete(
      `http://localhost:5000/api/admin/users/${deleteModal.value.user.id}`,
      { headers: { Authorization: `Bearer ${token}` } }
    )

    deleteModal.value.show = false
    await loadData()
  } catch (err) {
    console.error('Error deleting user:', err)
    alert('Failed to delete user')
  }
}

onMounted(() => {
  // Check if user is authenticated
  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }

  loadData()
})
</script>

<style scoped>
.admin-dashboard {
  min-height: 100vh;
  background: var(--bg-primary);
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
}

.admin-container {
  min-height: calc(100vh - 80px);
  padding: 2rem 0;
}

.page-header {
  margin-bottom: 2rem;
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

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.stat-card {
  background: var(--bg-card);
  border: 1px solid var(--border-light);
  padding: 1.5rem;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  gap: 1.25rem;
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
  font-size: 2rem;
  font-weight: 700;
  background: var(--color-primary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1;
}

.stat-label {
  color: var(--text-secondary);
  font-size: 0.8125rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
  margin-top: 0.25rem;
}

/* Users Section */
.users-section {
  background: var(--bg-card);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  padding: 2rem;
}

.users-section h2 {
  margin-bottom: 1.5rem;
  color: var(--text-primary);
  font-size: 1.5rem;
}

.loading,
.error {
  text-align: center;
  padding: 3rem;
  font-size: 1.125rem;
  color: var(--text-secondary);
}

.error {
  color: var(--color-error);
}

/* Table */
.table-container {
  overflow-x: auto;
}

.users-table {
  width: 100%;
  border-collapse: collapse;
}

.users-table th,
.users-table td {
  padding: 1rem 0.875rem;
  text-align: left;
  border-bottom: 1px solid var(--border-light);
}

.users-table th {
  background: var(--bg-tertiary);
  font-weight: 700;
  color: var(--text-secondary);
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.05em;
}

.users-table td {
  color: var(--text-primary);
  font-size: 0.9375rem;
}

.users-table tr:hover {
  background: var(--bg-tertiary);
}

.user-name {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
}

.badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 600;
}

.badge.verified {
  background: var(--color-success-bg);
  color: var(--color-success);
}

.badge.unverified {
  background: var(--color-error-bg);
  color: var(--color-error);
}

.badge.admin {
  background: var(--color-primary-light);
  color: var(--color-primary);
}

.badge.user {
  background: var(--bg-tertiary);
  color: var(--text-secondary);
}

.badge.google {
  background: var(--color-warning-bg);
  color: var(--color-warning);
  font-size: 0.6875rem;
}

.actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.btn-action {
  padding: 0.5rem 0.875rem;
  border: none;
  border-radius: var(--radius-sm);
  font-size: 0.8125rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.btn-action.promote {
  background: var(--color-success-bg);
  color: var(--color-success);
}

.btn-action.promote:hover {
  filter: brightness(0.95);
}

.btn-action.demote {
  background: var(--color-warning-bg);
  color: var(--color-warning);
}

.btn-action.demote:hover {
  filter: brightness(0.95);
}

.btn-action.delete {
  background: var(--color-error-bg);
  color: var(--color-error);
}

.btn-action.delete:hover {
  filter: brightness(0.95);
}

.current-user-badge {
  padding: 0.5rem 1rem;
  background: var(--color-primary-gradient);
  color: #1a1a2e;
  border-radius: var(--radius-sm);
  font-size: 0.8125rem;
  font-weight: 700;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: var(--bg-card);
  border: 1px solid var(--border-light);
  padding: 2rem;
  border-radius: var(--radius-lg);
  max-width: 500px;
  width: 90%;
  box-shadow: var(--shadow-xl);
}

.modal h3 {
  margin-bottom: 1rem;
  color: var(--text-primary);
  font-size: 1.5rem;
}

.modal p {
  margin-bottom: 1rem;
  color: var(--text-secondary);
}

.warning {
  color: var(--color-error);
  font-weight: 600;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
}

.btn-cancel,
.btn-confirm-delete {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: var(--radius-sm);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.btn-cancel {
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  border: 1px solid var(--border-light);
}

.btn-cancel:hover {
  border-color: var(--border-medium);
}

.btn-confirm-delete {
  background: var(--color-error);
  color: white;
}

.btn-confirm-delete:hover {
  filter: brightness(1.1);
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr 1fr;
  }

  .users-table {
    font-size: 0.8125rem;
  }

  .users-table th,
  .users-table td {
    padding: 0.75rem 0.5rem;
  }
  
  .btn-action {
    padding: 0.375rem 0.5rem;
    font-size: 0.75rem;
  }
}
</style>
