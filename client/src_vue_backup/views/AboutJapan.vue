<!--
  AboutJapan.vue

  Blog / articles page about Japanese culture, travel tips, food, etc.
    - Fetches published blog posts from the API
    - Filter tabs by category (culture, travel, food …)
    - Featured article hero + grid of cards
    - Modal overlay for reading full articles
    - Supports bilingual content (EN / MY)
-->

<template>
  <div class="about-japan">
    <AppHeader />

    <!-- Hero Banner -->
    <section class="aj-hero">
      <div class="aj-hero-overlay"></div>
      <div class="aj-hero-content">
        <span class="aj-badge">🇯🇵 {{ $t('aboutJapan.badge') }}</span>
        <h1 class="aj-hero-title">{{ $t('aboutJapan.title') }} <span class="text-gold">{{ $t('aboutJapan.titleHighlight') }}</span> {{ $t('aboutJapan.titleEnd') }}</h1>
        <p class="aj-hero-subtitle">{{ $t('aboutJapan.subtitle') }}</p>
      </div>
    </section>

    <!-- Blog Filter Tabs -->
    <section class="aj-filter-section">
      <div class="aj-container">
        <div class="aj-tabs">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            :class="['aj-tab', { active: activeTab === tab.id }]"
            @click="activeTab = tab.id"
          >
            <span class="aj-tab-icon">{{ tab.icon }}</span>
            {{ tab.label }}
          </button>
        </div>
      </div>
    </section>

    <!-- Blog Grid -->
    <section class="aj-blog-section">
      <div class="aj-container">
        <!-- Loading State -->
        <div v-if="loading" class="aj-loading">
          <div class="spinner"></div>
          <p>{{ $t('aboutJapan.loadingBlogs') }}</p>
        </div>

        <!-- No Blogs Message -->
        <div v-else-if="articles.length === 0" class="aj-no-blogs">
          <p>{{ $t('aboutJapan.noBlogs') }}</p>
        </div>

        <!-- Content -->
        <template v-else>
          <!-- Featured Article -->
          <div v-if="featuredArticle" class="aj-featured" @click="openArticle(featuredArticle)">
          <div class="aj-featured-image">
            <span class="aj-featured-emoji">{{ featuredArticle.emoji }}</span>
          </div>
          <div class="aj-featured-content">
            <span class="aj-category-tag">{{ featuredArticle.category }}</span>
            <h2 class="aj-featured-title">{{ currentLocale === 'my' ? (featuredArticle.title_my || featuredArticle.title) : featuredArticle.title }}</h2>
            <p class="aj-featured-excerpt">{{ currentLocale === 'my' ? (featuredArticle.excerpt_my || featuredArticle.excerpt) : featuredArticle.excerpt }}</p>
            <div class="aj-meta">
              <span>📅 {{ featuredArticle.date }}</span>
              <span>⏱️ {{ featuredArticle.readTime }}</span>
            </div>
          </div>
          </div>

          <!-- Blog Cards -->
          <div class="aj-grid">
            <article
              v-for="article in filteredArticles"
              :key="article.id"
              class="aj-card"
              @click="openArticle(article)"
            >
              <div class="aj-card-image">
                <span class="aj-card-emoji">{{ article.emoji }}</span>
                <span class="aj-card-tag">{{ article.category }}</span>
              </div>
              <div class="aj-card-body">
                <h3 class="aj-card-title">{{ currentLocale === 'my' ? (article.title_my || article.title) : article.title }}</h3>
                <p class="aj-card-excerpt">{{ currentLocale === 'my' ? (article.excerpt_my || article.excerpt) : article.excerpt }}</p>
                <div class="aj-card-meta">
                  <span>{{ article.date }}</span>
                  <span>{{ article.readTime }}</span>
                </div>
              </div>
            </article>
          </div>
        </template>
      </div>
    </section>

    <!-- Article Modal -->
    <Teleport to="body">
      <div v-if="selectedArticle" class="aj-modal-overlay" @click.self="closeModal">
        <div class="aj-modal">
          <button class="aj-modal-close" @click="closeModal">✕</button>
          <div class="aj-modal-hero">
            <span class="aj-modal-emoji">{{ selectedArticle.emoji }}</span>
          </div>
          <div class="aj-modal-body">
            <span class="aj-category-tag">{{ selectedArticle.category }}</span>
            <h1 class="aj-modal-title">{{ currentLocale === 'my' ? (selectedArticle.title_my || selectedArticle.title) : selectedArticle.title }}</h1>
            <div class="aj-meta" style="margin-bottom: 1.5rem;">
              <span>📅 {{ selectedArticle.date }}</span>
              <span>⏱️ {{ selectedArticle.readTime }}</span>
            </div>
            <div class="aj-modal-content" v-html="currentLocale === 'my' ? (selectedArticle.content_my || selectedArticle.content) : selectedArticle.content"></div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Footer -->
    <footer class="aj-footer">
      <div class="aj-container">
        <div class="aj-footer-inner">
          <p>{{ $t('aboutJapan.footerText') }}</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
/**
 * AboutJapan script
 *
 * Loads published blog posts from /api/blogs and maps them
 * into a local articles array. Supports bilingual (EN / MY)
 * for title, excerpt, and content fields.
 */
import { ref, computed, watch, onBeforeUnmount, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import axios from 'axios'
import AppHeader from '../components/layout/AppHeader.vue'

const { t, locale } = useI18n()
const currentLocale   = computed(() => locale.value)

/* ---------- State ---------- */
const activeTab       = ref('all')       // current category filter
const selectedArticle = ref(null)        // article shown in the modal
const articles        = ref([])          // fetched blog posts
const loading         = ref(true)

const tabs = computed(() => [
  { id: 'all', label: t('aboutJapan.all'), icon: '📰' },
  { id: 'culture', label: t('aboutJapan.culture'), icon: '🎎' },
  { id: 'travel', label: t('aboutJapan.travelTips'), icon: '🧳' },
  { id: 'food', label: t('aboutJapan.foodDrink'), icon: '🍣' },
  { id: 'etiquette', label: t('aboutJapan.etiquette'), icon: '🙇' },
  { id: 'seasons', label: t('aboutJapan.seasons'), icon: '🌸' },
  { id: 'practical', label: t('aboutJapan.practical'), icon: '💡' },
])

const openArticle = (article) => {
  selectedArticle.value = article
  document.body.style.overflow = 'hidden'
}

const closeModal = () => {
  selectedArticle.value = null
  document.body.style.overflow = ''
}

// Safety net: always restore scroll when component unmounts
onBeforeUnmount(() => {
  document.body.style.overflow = ''
})

// Load blogs from API
const loadBlogs = async () => {
  try {
    loading.value = true
    const response = await axios.get('http://localhost:5000/api/blogs', {
      params: { published: true }
    })
    
    // Transform API data to match the expected format
    articles.value = response.data.data.map(blog => ({
      id: blog.id,
      title: blog.title,
      title_my: blog.title_my,
      emoji: blog.emoji,
      category: blog.category,
      tag: blog.tag,
      date: new Date(blog.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      readTime: blog.read_time,
      excerpt: blog.excerpt,
      excerpt_my: blog.excerpt_my,
      content: blog.content,
      content_my: blog.content_my,
      photo: blog.photo
    }))
  } catch (error) {
    console.error('Error loading blogs:', error)
    // Keep default empty array on error
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadBlogs()
})

const featuredArticle = computed(() => {
  if (activeTab.value === 'all') return articles.value[0]
  const filtered = articles.value.filter(a => a.tag === activeTab.value)
  return filtered.length > 0 ? filtered[0] : null
})

const filteredArticles = computed(() => {
  const list = activeTab.value === 'all'
    ? articles.value
    : articles.value.filter(a => a.tag === activeTab.value)
  // Exclude the featured article
  if (featuredArticle.value) {
    return list.filter(a => a.id !== featuredArticle.value.id)
  }
  return list
})
</script>

<style scoped>
/* ===== ABOUT JAPAN PAGE ===== */
.about-japan {
  min-height: 100vh;
  background: var(--bg-primary);
  color: var(--text-primary);
}

/* Hero */
.aj-hero {
  position: relative;
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  overflow: hidden;
}
.aj-hero-overlay {
  position: absolute;
  inset: 0;
  background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23c9a962' fill-opacity='0.06'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E") repeat;
}
.aj-hero-content {
  position: relative;
  z-index: 2;
  padding: 3rem 1.5rem;
}
.aj-badge {
  display: inline-block;
  background: rgba(201, 169, 98, 0.15);
  color: var(--color-primary);
  padding: 0.4rem 1.2rem;
  border-radius: 50px;
  font-size: 0.85rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  margin-bottom: 1rem;
  border: 1px solid rgba(201, 169, 98, 0.25);
}
.aj-hero-title {
  font-size: 2.8rem;
  font-weight: 800;
  color: #ffffff;
  line-height: 1.15;
  margin-bottom: 1rem;
}
.text-gold { color: var(--color-primary); }
.aj-hero-subtitle {
  font-size: 1.1rem;
  color: rgba(255,255,255,0.7);
  max-width: 560px;
  margin: 0 auto;
  line-height: 1.6;
}

/* Container */
.aj-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

/* Tabs */
.aj-filter-section {
  padding: 2rem 0 0;
  background: var(--bg-primary);
  position: sticky;
  top: 64px;
  z-index: 10;
  border-bottom: 1px solid var(--border-light);
}
.aj-tabs {
  display: flex;
  gap: 0.25rem;
  overflow-x: auto;
  padding-bottom: 0;
  scrollbar-width: none;
}
.aj-tabs::-webkit-scrollbar { display: none; }
.aj-tab {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.7rem 1.2rem;
  border: none;
  background: none;
  color: var(--text-secondary);
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
  border-radius: 0;
}
.aj-tab:hover {
  color: var(--text-primary);
  background: var(--bg-tertiary);
}
.aj-tab.active {
  color: var(--color-primary);
  border-bottom-color: var(--color-primary);
  font-weight: 600;
}
.aj-tab-icon { font-size: 1.1rem; }

/* Blog Section */
.aj-blog-section {
  padding: 2.5rem 0 4rem;
}

/* Loading State */
.aj-loading,
.aj-no-blogs {
  text-align: center;
  padding: 4rem 2rem;
}

.aj-loading p,
.aj-no-blogs p {
  color: var(--text-secondary);
  font-size: 1.1rem;
  margin-top: 1rem;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid var(--border-light);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Featured */
.aj-featured {
  display: grid;
  grid-template-columns: 1fr 1fr;
  background: var(--bg-card);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: var(--shadow-md);
  margin-bottom: 2.5rem;
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
  border: 1px solid var(--border-light);
}
.aj-featured:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}
.aj-featured-image {
  background: linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 320px;
}
.aj-featured-emoji {
  font-size: 6rem;
  filter: drop-shadow(0 4px 12px rgba(0,0,0,0.3));
}
.aj-featured-content {
  padding: 2.5rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.aj-category-tag {
  display: inline-block;
  background: var(--color-primary-light);
  color: var(--color-primary-hover);
  padding: 0.25rem 0.8rem;
  border-radius: 50px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.75rem;
  width: fit-content;
}
.aj-featured-title {
  font-size: 1.6rem;
  font-weight: 700;
  margin-bottom: 0.75rem;
  line-height: 1.3;
  color: var(--text-primary);
}
.aj-featured-excerpt {
  color: var(--text-secondary);
  line-height: 1.7;
  margin-bottom: 1rem;
  font-size: 0.95rem;
}
.aj-meta {
  display: flex;
  gap: 1.2rem;
  color: var(--text-tertiary);
  font-size: 0.85rem;
}

/* Blog Grid */
.aj-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}

/* Blog Card */
.aj-card {
  background: var(--bg-card);
  border-radius: 14px;
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
  border: 1px solid var(--border-light);
}
.aj-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}
.aj-card-image {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}
.aj-card-emoji {
  font-size: 3.5rem;
  filter: drop-shadow(0 2px 8px rgba(0,0,0,0.3));
}
.aj-card-tag {
  position: absolute;
  top: 0.75rem;
  left: 0.75rem;
  background: rgba(201, 169, 98, 0.9);
  color: #fff;
  padding: 0.2rem 0.7rem;
  border-radius: 50px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.aj-card-body {
  padding: 1.25rem;
}
.aj-card-title {
  font-size: 1.05rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  line-height: 1.35;
  color: var(--text-primary);
}
.aj-card-excerpt {
  color: var(--text-secondary);
  font-size: 0.85rem;
  line-height: 1.6;
  margin-bottom: 0.75rem;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.aj-card-meta {
  display: flex;
  justify-content: space-between;
  color: var(--text-tertiary);
  font-size: 0.78rem;
}

/* ===== MODAL ===== */
.aj-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 2rem 1rem;
  overflow-y: auto;
}
.aj-modal {
  background: var(--bg-card);
  border-radius: 16px;
  max-width: 720px;
  width: 100%;
  overflow: hidden;
  box-shadow: var(--shadow-xl);
  animation: modalIn 0.3s ease-out;
  margin-top: 2rem;
}
@keyframes modalIn {
  from { opacity: 0; transform: translateY(20px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
.aj-modal-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: rgba(255,255,255,0.15);
  color: #fff;
  font-size: 1.1rem;
  cursor: pointer;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}
.aj-modal-close:hover { background: rgba(255,255,255,0.3); }
.aj-modal-hero {
  background: linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%);
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}
.aj-modal-emoji {
  font-size: 5rem;
  filter: drop-shadow(0 4px 12px rgba(0,0,0,0.3));
}
.aj-modal-body {
  padding: 2rem 2.5rem 2.5rem;
}
.aj-modal-title {
  font-size: 1.8rem;
  font-weight: 800;
  line-height: 1.3;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
}
.aj-modal-content {
  color: var(--text-secondary);
  font-size: 0.95rem;
  line-height: 1.8;
}
.aj-modal-content h2 {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 1.5rem 0 0.75rem;
  padding-bottom: 0.4rem;
  border-bottom: 2px solid var(--color-primary-light);
}
.aj-modal-content ul,
.aj-modal-content ol {
  padding-left: 1.5rem;
  margin: 0.75rem 0;
}
.aj-modal-content li {
  margin-bottom: 0.5rem;
}
.aj-modal-content p {
  margin-bottom: 0.75rem;
}

/* Footer */
.aj-footer {
  background: var(--bg-tertiary);
  border-top: 1px solid var(--border-light);
  padding: 1.5rem 0;
}
.aj-footer-inner {
  text-align: center;
  color: var(--text-tertiary);
  font-size: 0.85rem;
}

/* ===== RESPONSIVE ===== */
@media (max-width: 1024px) {
  .aj-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 768px) {
  .aj-hero-title { font-size: 2rem; }
  .aj-featured { grid-template-columns: 1fr; }
  .aj-featured-image { min-height: 200px; }
  .aj-featured-content { padding: 1.5rem; }
  .aj-grid { grid-template-columns: 1fr; }
  .aj-modal-body { padding: 1.5rem; }
  .aj-modal-title { font-size: 1.4rem; }
}
@media (max-width: 480px) {
  .aj-hero { min-height: 300px; }
  .aj-hero-title { font-size: 1.6rem; }
  .aj-hero-subtitle { font-size: 0.95rem; }
  .aj-tab { padding: 0.6rem 0.8rem; font-size: 0.8rem; }
}
</style>
