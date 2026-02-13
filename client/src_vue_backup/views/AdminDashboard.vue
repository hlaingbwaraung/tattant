<template>
  <div class="admin-dashboard">
    <AppHeader />

    <div class="admin-container">
      <div class="container">
        <div class="page-header">
          <h1>👨‍💼 Admin Dashboard</h1>
          <p class="subtitle">Manage Users, Blogs & Statistics</p>
        </div>

        <!-- Tab Navigation -->
        <div class="tab-nav">
          <button 
            :class="['tab-btn', { active: activeTab === 'users' }]"
            @click="activeTab = 'users'"
          >
            👥 Users
          </button>
          <button 
            :class="['tab-btn', { active: activeTab === 'blogs' }]"
            @click="activeTab = 'blogs'"
          >
            📝 Blogs
          </button>
          <button 
            :class="['tab-btn', { active: activeTab === 'categories' }]"
            @click="activeTab = 'categories'"
          >
            📂 Categories
          </button>
          <button 
            :class="['tab-btn', { active: activeTab === 'shops' }]"
            @click="activeTab = 'shops'"
          >
            🏪 Shops
          </button>
        </div>

        <!-- USERS TAB -->
        <div v-show="activeTab === 'users'">
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

            <div class="stat-card">
              <div class="stat-icon">⭐</div>
              <div class="stat-info">
                <div class="stat-number">{{ stats.premiumUsers || 0 }}</div>
                <div class="stat-label">Premium</div>
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
                    <th>Premium</th>
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
                    <td>
                      <span class="badge" :class="user.is_premium ? 'premium' : 'free'">
                        {{ user.is_premium ? '⭐ ' + (user.premium_type || 'Premium') : '🆓 Free' }}
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
                          @click="togglePremium(user)" 
                          class="btn-action"
                          :class="user.is_premium ? 'demote' : 'promote'"
                        >
                          {{ user.is_premium ? '⭐ Remove Premium' : '⭐ Give Premium' }}
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

        <!-- BLOGS TAB -->
        <div v-show="activeTab === 'blogs'">
          <!-- Blog Stats -->
          <div v-if="blogStats" class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon">📝</div>
              <div class="stat-info">
                <div class="stat-number">{{ blogStats.totalBlogs }}</div>
                <div class="stat-label">Total Blogs</div>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon">✅</div>
              <div class="stat-info">
                <div class="stat-number">{{ blogStats.publishedBlogs }}</div>
                <div class="stat-label">Published</div>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon">📄</div>
              <div class="stat-info">
                <div class="stat-number">{{ blogStats.draftBlogs }}</div>
                <div class="stat-label">Drafts</div>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon">👁️</div>
              <div class="stat-info">
                <div class="stat-number">{{ blogStats.totalViews }}</div>
                <div class="stat-label">Total Views</div>
              </div>
            </div>
          </div>

          <!-- Blog Management -->
          <div class="blogs-section">
            <div class="section-header">
              <h2>Manage Blogs</h2>
              <button @click="openBlogForm(null)" class="btn-primary">
                ➕ Create New Blog
              </button>
            </div>

            <div v-if="blogLoading" class="loading">Loading blogs...</div>
            
            <div v-else-if="blogError" class="error">{{ blogError }}</div>
            
            <div v-else class="blogs-grid">
              <div v-for="blog in blogs" :key="blog.id" class="blog-card">
                <div class="blog-header">
                  <div class="blog-photo" v-if="blog.photo">
                    <img :src="blog.photo" :alt="blog.title" />
                  </div>
                  <div class="blog-photo placeholder" v-else>
                    <span class="emoji">{{ blog.emoji }}</span>
                  </div>
                  <span class="blog-status" :class="blog.published ? 'published' : 'draft'">
                    {{ blog.published ? '✓ Published' : '📄 Draft' }}
                  </span>
                </div>
                <div class="blog-body">
                  <h3>{{ currentLocale === 'my' ? (blog.title_my || blog.title) : blog.title }}</h3>
                  <p class="blog-meta">
                    <span class="category-tag">{{ blog.category }}</span>
                    <span>{{ blog.read_time }}</span>
                  </p>
                  <p class="blog-excerpt">{{ currentLocale === 'my' ? (blog.excerpt_my || blog.excerpt) : blog.excerpt }}</p>
                  <div class="blog-stats">
                    <span>👁️ {{ blog.views }} views</span>
                    <span>📅 {{ formatDate(blog.created_at) }}</span>
                  </div>
                </div>
                <div class="blog-actions">
                  <button @click="openBlogForm(blog)" class="btn-edit">
                    ✏️ Edit
                  </button>
                  <button @click="confirmDeleteBlog(blog)" class="btn-delete">
                    🗑️ Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- CATEGORIES TAB -->
        <div v-show="activeTab === 'categories'">
          <!-- Category Stats -->
          <div v-if="categoryStats" class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon">📂</div>
              <div class="stat-info">
                <div class="stat-number">{{ categoryStats.totalCategories }}</div>
                <div class="stat-label">Total Categories</div>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">🏪</div>
              <div class="stat-info">
                <div class="stat-number">{{ categoryStats.totalBusinesses }}</div>
                <div class="stat-label">Total Shops</div>
              </div>
            </div>
          </div>

          <!-- Category Management -->
          <div class="blogs-section">
            <div class="section-header">
              <h2>Manage Categories</h2>
              <button @click="openCategoryForm(null)" class="btn-primary">
                ➕ Add Category
              </button>
            </div>

            <div v-if="categoryLoading" class="loading">Loading categories...</div>
            <div v-else-if="categoryError" class="error">{{ categoryError }}</div>

            <div v-else class="category-list">
              <div v-for="cat in categories" :key="cat.id" class="category-row">
                <div class="category-info">
                  <span class="category-icon">{{ cat.icon }}</span>
                  <div>
                    <h4>{{ cat.name_en }}</h4>
                    <p class="category-names">
                      �🇲 {{ cat.name_my }}
                    </p>
                    <span class="category-slug">slug: {{ cat.slug }} &bull; order: {{ cat.display_order }}</span>
                  </div>
                </div>
                <div class="category-actions">
                  <button @click="openCategoryForm(cat)" class="btn-edit">✏️ Edit</button>
                  <button @click="confirmDeleteCategory(cat)" class="btn-delete">🗑️ Delete</button>
                </div>
              </div>
              <div v-if="categories.length === 0" class="loading">No categories found.</div>
            </div>
          </div>
        </div>

        <!-- SHOPS TAB -->
        <div v-show="activeTab === 'shops'">
          <!-- Shop Stats -->
          <div v-if="shopStats" class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon">🏪</div>
              <div class="stat-info">
                <div class="stat-number">{{ shopStats.totalBusinesses }}</div>
                <div class="stat-label">Total Shops</div>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">✅</div>
              <div class="stat-info">
                <div class="stat-number">{{ shopStats.activeBusinesses }}</div>
                <div class="stat-label">Active</div>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">🚫</div>
              <div class="stat-info">
                <div class="stat-number">{{ shopStats.inactiveBusinesses }}</div>
                <div class="stat-label">Inactive</div>
              </div>
            </div>
          </div>

          <!-- Shop Management -->
          <div class="blogs-section">
            <div class="section-header">
              <h2>Manage Shops</h2>
              <button @click="openShopForm(null)" class="btn-primary">
                ➕ Add Shop
              </button>
            </div>

            <div v-if="shopLoading" class="loading">Loading shops...</div>
            <div v-else-if="shopError" class="error">{{ shopError }}</div>

            <div v-else class="blogs-grid">
              <div v-for="shop in shops" :key="shop.id" class="blog-card">
                <div class="blog-header">
                  <div class="blog-photo" v-if="shop.photos && shop.photos.length">
                    <img :src="shop.photos[0]" :alt="shop.name" />
                  </div>
                  <div class="blog-photo placeholder" v-else>
                    <span class="emoji">🏪</span>
                  </div>
                  <span class="blog-status" :class="shop.is_active ? 'published' : 'draft'">
                    {{ shop.is_active ? '✓ Active' : '🚫 Inactive' }}
                  </span>
                </div>
                <div class="blog-body">
                  <h3>{{ shop.name }}</h3>
                  <p class="blog-meta">
                    <span class="category-tag">{{ shop.category?.name_en || 'No category' }}</span>
                    <span v-if="shop.price_range">{{ shop.price_range }}</span>
                  </p>
                  <p class="blog-excerpt">{{ shop.description_en || 'No description' }}</p>
                  <div class="blog-stats">
                    <span v-if="shop.address">📍 {{ shop.address }}</span>
                    <span v-if="shop.phone">📞 {{ shop.phone }}</span>
                  </div>
                </div>
                <div class="blog-actions">
                  <button @click="toggleShopActive(shop)" class="btn-edit" style="flex: 0;">
                    {{ shop.is_active ? '🚫' : '✅' }}
                  </button>
                  <button @click="openShopForm(shop)" class="btn-edit">
                    ✏️ Edit
                  </button>
                  <button @click="confirmDeleteShop(shop)" class="btn-delete">
                    🗑️ Delete
                  </button>
                </div>
              </div>
            </div>
            <div v-if="!shopLoading && !shopError && shops.length === 0" class="loading">No shops found.</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete User Confirmation Modal -->
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

    <!-- Delete Blog Confirmation Modal -->
    <div v-if="deleteBlogModal.show" class="modal-overlay" @click="deleteBlogModal.show = false">
      <div class="modal" @click.stop>
        <h3>Confirm Delete</h3>
        <p>Are you sure you want to delete blog <strong>{{ deleteBlogModal.blog?.title }}</strong>?</p>
        <p class="warning">This action cannot be undone.</p>
        <div class="modal-actions">
          <button @click="deleteBlogModal.show = false" class="btn-cancel">Cancel</button>
          <button @click="deleteBlog" class="btn-confirm-delete">Delete Blog</button>
        </div>
      </div>
    </div>

    <!-- Delete Category Confirmation Modal -->
    <div v-if="deleteCategoryModal.show" class="modal-overlay" @click="deleteCategoryModal.show = false">
      <div class="modal" @click.stop>
        <h3>Confirm Delete</h3>
        <p>Are you sure you want to delete category <strong>{{ deleteCategoryModal.category?.name_en }}</strong>?</p>
        <p class="warning">This will fail if the category has shops assigned to it.</p>
        <div class="modal-actions">
          <button @click="deleteCategoryModal.show = false" class="btn-cancel">Cancel</button>
          <button @click="deleteCategory" class="btn-confirm-delete">Delete Category</button>
        </div>
      </div>
    </div>

    <!-- Delete Shop Confirmation Modal -->
    <div v-if="deleteShopModal.show" class="modal-overlay" @click="deleteShopModal.show = false">
      <div class="modal" @click.stop>
        <h3>Confirm Delete</h3>
        <p>Are you sure you want to delete shop <strong>{{ deleteShopModal.shop?.name }}</strong>?</p>
        <p class="warning">This action cannot be undone.</p>
        <div class="modal-actions">
          <button @click="deleteShopModal.show = false" class="btn-cancel">Cancel</button>
          <button @click="deleteShop" class="btn-confirm-delete">Delete Shop</button>
        </div>
      </div>
    </div>

    <!-- Category Form Modal -->
    <div v-if="categoryFormModal.show" class="modal-overlay" @click="closeCategoryForm">
      <div class="blog-form-modal" @click.stop>
        <div class="modal-header">
          <h3>{{ categoryFormModal.category ? 'Edit Category' : 'Create New Category' }}</h3>
          <button @click="closeCategoryForm" class="btn-close">✕</button>
        </div>
        <form @submit.prevent="saveCategory" class="blog-form">
          <div class="form-row">
            <div class="form-group flex-1">
              <label>English Name *</label>
              <input v-model="categoryForm.name_en" type="text" required placeholder="e.g. Ramen Restaurants" />
            </div>
            <div class="form-group" style="width: 120px;">
              <label>Icon *</label>
              <input v-model="categoryForm.icon" type="text" required maxlength="10" placeholder="🍜" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Burmese Name *</label>
              <input v-model="categoryForm.name_my" type="text" required placeholder="ရာမင်ဆိုင်" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Slug * (URL-friendly, lowercase)</label>
              <input v-model="categoryForm.slug" type="text" required placeholder="ramen" pattern="[a-z0-9\-]+" />
            </div>
            <div class="form-group" style="width: 150px;">
              <label>Display Order</label>
              <input v-model.number="categoryForm.display_order" type="number" min="0" />
            </div>
          </div>
          <div class="form-actions">
            <button type="button" @click="closeCategoryForm" class="btn-cancel">Cancel</button>
            <button type="submit" class="btn-save" :disabled="categorySaving">
              {{ categorySaving ? 'Saving...' : 'Save Category' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Shop Form Modal -->
    <div v-if="shopFormModal.show" class="modal-overlay" @click="closeShopForm">
      <div class="blog-form-modal" @click.stop>
        <div class="modal-header">
          <h3>{{ shopFormModal.shop ? 'Edit Shop' : 'Create New Shop' }}</h3>
          <button @click="closeShopForm" class="btn-close">✕</button>
        </div>
        <form @submit.prevent="saveShop" class="blog-form">
          <div class="form-row">
            <div class="form-group flex-1">
              <label>Shop Name *</label>
              <input v-model="shopForm.name" type="text" required placeholder="Sakura Mobile" />
            </div>
            <div class="form-group">
              <label>Category *</label>
              <select v-model="shopForm.category_id" required>
                <option value="">Select category</option>
                <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                  {{ cat.icon }} {{ cat.name_en }}
                </option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label>Description (English)</label>
            <textarea v-model="shopForm.description_en" rows="3" placeholder="Brief description in English..."></textarea>
          </div>
          <div class="form-group">
            <label>Description (Burmese)</label>
            <textarea v-model="shopForm.description_my" rows="3" placeholder="မြန်မာဘာသာ ဖော်ပြချက်..."></textarea>
          </div>

          <div class="form-row">
            <div class="form-group flex-1">
              <label>Address</label>
              <input v-model="shopForm.address" type="text" placeholder="1-1-1 Shibuya, Tokyo" />
            </div>
            <div class="form-group" style="width: 150px;">
              <label>Price Range</label>
              <select v-model="shopForm.price_range">
                <option value="">None</option>
                <option value="¥">¥</option>
                <option value="¥¥">¥¥</option>
                <option value="¥¥¥">¥¥¥</option>
                <option value="¥¥¥¥">¥¥¥¥</option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Phone</label>
              <input v-model="shopForm.phone" type="text" placeholder="+81-3-1234-5678" />
            </div>
            <div class="form-group">
              <label>Website</label>
              <input v-model="shopForm.website" type="text" placeholder="https://example.com" />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Latitude</label>
              <input v-model="shopForm.latitude" type="text" placeholder="35.6595" />
            </div>
            <div class="form-group">
              <label>Longitude</label>
              <input v-model="shopForm.longitude" type="text" placeholder="139.7004" />
            </div>
          </div>

          <div class="form-group">
            <label>Photo URLs (one per line)</label>
            <textarea v-model="shopPhotosText" rows="3" placeholder="https://example.com/photo1.jpg&#10;https://example.com/photo2.jpg"></textarea>
          </div>

          <div class="form-group">
            <label>Tags (comma-separated)</label>
            <input v-model="shopTagsText" type="text" placeholder="tourist-friendly, english-support" />
          </div>

          <div class="form-group">
            <label>Languages Supported (comma-separated)</label>
            <input v-model="shopLangsText" type="text" placeholder="en, jp, cn, kr" />
          </div>

          <div class="form-group checkbox-group">
            <label>
              <input type="checkbox" v-model="shopForm.is_active" />
              Active (visible to users)
            </label>
          </div>

          <div class="form-actions">
            <button type="button" @click="closeShopForm" class="btn-cancel">Cancel</button>
            <button type="submit" class="btn-save" :disabled="shopSaving">
              {{ shopSaving ? 'Saving...' : 'Save Shop' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Blog Form Modal -->
    <div v-if="blogFormModal.show" class="modal-overlay" @click="closeBlogForm">
      <div class="blog-form-modal" @click.stop>
        <div class="modal-header">
          <h3>{{ blogFormModal.blog ? 'Edit Blog' : 'Create New Blog' }}</h3>
          <button @click="closeBlogForm" class="btn-close">✕</button>
        </div>
        
        <form @submit.prevent="saveBlog" class="blog-form">
          <div class="form-row">
            <div class="form-group flex-1">
              <label>Title (English) *</label>
              <input 
                v-model="blogForm.title" 
                type="text" 
                required 
                placeholder="Enter blog title"
              />
            </div>

            <div class="form-group" style="width: 120px;">
              <label>Emoji *</label>
              <input 
                v-model="blogForm.emoji" 
                type="text" 
                required 
                maxlength="10"
                placeholder="📝"
              />
            </div>
          </div>

          <div class="form-group">
            <label>Title (Burmese)</label>
            <input 
              v-model="blogForm.title_my" 
              type="text" 
              placeholder="ဘလော့ခေါင်းစဉ်ရေးပါ"
            />
          </div>

          <div class="form-group">
            <label>Photo URL (optional)</label>
            <input 
              v-model="blogForm.photo" 
              type="text" 
              placeholder="https://example.com/image.jpg or base64"
            />
            <div v-if="blogForm.photo" class="photo-preview">
              <img :src="blogForm.photo" alt="Preview" @error="handleImageError" />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Category *</label>
              <select v-model="blogForm.category" required>
                <option value="">Select category</option>
                <option value="Culture">Culture</option>
                <option value="Travel Tips">Travel Tips</option>
                <option value="Food & Drink">Food & Drink</option>
                <option value="Etiquette">Etiquette</option>
                <option value="Seasons">Seasons</option>
                <option value="Practical">Practical</option>
              </select>
            </div>

            <div class="form-group">
              <label>Tag *</label>
              <select v-model="blogForm.tag" required>
                <option value="">Select tag</option>
                <option value="culture">culture</option>
                <option value="travel">travel</option>
                <option value="food">food</option>
                <option value="etiquette">etiquette</option>
                <option value="seasons">seasons</option>
                <option value="practical">practical</option>
              </select>
            </div>

            <div class="form-group">
              <label>Read Time</label>
              <input 
                v-model="blogForm.read_time" 
                type="text" 
                placeholder="5 min read"
              />
            </div>
          </div>

          <div class="form-group">
            <label>Excerpt (English) * (Short description, 10-500 characters)</label>
            <textarea 
              v-model="blogForm.excerpt" 
              required 
              rows="3"
              maxlength="500"
              placeholder="Brief description of the blog post..."
            ></textarea>
            <small>{{ blogForm.excerpt?.length || 0 }} / 500</small>
          </div>

          <div class="form-group">
            <label>Excerpt (Burmese)</label>
            <textarea 
              v-model="blogForm.excerpt_my" 
              rows="3"
              maxlength="500"
              placeholder="ဘလော့၏အကျဉ်းချုပ်ဖော်ပြချက်..."
            ></textarea>
            <small>{{ blogForm.excerpt_my?.length || 0 }} / 500</small>
          </div>

          <div class="form-group">
            <label>Content (English) * (HTML allowed)</label>
            <textarea 
              v-model="blogForm.content" 
              required 
              rows="12"
              placeholder="<p>Your blog content here...</p>&#10;<h2>Subheading</h2>&#10;<ul><li>List item</li></ul>"
            ></textarea>
          </div>

          <div class="form-group">
            <label>Content (Burmese) (HTML allowed)</label>
            <textarea 
              v-model="blogForm.content_my" 
              rows="12"
              placeholder="<p>သင့်ဘလော့အကြောင်းအရာကိုနေရာတွင်ရေးပါ...</p>"
            ></textarea>
          </div>

          <div class="form-group checkbox-group">
            <label>
              <input type="checkbox" v-model="blogForm.published" />
              Publish immediately
            </label>
          </div>

          <div class="form-actions">
            <button type="button" @click="closeBlogForm" class="btn-cancel">
              Cancel
            </button>
            <button type="submit" class="btn-save" :disabled="blogSaving">
              {{ blogSaving ? 'Saving...' : 'Save Blog' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * AdminDashboard script
 *
 * Central admin panel with four management tabs:
 *   1. Users   –  list / delete / toggle admin
 *   2. Blogs   –  CRUD with bilingual fields (EN / MY)
 *   3. Categories – CRUD with i18n names + icons
 *   4. Shops   –  CRUD with bilingual descriptions, photos, map coords
 */
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import axios from 'axios'
import AppHeader from '../components/layout/AppHeader.vue'
import { useAuthStore } from '../store/auth'

const router    = useRouter()
const authStore = useAuthStore()
const { locale, t } = useI18n()

const currentLocale = computed(() => locale.value)

/* ---------- Tab ---------- */
const activeTab = ref('users')

/* ========== User Management ========== */
const users       = ref([])
const stats       = ref(null)
const loading     = ref(true)
const error       = ref('')
const deleteModal = ref({ show: false, user: null })

/* ========== Blog Management ========== */
const blogs          = ref([])
const blogStats      = ref(null)
const blogLoading    = ref(false)
const blogError      = ref('')
const deleteBlogModal = ref({ show: false, blog: null })
const blogFormModal   = ref({ show: false, blog: null })
const blogSaving     = ref(false)
const blogForm = ref({
  title:      '',
  title_my:   '',
  emoji:      '📝',
  photo:      '',
  category:   '',
  tag:        '',
  excerpt:    '',
  excerpt_my: '',
  content:    '',
  content_my: '',
  read_time:  '5 min read',
  published:  true
})

/* ========== Category Management ========== */
const categories           = ref([])
const categoryStats        = ref(null)
const categoryLoading      = ref(false)
const categoryError        = ref('')
const deleteCategoryModal  = ref({ show: false, category: null })
const categoryFormModal    = ref({ show: false, category: null })
const categorySaving       = ref(false)
const categoryForm = ref({
  name_en:       '',
  name_my:       '',
  icon:          '📁',
  slug:          '',
  display_order: 0
})

/* ========== Shop Management ========== */
const shops           = ref([])
const shopStats       = ref(null)
const shopLoading     = ref(false)
const shopError       = ref('')
const deleteShopModal = ref({ show: false, shop: null })
const shopFormModal   = ref({ show: false, shop: null })
const shopSaving      = ref(false)
const shopForm = ref({
  name:           '',
  category_id:    '',
  description_en: '',
  description_my: '',
  address:        '',
  latitude:       '',
  longitude:      '',
  phone:          '',
  website:        '',
  price_range:    '',
  is_active:      true
})
const shopPhotosText = ref('')
const shopTagsText = ref('')
const shopLangsText = ref('')

const currentUserId = computed(() => authStore.user?.id)

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// User Management Functions
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

const togglePremium = async (user) => {
  try {
    const token = localStorage.getItem('token')
    await axios.patch(
      `http://localhost:5000/api/admin/users/${user.id}/premium`,
      { is_premium: !user.is_premium, premium_type: user.is_premium ? null : 'lifetime' },
      { headers: { Authorization: `Bearer ${token}` } }
    )

    user.is_premium = !user.is_premium
    if (!user.is_premium) {
      user.premium_type = null
    } else {
      user.premium_type = 'lifetime'
    }
    await loadData() // Refresh stats
  } catch (err) {
    console.error('Error toggling premium status:', err)
    alert('Failed to update premium status')
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

// Blog Management Functions
const loadBlogs = async () => {
  try {
    blogLoading.value = true
    blogError.value = ''

    const token = localStorage.getItem('token')
    const headers = { Authorization: `Bearer ${token}` }

    const [blogsRes, statsRes] = await Promise.all([
      axios.get('http://localhost:5000/api/blogs', { headers }),
      axios.get('http://localhost:5000/api/blogs/admin/stats', { headers })
    ])

    blogs.value = blogsRes.data.data
    blogStats.value = statsRes.data.data
  } catch (err) {
    console.error('Error loading blogs:', err)
    blogError.value = 'Failed to load blogs'
  } finally {
    blogLoading.value = false
  }
}

const openBlogForm = (blog) => {
  if (blog) {
    // Edit mode
    blogForm.value = {
      title: blog.title,
      title_my: blog.title_my || '',
      emoji: blog.emoji,
      photo: blog.photo || '',
      category: blog.category,
      tag: blog.tag,
      excerpt: blog.excerpt,
      excerpt_my: blog.excerpt_my || '',
      content: blog.content,
      content_my: blog.content_my || '',
      read_time: blog.read_time,
      published: blog.published
    }
  } else {
    // Create mode
    blogForm.value = {
      title: '',
      title_my: '',
      emoji: '📝',
      photo: '',
      category: '',
      tag: '',
      excerpt: '',
      excerpt_my: '',
      content: '',
      content_my: '',
      read_time: '5 min read',
      published: true
    }
  }
  blogFormModal.value = { show: true, blog }
}

const closeBlogForm = () => {
  blogFormModal.value = { show: false, blog: null }
}

const saveBlog = async () => {
  try {
    blogSaving.value = true
    const token = localStorage.getItem('token')
    const headers = { Authorization: `Bearer ${token}` }

    if (blogFormModal.value.blog) {
      // Update existing blog
      await axios.put(
        `http://localhost:5000/api/blogs/${blogFormModal.value.blog.id}`,
        blogForm.value,
        { headers }
      )
    } else {
      // Create new blog
      await axios.post(
        'http://localhost:5000/api/blogs',
        blogForm.value,
        { headers }
      )
    }

    closeBlogForm()
    await loadBlogs()
  } catch (err) {
    console.error('Error saving blog:', err)
    alert(err.response?.data?.error || 'Failed to save blog')
  } finally {
    blogSaving.value = false
  }
}

const confirmDeleteBlog = (blog) => {
  deleteBlogModal.value = { show: true, blog }
}

const deleteBlog = async () => {
  try {
    const token = localStorage.getItem('token')
    await axios.delete(
      `http://localhost:5000/api/blogs/${deleteBlogModal.value.blog.id}`,
      { headers: { Authorization: `Bearer ${token}` } }
    )

    deleteBlogModal.value.show = false
    await loadBlogs()
  } catch (err) {
    console.error('Error deleting blog:', err)
    alert('Failed to delete blog')
  }
}

const handleImageError = (e) => {
  e.target.style.display = 'none'
}

// Category Management Functions
const loadCategories = async () => {
  try {
    categoryLoading.value = true
    categoryError.value = ''
    const token = localStorage.getItem('token')
    const headers = { Authorization: `Bearer ${token}` }

    const [catsRes, statsRes] = await Promise.all([
      axios.get('http://localhost:5000/api/categories', { headers }),
      axios.get('http://localhost:5000/api/categories/admin/stats', { headers })
    ])

    categories.value = catsRes.data.categories
    categoryStats.value = statsRes.data.data
  } catch (err) {
    console.error('Error loading categories:', err)
    categoryError.value = 'Failed to load categories'
  } finally {
    categoryLoading.value = false
  }
}

const openCategoryForm = (cat) => {
  if (cat) {
    categoryForm.value = {
      name_en: cat.name_en,
      name_my: cat.name_my,
      icon: cat.icon,
      slug: cat.slug,
      display_order: cat.display_order
    }
  } else {
    categoryForm.value = {
      name_en: '',
      name_my: '',
      icon: '📁',
      slug: '',
      display_order: 0
    }
  }
  categoryFormModal.value = { show: true, category: cat }
}

const closeCategoryForm = () => {
  categoryFormModal.value = { show: false, category: null }
}

const saveCategory = async () => {
  try {
    categorySaving.value = true
    const token = localStorage.getItem('token')
    const headers = { Authorization: `Bearer ${token}` }

    if (categoryFormModal.value.category) {
      await axios.put(
        `http://localhost:5000/api/categories/${categoryFormModal.value.category.id}`,
        categoryForm.value,
        { headers }
      )
    } else {
      await axios.post(
        'http://localhost:5000/api/categories',
        categoryForm.value,
        { headers }
      )
    }

    closeCategoryForm()
    await loadCategories()
  } catch (err) {
    console.error('Error saving category:', err)
    alert(err.response?.data?.message || 'Failed to save category')
  } finally {
    categorySaving.value = false
  }
}

const confirmDeleteCategory = (cat) => {
  deleteCategoryModal.value = { show: true, category: cat }
}

const deleteCategory = async () => {
  try {
    const token = localStorage.getItem('token')
    await axios.delete(
      `http://localhost:5000/api/categories/${deleteCategoryModal.value.category.id}`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    deleteCategoryModal.value.show = false
    await loadCategories()
  } catch (err) {
    console.error('Error deleting category:', err)
    alert(err.response?.data?.message || 'Failed to delete category')
  }
}

// Shop Management Functions
const loadShops = async () => {
  try {
    shopLoading.value = true
    shopError.value = ''
    const token = localStorage.getItem('token')
    const headers = { Authorization: `Bearer ${token}` }

    const [shopsRes, statsRes] = await Promise.all([
      axios.get('http://localhost:5000/api/businesses?all=true', { headers }),
      axios.get('http://localhost:5000/api/businesses/admin/stats', { headers })
    ])

    shops.value = shopsRes.data.businesses
    shopStats.value = statsRes.data.data
  } catch (err) {
    console.error('Error loading shops:', err)
    shopError.value = 'Failed to load shops'
  } finally {
    shopLoading.value = false
  }
}

const openShopForm = (shop) => {
  // Ensure categories are loaded for the dropdown
  if (categories.value.length === 0) {
    loadCategories()
  }

  if (shop) {
    shopForm.value = {
      name: shop.name,
      category_id: shop.category_id,
      description_en: shop.description_en || '',
      description_my: shop.description_my || '',
      address: shop.address || '',
      latitude: shop.latitude || '',
      longitude: shop.longitude || '',
      phone: shop.phone || '',
      website: shop.website || '',
      price_range: shop.price_range || '',
      is_active: shop.is_active
    }
    shopPhotosText.value = (shop.photos || []).join('\n')
    shopTagsText.value = (shop.tags || []).join(', ')
    shopLangsText.value = (shop.languages_supported || []).join(', ')
  } else {
    shopForm.value = {
      name: '',
      category_id: '',
      description_en: '',
      description_my: '',
      address: '',
      latitude: '',
      longitude: '',
      phone: '',
      website: '',
      price_range: '',
      is_active: true
    }
    shopPhotosText.value = ''
    shopTagsText.value = ''
    shopLangsText.value = ''
  }
  shopFormModal.value = { show: true, shop }
}

const closeShopForm = () => {
  shopFormModal.value = { show: false, shop: null }
}

const saveShop = async () => {
  try {
    shopSaving.value = true
    const token = localStorage.getItem('token')
    const headers = { Authorization: `Bearer ${token}` }

    const payload = {
      ...shopForm.value,
      latitude: shopForm.value.latitude ? parseFloat(shopForm.value.latitude) : null,
      longitude: shopForm.value.longitude ? parseFloat(shopForm.value.longitude) : null,
      photos: shopPhotosText.value.split('\n').map(s => s.trim()).filter(Boolean),
      tags: shopTagsText.value.split(',').map(s => s.trim()).filter(Boolean),
      languages_supported: shopLangsText.value.split(',').map(s => s.trim()).filter(Boolean)
    }

    if (shopFormModal.value.shop) {
      await axios.put(
        `http://localhost:5000/api/businesses/${shopFormModal.value.shop.id}`,
        payload,
        { headers }
      )
    } else {
      await axios.post(
        'http://localhost:5000/api/businesses',
        payload,
        { headers }
      )
    }

    closeShopForm()
    await loadShops()
  } catch (err) {
    console.error('Error saving shop:', err)
    alert(err.response?.data?.message || 'Failed to save shop')
  } finally {
    shopSaving.value = false
  }
}

const confirmDeleteShop = (shop) => {
  deleteShopModal.value = { show: true, shop }
}

const deleteShop = async () => {
  try {
    const token = localStorage.getItem('token')
    await axios.delete(
      `http://localhost:5000/api/businesses/${deleteShopModal.value.shop.id}`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    deleteShopModal.value.show = false
    await loadShops()
  } catch (err) {
    console.error('Error deleting shop:', err)
    alert(err.response?.data?.message || 'Failed to delete shop')
  }
}

const toggleShopActive = async (shop) => {
  try {
    const token = localStorage.getItem('token')
    await axios.patch(
      `http://localhost:5000/api/businesses/${shop.id}/toggle-active`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    )
    await loadShops()
  } catch (err) {
    console.error('Error toggling shop status:', err)
    alert('Failed to update shop status')
  }
}

// Watch for tab changes to load data
watch(activeTab, (newTab) => {
  if (newTab === 'blogs' && blogs.value.length === 0) {
    loadBlogs()
  }
  if (newTab === 'categories' && categories.value.length === 0) {
    loadCategories()
  }
  if (newTab === 'shops' && shops.value.length === 0) {
    loadShops()
  }
})

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

/* Tab Navigation */
.tab-nav {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  border-bottom: 2px solid var(--border-light);
  padding-bottom: 0;
}

.tab-btn {
  background: none;
  border: none;
  padding: 0.875rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-secondary);
  cursor: pointer;
  border-bottom: 3px solid transparent;
  margin-bottom: -2px;
  transition: all 0.2s;
}

.tab-btn:hover {
  color: var(--text-primary);
  background: var(--bg-tertiary);
}

.tab-btn.active {
  color: var(--color-primary);
  border-bottom-color: var(--color-primary);
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

.badge.premium {
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  color: #92400e;
  font-weight: 600;
}

.badge.free {
  background: var(--bg-tertiary);
  color: var(--text-secondary);
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

/* Blogs Section */
.blogs-section {
  background: var(--bg-card);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  padding: 2rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.section-header h2 {
  color: var(--text-primary);
  font-size: 1.5rem;
}

.btn-primary {
  background: var(--color-primary-gradient);
  color: #1a1a2e;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-sm);
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

/* Blog Grid */
.blogs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

.blog-card {
  background: var(--bg-card);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition: all 0.3s;
}

.blog-card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-4px);
}

.blog-header {
  position: relative;
  height: 180px;
}

.blog-photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.blog-photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.blog-photo.placeholder {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.blog-photo.placeholder .emoji {
  font-size: 4rem;
  filter: drop-shadow(0 4px 12px rgba(0,0,0,0.3));
}

.blog-status {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  padding: 0.25rem 0.75rem;
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 600;
}

.blog-status.published {
  background: var(--color-success-bg);
  color: var(--color-success);
}

.blog-status.draft {
  background: var(--color-warning-bg);
  color: var(--color-warning);
}

.blog-body {
  padding: 1.25rem;
}

.blog-body h3 {
  font-size: 1.125rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.blog-meta {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  margin-bottom: 0.75rem;
  font-size: 0.8125rem;
}

.category-tag {
  background: var(--color-primary-light);
  color: var(--color-primary-hover);
  padding: 0.25rem 0.625rem;
  border-radius: var(--radius-full);
  font-weight: 600;
}

.blog-excerpt {
  color: var(--text-secondary);
  font-size: 0.875rem;
  line-height: 1.6;
  margin-bottom: 0.75rem;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.blog-stats {
  display: flex;
  gap: 1rem;
  font-size: 0.8125rem;
  color: var(--text-tertiary);
  padding-top: 0.75rem;
  border-top: 1px solid var(--border-light);
}

.blog-actions {
  display: flex;
  gap: 0.5rem;
  padding: 1rem;
  border-top: 1px solid var(--border-light);
}

.btn-edit,
.btn-delete {
  flex: 1;
  padding: 0.625rem;
  border: none;
  border-radius: var(--radius-sm);
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-edit {
  background: var(--color-primary-light);
  color: var(--color-primary-hover);
}

.btn-edit:hover {
  filter: brightness(0.95);
}

.btn-delete {
  background: var(--color-error-bg);
  color: var(--color-error);
}

.btn-delete:hover {
  filter: brightness(0.95);
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
  padding: 1rem;
}

.modal {
  background: var(--bg-card);
  border: 1px solid var(--border-light);
  padding: 2rem;
  border-radius: var(--radius-lg);
  max-width: 500px;
  width: 100%;
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

/* Blog Form Modal */
.blog-form-modal {
  background: var(--bg-card);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: var(--shadow-xl);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid var(--border-light);
  position: sticky;
  top: 0;
  background: var(--bg-card);
  z-index: 10;
}

.modal-header h3 {
  font-size: 1.5rem;
  color: var(--text-primary);
  margin: 0;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: var(--text-secondary);
  cursor: pointer;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  transition: all 0.2s;
}

.btn-close:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.blog-form {
  padding: 2rem;
}

.form-row {
  display: flex;
  gap: 1rem;
  margin-bottom: 0;
}

.form-group {
  flex: 1;
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.875rem;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid var(--border-medium);
  border-radius: var(--radius-sm);
  font-size: 0.9375rem;
  background: var(--bg-card);
  color: var(--text-primary);
  transition: all 0.2s;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(201, 169, 98, 0.1);
}

.form-group small {
  display: block;
  margin-top: 0.25rem;
  font-size: 0.75rem;
  color: var(--text-tertiary);
}

.photo-preview {
  margin-top: 0.75rem;
  border-radius: var(--radius-sm);
  overflow: hidden;
  max-width: 200px;
  border: 1px solid var(--border-light);
}

.photo-preview img {
  width: 100%;
  height: auto;
  display: block;
}

.checkbox-group label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.checkbox-group input[type="checkbox"] {
  width: auto;
  cursor: pointer;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border-light);
}

.btn-save {
  background: var(--color-primary-gradient);
  color: #1a1a2e;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: var(--radius-sm);
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-save:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.btn-save:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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

  .blogs-grid {
    grid-template-columns: 1fr;
  }

  .form-row {
    flex-direction: column;
  }

  .section-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .btn-primary {
    width: 100%;
  }

  .tab-nav {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  .tab-btn {
    font-size: 0.8125rem;
    padding: 0.625rem 0.875rem;
    white-space: nowrap;
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .page-header h1 {
    font-size: 1.375rem;
  }

  .stat-card {
    padding: 1rem;
  }

  .stat-number {
    font-size: 1.5rem;
  }

  .container {
    padding: 0 1rem;
  }

  .modal-form {
    padding: 1rem;
  }

  .users-table {
    font-size: 0.75rem;
  }
}

/* Category List */
.category-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.category-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  background: var(--bg-card);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  transition: all 0.2s;
}

.category-row:hover {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-sm);
}

.category-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.category-icon {
  font-size: 2rem;
  width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-primary-light);
  border-radius: var(--radius-md);
}

.category-info h4 {
  font-size: 1.0625rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.category-names {
  font-size: 0.8125rem;
  color: var(--text-secondary);
  margin-bottom: 0.25rem;
}

.category-slug {
  font-size: 0.75rem;
  color: var(--text-tertiary);
  font-family: monospace;
}

.category-actions {
  display: flex;
  gap: 0.5rem;
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .category-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .category-actions {
    width: 100%;
  }

  .category-actions .btn-edit,
  .category-actions .btn-delete {
    flex: 1;
  }
}
</style>
