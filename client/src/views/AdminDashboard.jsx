/**
 * AdminDashboard – Central admin panel: Users, Blogs, Categories, Shops management.
 */
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import api from '../services/api'
import AppHeader from '../components/layout/AppHeader'
import useAuthStore from '../store/useAuthStore'
import { getAllRequests, approveRequest, rejectRequest } from '../services/shopOwnerRequestService'
import { getAllContactMessages, markMessageAsRead, replyToMessage, deleteContactMessage } from '../services/contactService'
import { getAllSettings, updateSetting } from '../services/settingsService'
import { aiDeepSearch, aiImportResults } from '../services/aiSearchService'
import './AdminDashboard.css'

const emptyBlogForm = { title: '', title_my: '', emoji: '📝', photo: '', category: '', tag: '', excerpt: '', excerpt_my: '', content: '', content_my: '', read_time: '5 min read', published: true }
const emptyCategoryForm = { name_en: '', name_my: '', icon: '📁', slug: '', display_order: 0 }
const emptyShopForm = { name: '', category_id: '', description_en: '', description_my: '', address: '', latitude: '', longitude: '', phone: '', website: '', price_range: '', is_active: true }
const shopCategoryPresets = [
    { slug: 'store', name_en: 'Store', name_my: 'Store', icon: '🏬' },
    { slug: 'restaurant', name_en: 'Restaurant', name_my: 'Restaurant', icon: '🍽️' },
    { slug: 'real-estate', name_en: 'Real Estate', name_my: 'Real Estate', icon: '🏠' },
    { slug: 'travel', name_en: 'Travel', name_my: 'Travel', icon: '✈️' }
]

export default function AdminDashboard() {
    const navigate = useNavigate()
    const { i18n } = useTranslation()
    const { user } = useAuthStore()
    const currentLocale = i18n.language
    const currentUserId = user?.id

    const [activeTab, setActiveTab] = useState('users')

    // Site Settings (feature flags)
    const [siteSettings, setSiteSettings] = useState({})
    const [settingsLoading, setSettingsLoading] = useState(false)

    // AI Deep Search
    const [aiQuery, setAiQuery] = useState('')
    const [aiLocation, setAiLocation] = useState('Tokyo, Japan')
    const [aiCuisine, setAiCuisine] = useState('Burmese')
    const [aiMaxResults, setAiMaxResults] = useState(8)
    const [aiSearching, setAiSearching] = useState(false)
    const [aiResults, setAiResults] = useState([])
    const [aiSelected, setAiSelected] = useState(new Set())
    const [aiImporting, setAiImporting] = useState(false)
    const [aiSearchLog, setAiSearchLog] = useState([])
    const [aiError, setAiError] = useState('')
    const [aiImportCategoryId, setAiImportCategoryId] = useState('')

    // Users
    const [users, setUsers] = useState([])
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [deleteModal, setDeleteModal] = useState({ show: false, user: null })
    const [resetPwModal, setResetPwModal] = useState({ show: false, user: null })
    const [newPassword, setNewPassword] = useState('')
    const [resetSaving, setResetSaving] = useState(false)
    const [adminPwModal, setAdminPwModal] = useState({ show: false, user: null })
    const [adminPassword, setAdminPassword] = useState('')
    const [adminToggleSaving, setAdminToggleSaving] = useState(false)
    const [userSearch, setUserSearch] = useState('')
    const [userRoleFilter, setUserRoleFilter] = useState('all')

    // Blogs
    const [blogs, setBlogs] = useState([])
    const [blogStats, setBlogStats] = useState(null)
    const [blogLoading, setBlogLoading] = useState(false)
    const [blogError, setBlogError] = useState('')
    const [deleteBlogModal, setDeleteBlogModal] = useState({ show: false, blog: null })
    const [blogFormModal, setBlogFormModal] = useState({ show: false, blog: null })
    const [blogSaving, setBlogSaving] = useState(false)
    const [blogForm, setBlogForm] = useState({ ...emptyBlogForm })

    // Categories
    const [categories, setCategories] = useState([])
    const [categoryStats, setCategoryStats] = useState(null)
    const [categoryLoading, setCategoryLoading] = useState(false)
    const [categoryError, setCategoryError] = useState('')
    const [deleteCategoryModal, setDeleteCategoryModal] = useState({ show: false, category: null })
    const [categoryFormModal, setCategoryFormModal] = useState({ show: false, category: null })
    const [categorySaving, setCategorySaving] = useState(false)
    const [categoryForm, setCategoryForm] = useState({ ...emptyCategoryForm })

    // Shops
    const [shops, setShops] = useState([])
    const [shopStats, setShopStats] = useState(null)
    const [shopLoading, setShopLoading] = useState(false)
    const [shopError, setShopError] = useState('')
    const [deleteShopModal, setDeleteShopModal] = useState({ show: false, shop: null })
    const [shopFormModal, setShopFormModal] = useState({ show: false, shop: null })
    const [shopSaving, setShopSaving] = useState(false)
    const [shopForm, setShopForm] = useState({ ...emptyShopForm })
    const [shopPhotos, setShopPhotos] = useState([])
    const [shopTagsText, setShopTagsText] = useState('')
    const [shopLangsText, setShopLangsText] = useState('')

    // Shop Owner Requests
    const [requests, setRequests] = useState([])
    const [requestCounts, setRequestCounts] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 })
    const [requestLoading, setRequestLoading] = useState(false)
    const [requestError, setRequestError] = useState('')
    const [requestFilter, setRequestFilter] = useState('pending')
    const [rejectModal, setRejectModal] = useState({ show: false, request: null })
    const [rejectNote, setRejectNote] = useState('')
    const [requestActionLoading, setRequestActionLoading] = useState(false)

    // Contact Messages
    const [contactMessages, setContactMessages] = useState([])
    const [contactCounts, setContactCounts] = useState({ total: 0, unread: 0, read: 0, replied: 0, archived: 0 })
    const [contactLoading, setContactLoading] = useState(false)
    const [contactError, setContactError] = useState('')
    const [contactFilter, setContactFilter] = useState('')
    const [replyModal, setReplyModal] = useState({ show: false, message: null })
    const [replyText, setReplyText] = useState('')
    const [replySaving, setReplySaving] = useState(false)
    const [deleteContactModal, setDeleteContactModal] = useState({ show: false, message: null })

    // Site Analytics
    const [visitStats, setVisitStats] = useState(null)
    const [visitLoading, setVisitLoading] = useState(false)
    const [visitError, setVisitError] = useState('')
    const [visitDays, setVisitDays] = useState(30)

    const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })

    // ========== USER MANAGEMENT ==========
    const loadData = useCallback(async () => {
        try {
            setLoading(true); setError('')
            const [usersRes, statsRes] = await Promise.all([
                api.get('/admin/users'),
                api.get('/admin/stats')
            ])
            setUsers(usersRes.data.users); setStats(statsRes.data)
        } catch (err) {
            if (err.response?.status === 403) { setError('Access denied. Admin privileges required.'); setTimeout(() => navigate('/'), 2000) }
            else setError('Failed to load admin data')
        } finally { setLoading(false) }
    }, [navigate])

    const openAdminToggle = (u) => { setAdminPwModal({ show: true, user: u }); setAdminPassword('') }
    const toggleAdmin = async (e) => {
        e.preventDefault(); setAdminToggleSaving(true)
        const u = adminPwModal.user
        try {
            await api.patch(`/admin/users/${u.id}/admin`, { is_admin: !u.is_admin, admin_password: adminPassword })
            setAdminPwModal({ show: false, user: null }); setAdminPassword(''); await loadData()
        } catch (err) { alert(err.response?.data?.message || 'Failed to update admin status') }
        finally { setAdminToggleSaving(false) }
    }
    const togglePremium = async (u) => {
        try { await api.patch(`/admin/users/${u.id}/premium`, { is_premium: !u.is_premium, premium_type: u.is_premium ? null : 'lifetime' }); await loadData() }
        catch { alert('Failed to update premium status') }
    }
    const togglePremierOwner = async (u) => {
        const isPremier = u.is_shop_owner && u.premium_type === 'premier'
        const action = isPremier ? 'revoke Premier Shop Owner from' : 'grant Premier Shop Owner to'
        if (!window.confirm(`Are you sure you want to ${action} ${u.email}?`)) return
        try {
            await api.patch(`/admin/users/${u.id}/premier-owner`, { is_premier: !isPremier })
            await loadData()
        } catch { alert('Failed to update premier owner status') }
    }
    const deleteUser = async () => {
        try { await api.delete(`/admin/users/${deleteModal.user.id}`); setDeleteModal({ show: false, user: null }); await loadData() }
        catch { alert('Failed to delete user') }
    }
    const resetUserPassword = async (e) => {
        e.preventDefault(); setResetSaving(true)
        try {
            await api.patch(`/admin/users/${resetPwModal.user.id}/password`, { new_password: newPassword })
            alert(`Password reset successfully for ${resetPwModal.user.email}`)
            setResetPwModal({ show: false, user: null }); setNewPassword('')
        } catch (err) { alert(err.response?.data?.message || 'Failed to reset password') }
        finally { setResetSaving(false) }
    }

    // ========== BLOG MANAGEMENT ==========
    const loadBlogs = useCallback(async () => {
        try {
            setBlogLoading(true); setBlogError('')
            const [blogsRes, statsRes] = await Promise.all([
                api.get('/blogs'),
                api.get('/blogs/admin/stats')
            ])
            setBlogs(blogsRes.data.data); setBlogStats(statsRes.data.data)
        } catch { setBlogError('Failed to load blogs') }
        finally { setBlogLoading(false) }
    }, [])

    const openBlogForm = (blog) => {
        setBlogForm(blog ? { title: blog.title, title_my: blog.title_my || '', emoji: blog.emoji, photo: blog.photo || '', category: blog.category, tag: blog.tag, excerpt: blog.excerpt, excerpt_my: blog.excerpt_my || '', content: blog.content, content_my: blog.content_my || '', read_time: blog.read_time, published: blog.published } : { ...emptyBlogForm })
        setBlogFormModal({ show: true, blog })
    }
    const saveBlog = async (e) => {
        e.preventDefault(); setBlogSaving(true)
        try {
            if (blogFormModal.blog) await api.put(`/blogs/${blogFormModal.blog.id}`, blogForm)
            else await api.post('/blogs', blogForm)
            setBlogFormModal({ show: false, blog: null }); await loadBlogs()
        } catch (err) { alert(err.response?.data?.error || 'Failed to save blog') }
        finally { setBlogSaving(false) }
    }
    const deleteBlog = async () => {
        try { await api.delete(`/blogs/${deleteBlogModal.blog.id}`); setDeleteBlogModal({ show: false, blog: null }); await loadBlogs() }
        catch { alert('Failed to delete blog') }
    }

    // ========== CATEGORY MANAGEMENT ==========
    const loadCategories = useCallback(async () => {
        try {
            setCategoryLoading(true); setCategoryError('')
            const [catsRes, statsRes] = await Promise.all([
                api.get('/categories'),
                api.get('/categories/admin/stats')
            ])
            setCategories(catsRes.data.categories); setCategoryStats(statsRes.data.data)
        } catch { setCategoryError('Failed to load categories') }
        finally { setCategoryLoading(false) }
    }, [])

    const openCategoryForm = (cat) => {
        setCategoryForm(cat ? { name_en: cat.name_en, name_my: cat.name_my, icon: cat.icon, slug: cat.slug, display_order: cat.display_order } : { ...emptyCategoryForm })
        setCategoryFormModal({ show: true, category: cat })
    }
    const saveCategory = async (e) => {
        e.preventDefault(); setCategorySaving(true)
        try {
            if (categoryFormModal.category) await api.put(`/categories/${categoryFormModal.category.id}`, categoryForm)
            else await api.post('/categories', categoryForm)
            setCategoryFormModal({ show: false, category: null }); await loadCategories()
        } catch (err) { alert(err.response?.data?.error || 'Failed to save category') }
        finally { setCategorySaving(false) }
    }
    const deleteCategory = async () => {
        try { await api.delete(`/categories/${deleteCategoryModal.category.id}`); setDeleteCategoryModal({ show: false, category: null }); await loadCategories() }
        catch { alert('Failed to delete category') }
    }

    // ========== SHOP MANAGEMENT ==========
    const loadShops = useCallback(async () => {
        try {
            setShopLoading(true); setShopError('')
            const [shopsRes, statsRes] = await Promise.all([
                api.get('/businesses'),
                api.get('/businesses/admin/stats')
            ])
            setShops(shopsRes.data.businesses || shopsRes.data.data || []); setShopStats(statsRes.data.data)
        } catch { setShopError('Failed to load shops') }
        finally { setShopLoading(false) }
    }, [])

    const openShopForm = (shop) => {
        if (shop) {
            setShopForm({ name: shop.name, category_id: shop.category_id || '', description_en: shop.description_en || '', description_my: shop.description_my || '', address: shop.address || '', latitude: shop.latitude || '', longitude: shop.longitude || '', phone: shop.phone || '', website: shop.website || '', price_range: shop.price_range || '', is_active: shop.is_active !== false })
            setShopPhotos(shop.photos || [])
            setShopTagsText((shop.tags || []).join(', '))
            setShopLangsText((shop.languages_supported || []).join(', '))
        } else {
            setShopForm({ ...emptyShopForm }); setShopPhotos([]); setShopTagsText(''); setShopLangsText('')
        }
        setShopFormModal({ show: true, shop })
    }

    const handleShopPhotoUpload = async (e) => {
        const files = Array.from(e.target.files || [])
        if (!files.length) return

        const imageFiles = files.filter(file => file.type.startsWith('image/'))
        const encodedPhotos = await Promise.all(imageFiles.map(file => new Promise((resolve) => {
            const reader = new FileReader()
            reader.onload = () => resolve(reader.result)
            reader.readAsDataURL(file)
        })))

        setShopPhotos(prev => [...prev, ...encodedPhotos])
        e.target.value = ''
    }

    const removeShopPhoto = (index) => {
        setShopPhotos(prev => prev.filter((_, i) => i !== index))
    }

    const saveShop = async (e) => {
        e.preventDefault(); setShopSaving(true)
        try {
            let categoryId = shopForm.category_id

            if (typeof categoryId === 'string' && categoryId.startsWith('new:')) {
                const slug = categoryId.replace('new:', '')
                const preset = shopCategoryPresets.find(c => c.slug === slug)
                const existingCategory = categories.find(c => c.slug === slug)

                if (existingCategory) {
                    categoryId = existingCategory.id
                } else if (preset) {
                    const createRes = await api.post('/categories', {
                        name_en: preset.name_en,
                        name_my: preset.name_my,
                        icon: preset.icon,
                        slug: preset.slug,
                        display_order: categories.length + 1
                    })
                    categoryId = createRes.data?.data?.id
                    await loadCategories()
                }
            }

            const data = {
                ...shopForm,
                category_id: categoryId,
                photos: shopPhotos,
                tags: shopTagsText.split(',').map(s => s.trim()).filter(Boolean),
                languages_supported: shopLangsText.split(',').map(s => s.trim()).filter(Boolean)
            }
            if (shopFormModal.shop) await api.put(`/businesses/${shopFormModal.shop.id}`, data)
            else await api.post('/businesses', data)
            setShopFormModal({ show: false, shop: null }); await loadShops()
        } catch (err) { alert(err.response?.data?.error || 'Failed to save shop') }
        finally { setShopSaving(false) }
    }
    const toggleShopActive = async (shop) => {
        try { await api.patch(`/businesses/${shop.id}`, { is_active: !shop.is_active }); await loadShops() }
        catch { alert('Failed to toggle shop status') }
    }
    const deleteShop = async () => {
        try { await api.delete(`/businesses/${deleteShopModal.shop.id}`); setDeleteShopModal({ show: false, shop: null }); await loadShops() }
        catch { alert('Failed to delete shop') }
    }

    // ========== SHOP OWNER REQUESTS ==========
    const loadRequests = useCallback(async () => {
        try {
            setRequestLoading(true); setRequestError('')
            const res = await getAllRequests(requestFilter)
            setRequests(res.data.requests || [])
            setRequestCounts(res.data.counts || { total: 0, pending: 0, approved: 0, rejected: 0 })
        } catch { setRequestError('Failed to load shop owner requests') }
        finally { setRequestLoading(false) }
    }, [requestFilter])

    const handleApproveRequest = async (requestId) => {
        if (!window.confirm('Approve this shop owner request? This will create a business and grant shop owner access.')) return
        setRequestActionLoading(true)
        try {
            await approveRequest(requestId, {})
            await loadRequests()
        } catch (err) { alert(err.response?.data?.message || 'Failed to approve request') }
        finally { setRequestActionLoading(false) }
    }

    const handleRejectRequest = async () => {
        setRequestActionLoading(true)
        try {
            await rejectRequest(rejectModal.request.id, { admin_note: rejectNote })
            setRejectModal({ show: false, request: null }); setRejectNote('')
            await loadRequests()
        } catch (err) { alert(err.response?.data?.message || 'Failed to reject request') }
        finally { setRequestActionLoading(false) }
    }

    // ========== WEEKLY CHART DATA ==========
    const weeklyData = useMemo(() => {
        if (!users.length) return []
        const weeks = []
        const now = new Date()
        for (let i = 7; i >= 0; i--) {
            const weekStart = new Date(now)
            weekStart.setDate(now.getDate() - i * 7)
            weekStart.setHours(0, 0, 0, 0)
            const weekEnd = new Date(weekStart)
            weekEnd.setDate(weekStart.getDate() + 7)
            const count = users.filter(u => {
                const d = new Date(u.created_at)
                return d >= weekStart && d < weekEnd
            }).length
            const label = `${weekStart.getDate()}/${weekStart.getMonth() + 1}`
            weeks.push({ label, count, start: weekStart })
        }
        return weeks
    }, [users])

    const filteredUsers = useMemo(() => {
        let list = users
        if (userSearch.trim()) {
            const q = userSearch.toLowerCase()
            list = list.filter(u => (u.name || '').toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
        }
        if (userRoleFilter === 'admin') list = list.filter(u => u.is_admin)
        else if (userRoleFilter === 'premium') list = list.filter(u => u.is_premium)
        else if (userRoleFilter === 'shop_owner') list = list.filter(u => u.is_shop_owner)
        else if (userRoleFilter === 'google') list = list.filter(u => u.google_id)
        return list
    }, [users, userSearch, userRoleFilter])

    useEffect(() => { loadData() }, [loadData])
    useEffect(() => { if (activeTab === 'blogs') loadBlogs() }, [activeTab, loadBlogs])
    useEffect(() => { if (activeTab === 'categories') loadCategories() }, [activeTab, loadCategories])
    useEffect(() => { if (activeTab === 'shops') loadShops() }, [activeTab, loadShops])
    useEffect(() => { if (activeTab === 'requests') loadRequests() }, [activeTab, loadRequests])

    // ========== CONTACT MESSAGES ==========
    const loadContacts = useCallback(async () => {
        try {
            setContactLoading(true); setContactError('')
            const res = await getAllContactMessages(contactFilter)
            setContactMessages(res.data.messages || [])
            setContactCounts(res.data.counts || { total: 0, unread: 0, read: 0, replied: 0, archived: 0 })
        } catch { setContactError('Failed to load contact messages') }
        finally { setContactLoading(false) }
    }, [contactFilter])

    const handleMarkRead = async (msgId) => {
        try { await markMessageAsRead(msgId); await loadContacts() }
        catch { alert('Failed to mark as read') }
    }

    const handleReply = async () => {
        if (!replyText.trim()) return
        setReplySaving(true)
        try {
            await replyToMessage(replyModal.message.id, replyText)
            setReplyModal({ show: false, message: null }); setReplyText('')
            await loadContacts()
        } catch (err) { alert(err.response?.data?.message || 'Failed to send reply') }
        finally { setReplySaving(false) }
    }

    const handleDeleteContact = async () => {
        try {
            await deleteContactMessage(deleteContactModal.message.id)
            setDeleteContactModal({ show: false, message: null })
            await loadContacts()
        } catch { alert('Failed to delete message') }
    }

    useEffect(() => { if (activeTab === 'contacts') loadContacts() }, [activeTab, loadContacts])

    // ========== SITE ANALYTICS ==========
    const loadVisitStats = useCallback(async () => {
        try {
            setVisitLoading(true); setVisitError('')
            const res = await api.get(`/visits/stats?days=${visitDays}`)
            setVisitStats(res.data)
        } catch { setVisitError('Failed to load visit statistics') }
        finally { setVisitLoading(false) }
    }, [visitDays])

    useEffect(() => { if (activeTab === 'analytics') loadVisitStats() }, [activeTab, loadVisitStats])

    // Load site settings when Settings tab is active
    const loadSiteSettings = useCallback(async () => {
        setSettingsLoading(true)
        try {
            const res = await getAllSettings()
            setSiteSettings(res.data?.data || {})
        } catch { setSiteSettings({}) }
        finally { setSettingsLoading(false) }
    }, [])
    useEffect(() => { if (activeTab === 'settings') loadSiteSettings() }, [activeTab, loadSiteSettings])

    const toggleFeatureFlag = async (key) => {
        const current = siteSettings[key] || { enabled: false }
        const newValue = { enabled: !current.enabled }
        try {
            await updateSetting(key, newValue)
            setSiteSettings(prev => ({ ...prev, [key]: newValue }))
        } catch { alert('Failed to update setting') }
    }

    // AI Search handlers
    const addSearchLog = (msg, type = 'info') => {
        setAiSearchLog(prev => [...prev, { msg, type, time: new Date().toLocaleTimeString() }])
    }

    const runAiSearch = async () => {
        if (!aiQuery.trim()) return
        setAiSearching(true)
        setAiResults([])
        setAiSelected(new Set())
        setAiError('')
        setAiSearchLog([])

        addSearchLog('🤖 Initializing AI Deep Search bot...', 'system')
        addSearchLog(`🔍 Query: "${aiQuery}"`, 'info')
        addSearchLog(`📍 Location: ${aiLocation}`, 'info')
        addSearchLog(`🍜 Cuisine: ${aiCuisine}`, 'info')

        setTimeout(() => addSearchLog('🌐 Scanning Facebook Myanmar communities...', 'search'), 500)
        setTimeout(() => addSearchLog('📱 Crawling Google Maps listings...', 'search'), 1200)
        setTimeout(() => addSearchLog('🗾 Searching Tabelog & Hot Pepper...', 'search'), 1800)
        setTimeout(() => addSearchLog('📸 Analyzing Instagram food posts...', 'search'), 2400)
        setTimeout(() => addSearchLog('💬 Mining Myanmar community forums...', 'search'), 3000)

        try {
            const res = await aiDeepSearch({
                query: aiQuery,
                location: aiLocation,
                cuisine: aiCuisine,
                maxResults: aiMaxResults
            })
            const results = res.data?.data || []
            setAiResults(results)
            addSearchLog(`✅ Found ${results.length} restaurants!`, 'success')
            if (results.length === 0) {
                addSearchLog('No new restaurants found. Try a different query.', 'warn')
            }
        } catch (err) {
            const msg = err.response?.data?.error || err.message || 'Search failed'
            const isQuota = msg.toLowerCase().includes('quota') || msg.includes('429') || msg.includes('rate')
            const displayMsg = isQuota
                ? '⚠️ Gemini API quota exhausted. The bot will auto-retry with fallback models. If this persists, wait a few minutes or upgrade your plan at https://ai.google.dev/pricing'
                : msg
            setAiError(displayMsg)
            addSearchLog(`❌ Error: ${displayMsg}`, 'error')
        } finally {
            setAiSearching(false)
        }
    }

    const toggleAiSelect = (index) => {
        setAiSelected(prev => {
            const next = new Set(prev)
            next.has(index) ? next.delete(index) : next.add(index)
            return next
        })
    }

    const selectAllAi = () => {
        if (aiSelected.size === aiResults.length) {
            setAiSelected(new Set())
        } else {
            setAiSelected(new Set(aiResults.map((_, i) => i)))
        }
    }

    const importSelectedAi = async () => {
        if (aiSelected.size === 0) return
        setAiImporting(true)
        addSearchLog(`📦 Importing ${aiSelected.size} restaurants to database...`, 'system')
        try {
            const selectedRestaurants = [...aiSelected].map(i => aiResults[i])
            const res = await aiImportResults({
                restaurants: selectedRestaurants,
                category_id: aiImportCategoryId || undefined
            })
            const data = res.data
            addSearchLog(`✅ ${data.message}`, 'success')
            if (data.imported?.length > 0) {
                data.imported.forEach(r => addSearchLog(`  ✓ Added: ${r.name}`, 'success'))
            }
            if (data.skipped?.length > 0) {
                data.skipped.forEach(r => addSearchLog(`  ⚠ Skipped: ${r.name} (${r.reason})`, 'warn'))
            }
            // Remove imported items from results
            const importedNames = new Set((data.imported || []).map(r => r.name))
            setAiResults(prev => prev.filter(r => !importedNames.has(r.name)))
            setAiSelected(new Set())
        } catch (err) {
            addSearchLog(`❌ Import failed: ${err.response?.data?.error || err.message}`, 'error')
        } finally {
            setAiImporting(false)
        }
    }

    const bf = (field) => (e) => setBlogForm(p => ({ ...p, [field]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))
    const cf = (field) => (e) => setCategoryForm(p => ({ ...p, [field]: e.target.type === 'number' ? Number(e.target.value) : e.target.value }))
    const sf = (field) => (e) => setShopForm(p => ({ ...p, [field]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))

    const shopCategoryOptions = useMemo(() => {
        const existing = categories.map(c => ({
            value: String(c.id),
            label: `${c.icon} ${c.name_en}`
        }))

        const missingPresets = shopCategoryPresets
            .filter(preset => !categories.some(c => c.slug === preset.slug))
            .map(preset => ({
                value: `new:${preset.slug}`,
                label: `${preset.icon} ${preset.name_en}`
            }))

        return [...existing, ...missingPresets]
    }, [categories])

    return (
        <div className="admin-dashboard">
            <AppHeader />
            <div className="admin-container"><div className="container">
                <div className="page-header"><h1>👨‍💼 Admin Dashboard</h1><p className="subtitle">Manage Users, Blogs & Statistics</p></div>

                <div className="tab-nav">
                    {['users', 'blogs', 'categories', 'shops', 'requests', 'contacts', 'analytics', 'ai-search', 'settings'].map(tab => (
                        <button key={tab} className={`tab-btn ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
                            {tab === 'users' ? '👥' : tab === 'blogs' ? '📝' : tab === 'categories' ? '📂' : tab === 'shops' ? '🏪' : tab === 'requests' ? '📋' : tab === 'contacts' ? '📩' : tab === 'analytics' ? '📊' : tab === 'ai-search' ? '🤖' : '⚙️'} {tab === 'ai-search' ? 'AI Search' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                            {tab === 'requests' && requestCounts.pending > 0 && <span className="badge-count">{requestCounts.pending}</span>}
                            {tab === 'contacts' && contactCounts.unread > 0 && <span className="badge-count">{contactCounts.unread}</span>}
                        </button>
                    ))}
                </div>

                {/* ===== USERS TAB ===== */}
                {activeTab === 'users' && (<>
                    {/* Overview numbers */}
                    {stats && <div className="user-overview">
                        {[{ val: stats.totalUsers, lbl: 'Total', cls: '' },
                          { val: stats.verifiedUsers, lbl: 'Verified', cls: 'verified' },
                          { val: stats.newUsersLast7Days, lbl: 'This Week', cls: 'new' },
                          { val: stats.adminUsers, lbl: 'Admins', cls: 'admin' },
                          { val: stats.premiumUsers || 0, lbl: 'Premium', cls: 'premium' },
                          { val: stats.googleUsers || 0, lbl: 'Google', cls: 'google' }
                        ].map((s, i) => (
                            <div key={i} className={`user-stat-item ${s.cls}`}>
                                <span className="user-stat-num">{s.val}</span>
                                <span className="user-stat-lbl">{s.lbl}</span>
                            </div>
                        ))}
                    </div>}

                    {/* Weekly registration chart */}
                    {weeklyData.length > 0 && (() => {
                        const maxCount = Math.max(...weeklyData.map(w => w.count), 1)
                        const barWidth = 40
                        const gap = 12
                        const chartHeight = 120
                        const svgWidth = weeklyData.length * (barWidth + gap)
                        return (
                            <div className="user-chart-wrap">
                                <div className="user-chart-header">
                                    <span className="user-chart-title">New Users by Week</span>
                                    <span className="user-chart-total">{users.length} total users</span>
                                </div>
                                <div className="user-chart-scroll">
                                    <svg width={svgWidth} height={chartHeight + 28} className="user-chart-svg">
                                        {weeklyData.map((w, i) => {
                                            const barH = Math.max((w.count / maxCount) * chartHeight, 2)
                                            const x = i * (barWidth + gap) + gap / 2
                                            const y = chartHeight - barH
                                            return (
                                                <g key={i}>
                                                    <rect x={x} y={y} width={barWidth} height={barH} rx={4} className="user-chart-bar" />
                                                    {w.count > 0 && <text x={x + barWidth / 2} y={y - 4} textAnchor="middle" className="user-chart-val">{w.count}</text>}
                                                    <text x={x + barWidth / 2} y={chartHeight + 16} textAnchor="middle" className="user-chart-label">{w.label}</text>
                                                </g>
                                            )
                                        })}
                                    </svg>
                                </div>
                            </div>
                        )
                    })()}

                    {/* Search + filter bar */}
                    <div className="user-toolbar">
                        <input className="user-search" type="text" placeholder="Search by name or email..." value={userSearch} onChange={e => setUserSearch(e.target.value)} />
                        <div className="user-filters">
                            {[{ val: 'all', lbl: 'All' }, { val: 'admin', lbl: 'Admins' }, { val: 'premium', lbl: 'Premium' }, { val: 'shop_owner', lbl: 'Shop Owners' }, { val: 'google', lbl: 'Google' }].map(f => (
                                <button key={f.val} className={`user-filter-btn${userRoleFilter === f.val ? ' active' : ''}`} onClick={() => setUserRoleFilter(f.val)}>{f.lbl}</button>
                            ))}
                        </div>
                    </div>

                    {/* User list */}
                    <div className="user-list-section">
                        {loading ? <div className="loading">Loading users...</div> : error ? <div className="error">{error}</div> : filteredUsers.length === 0 ? (
                            <div className="contact-empty">No users found</div>
                        ) : (
                            <div className="user-list">
                                {filteredUsers.map(u => (
                                    <div key={u.id} className={`user-card${u.id === currentUserId ? ' user-card-self' : ''}`}>
                                        <div className="user-card-left">
                                            <div className="user-avatar">{(u.name || u.email)[0].toUpperCase()}</div>
                                            <div className="user-card-info">
                                                <div className="user-card-name">
                                                    {u.name || 'Unnamed'}
                                                    {u.id === currentUserId && <span className="user-you-tag">You</span>}
                                                    {u.ownedBusinesses?.length > 0 && <span className="user-shop-name">🏪 {u.ownedBusinesses.map(b => b.name).join(', ')}</span>}
                                                </div>
                                                <div className="user-card-email">{u.email}</div>
                                                <div className="user-card-tags">
                                                    {u.is_admin && <span className="utag utag-admin">Admin</span>}
                                                    {u.google_id && <span className="utag utag-google">Google</span>}
                                                    {u.email_verified && <span className="utag utag-verified">Verified</span>}
                                                    {u.is_premium && <span className="utag utag-premium">{u.premium_type || 'Premium'}</span>}
                                                    {u.is_shop_owner && <span className="utag utag-shop">Shop Owner</span>}
                                                    {u.is_shop_owner && u.premium_type === 'premier' && <span className="utag utag-premier">Premier</span>}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="user-card-right">
                                            <span className="user-card-date">{formatDate(u.created_at)}</span>
                                            {u.id !== currentUserId && (
                                                <div className="user-card-actions">
                                                    <button onClick={() => openAdminToggle(u)} className={`ubtn ${u.is_admin ? 'ubtn-warn' : 'ubtn-default'}`}>{u.is_admin ? 'Remove Admin' : 'Make Admin'}</button>
                                                    <button onClick={() => togglePremium(u)} className={`ubtn ${u.is_premium ? 'ubtn-warn' : 'ubtn-default'}`}>{u.is_premium ? 'Remove Premium' : 'Give Premium'}</button>
                                                    <button onClick={() => togglePremierOwner(u)} className={`ubtn ${u.is_shop_owner && u.premium_type === 'premier' ? 'ubtn-warn' : 'ubtn-accent'}`}>{u.is_shop_owner && u.premium_type === 'premier' ? 'Revoke Premier' : 'Grant Premier'}</button>
                                                    <button onClick={() => { setResetPwModal({ show: true, user: u }); setNewPassword('') }} className="ubtn ubtn-default">Reset PW</button>
                                                    <button onClick={() => setDeleteModal({ show: true, user: u })} className="ubtn ubtn-danger">Delete</button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </>)}

                {/* ===== BLOGS TAB ===== */}
                {activeTab === 'blogs' && (<>
                    {blogStats && <div className="stats-grid">
                        {[{ icon: '📝', val: blogStats.totalBlogs, lbl: 'Total Blogs' }, { icon: '✅', val: blogStats.publishedBlogs, lbl: 'Published' }, { icon: '📄', val: blogStats.draftBlogs, lbl: 'Drafts' }, { icon: '👁️', val: blogStats.totalViews, lbl: 'Total Views' }].map((s, i) => (
                            <div key={i} className="stat-card"><div className="stat-icon">{s.icon}</div><div className="stat-info"><div className="stat-number">{s.val}</div><div className="stat-label">{s.lbl}</div></div></div>
                        ))}
                    </div>}
                    <div className="blogs-section">
                        <div className="section-header"><h2>Manage Blogs</h2><button onClick={() => openBlogForm(null)} className="btn-primary">➕ Create New Blog</button></div>
                        {blogLoading ? <div className="loading">Loading blogs...</div> : blogError ? <div className="error">{blogError}</div> : (
                            <div className="blogs-grid">
                                {blogs.map(blog => (
                                    <div key={blog.id} className="blog-card">
                                        <div className="blog-header">
                                            {blog.photo ? <div className="blog-photo"><img src={blog.photo} alt={blog.title} /></div> : <div className="blog-photo placeholder"><span className="emoji">{blog.emoji}</span></div>}
                                            <span className={`blog-status ${blog.published ? 'published' : 'draft'}`}>{blog.published ? '✓ Published' : '📄 Draft'}</span>
                                        </div>
                                        <div className="blog-body">
                                            <h3>{currentLocale === 'my' ? (blog.title_my || blog.title) : blog.title}</h3>
                                            <p className="blog-meta"><span className="category-tag">{blog.category}</span><span>{blog.read_time}</span></p>
                                            <p className="blog-excerpt">{currentLocale === 'my' ? (blog.excerpt_my || blog.excerpt) : blog.excerpt}</p>
                                            <div className="blog-stats"><span>👁️ {blog.views} views</span><span>📅 {formatDate(blog.created_at)}</span></div>
                                        </div>
                                        <div className="blog-actions"><button onClick={() => openBlogForm(blog)} className="btn-edit">✏️ Edit</button><button onClick={() => setDeleteBlogModal({ show: true, blog })} className="btn-delete">🗑️ Delete</button></div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </>)}

                {/* ===== CATEGORIES TAB ===== */}
                {activeTab === 'categories' && (<>
                    {categoryStats && <div className="stats-grid">
                        {[{ icon: '📂', val: categoryStats.totalCategories, lbl: 'Total Categories' }, { icon: '🏪', val: categoryStats.totalBusinesses, lbl: 'Total Shops' }].map((s, i) => (
                            <div key={i} className="stat-card"><div className="stat-icon">{s.icon}</div><div className="stat-info"><div className="stat-number">{s.val}</div><div className="stat-label">{s.lbl}</div></div></div>
                        ))}
                    </div>}
                    <div className="blogs-section">
                        <div className="section-header"><h2>Manage Categories</h2><button onClick={() => openCategoryForm(null)} className="btn-primary">➕ Add Category</button></div>
                        {categoryLoading ? <div className="loading">Loading categories...</div> : categoryError ? <div className="error">{categoryError}</div> : (
                            <div className="category-list">
                                {categories.map(cat => (
                                    <div key={cat.id} className="category-row">
                                        <div className="category-info"><span className="category-icon">{cat.icon}</span><div><h4>{cat.name_en}</h4><p className="category-names">🇲🇲 {cat.name_my}</p><span className="category-slug">slug: {cat.slug} • order: {cat.display_order}</span></div></div>
                                        <div className="category-actions"><button onClick={() => openCategoryForm(cat)} className="btn-edit">✏️ Edit</button><button onClick={() => setDeleteCategoryModal({ show: true, category: cat })} className="btn-delete">🗑️ Delete</button></div>
                                    </div>
                                ))}
                                {categories.length === 0 && <div className="loading">No categories found.</div>}
                            </div>
                        )}
                    </div>
                </>)}

                {/* ===== SHOPS TAB ===== */}
                {activeTab === 'shops' && (<>
                    {shopStats && <div className="stats-grid">
                        {[{ icon: '🏪', val: shopStats.totalBusinesses, lbl: 'Total Shops' }, { icon: '✅', val: shopStats.activeBusinesses, lbl: 'Active' }, { icon: '🚫', val: shopStats.inactiveBusinesses, lbl: 'Inactive' }].map((s, i) => (
                            <div key={i} className="stat-card"><div className="stat-icon">{s.icon}</div><div className="stat-info"><div className="stat-number">{s.val}</div><div className="stat-label">{s.lbl}</div></div></div>
                        ))}
                    </div>}
                    <div className="blogs-section">
                        <div className="section-header"><h2>Manage Shops</h2><button onClick={() => openShopForm(null)} className="btn-primary">➕ Add Shop</button></div>
                        {shopLoading ? <div className="loading">Loading shops...</div> : shopError ? <div className="error">{shopError}</div> : (
                            <div className="blogs-grid">
                                {shops.map(shop => (
                                    <div key={shop.id} className="blog-card">
                                        <div className="blog-header">
                                            {shop.photos?.length ? <div className="blog-photo"><img src={shop.photos[0]} alt={shop.name} /></div> : <div className="blog-photo placeholder"><span className="emoji">🏪</span></div>}
                                            <span className={`blog-status ${shop.is_active ? 'published' : 'draft'}`}>{shop.is_active ? '✓ Active' : '🚫 Inactive'}</span>
                                        </div>
                                        <div className="blog-body">
                                            <h3>{shop.name}</h3>
                                            <p className="blog-meta"><span className="category-tag">{shop.category?.name_en || 'No category'}</span>{shop.price_range && <span>{shop.price_range}</span>}</p>
                                            <p className="blog-excerpt">{shop.description_en || 'No description'}</p>
                                            <div className="blog-stats">{shop.address && <span>📍 {shop.address}</span>}{shop.phone && <span>📞 {shop.phone}</span>}</div>
                                        </div>
                                        <div className="blog-actions">
                                            <button onClick={() => toggleShopActive(shop)} className="btn-edit" style={{ flex: 0 }}>{shop.is_active ? '🚫' : '✅'}</button>
                                            <button onClick={() => openShopForm(shop)} className="btn-edit">✏️ Edit</button>
                                            <button onClick={() => setDeleteShopModal({ show: true, shop })} className="btn-delete">🗑️ Delete</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        {!shopLoading && !shopError && shops.length === 0 && <div className="loading">No shops found.</div>}
                    </div>
                </>)}
                {/* ===== REQUESTS TAB ===== */}
                {activeTab === 'requests' && (<>
                    <div className="stats-grid">
                        {[{ icon: '📋', val: requestCounts.total, lbl: 'Total Requests' }, { icon: '⏳', val: requestCounts.pending, lbl: 'Pending' }, { icon: '✅', val: requestCounts.approved, lbl: 'Approved' }, { icon: '❌', val: requestCounts.rejected, lbl: 'Rejected' }].map((s, i) => (
                            <div key={i} className="stat-card"><div className="stat-icon">{s.icon}</div><div className="stat-info"><div className="stat-number">{s.val}</div><div className="stat-label">{s.lbl}</div></div></div>
                        ))}
                    </div>
                    <div className="blogs-section">
                        <div className="section-header">
                            <h2>Shop Owner Requests</h2>
                            <select className="filter-select" value={requestFilter} onChange={e => setRequestFilter(e.target.value)}>
                                <option value="">All</option>
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>
                        {requestLoading ? <div className="loading">Loading requests...</div> : requestError ? <div className="error">{requestError}</div> : requests.length === 0 ? (
                            <div className="loading">No {requestFilter || ''} requests found.</div>
                        ) : (
                            <div className="requests-list">
                                {requests.map(req => (
                                    <div key={req.id} className={`request-card request-${req.status}`}>
                                        <div className="request-header">
                                            <div className="request-user">
                                                <span className="request-avatar">👤</span>
                                                <div>
                                                    <strong>{req.user?.name || 'Unknown'}</strong>
                                                    <span className="request-email">{req.user?.email}</span>
                                                </div>
                                            </div>
                                            <span className={`status-badge status-${req.status}`}>{req.status === 'pending' ? '⏳ Pending' : req.status === 'approved' ? '✅ Approved' : '❌ Rejected'}</span>
                                        </div>
                                        <div className="request-details">
                                            <div className="request-detail"><strong>🏪 Shop Name:</strong> {req.shop_name}</div>
                                            <div className="request-detail"><strong>📂 Category:</strong> {req.shop_category || 'N/A'}</div>
                                            {req.shop_description && <div className="request-detail"><strong>📝 Description:</strong> {req.shop_description}</div>}
                                            {req.shop_phone && <div className="request-detail"><strong>📞 Phone:</strong> {req.shop_phone}</div>}
                                            {req.shop_address && <div className="request-detail"><strong>📍 Address:</strong> {req.shop_address}</div>}
                                            {req.message && <div className="request-detail"><strong>💬 Message:</strong> {req.message}</div>}
                                            <div className="request-detail"><strong>📅 Submitted:</strong> {formatDate(req.createdAt || req.created_at)}</div>
                                            {req.admin_note && <div className="request-detail"><strong>📝 Admin Note:</strong> {req.admin_note}</div>}
                                        </div>
                                        {req.status === 'pending' && (
                                            <div className="request-actions">
                                                <button className="btn-action promote" disabled={requestActionLoading} onClick={() => handleApproveRequest(req.id)}>✅ Approve</button>
                                                <button className="btn-action delete" disabled={requestActionLoading} onClick={() => { setRejectModal({ show: true, request: req }); setRejectNote('') }}>❌ Reject</button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </>)}

                {/* ===== CONTACTS TAB ===== */}
                {activeTab === 'contacts' && (<>
                    <div className="contact-stats-bar">
                        {[{ val: contactCounts.total, lbl: 'All', filter: '' },
                          { val: contactCounts.unread, lbl: 'Unread', filter: 'unread' },
                          { val: contactCounts.read, lbl: 'Read', filter: 'read' },
                          { val: contactCounts.replied, lbl: 'Replied', filter: 'replied' },
                          { val: contactCounts.archived, lbl: 'Archived', filter: 'archived' }
                        ].map(s => (
                            <button key={s.filter} className={`contact-stat-pill ${s.filter || 'all'}${contactFilter === s.filter ? ' active' : ''}`} onClick={() => setContactFilter(s.filter)}>
                                {s.filter && <span className={`contact-dot dot-${s.filter}`} />}
                                <span className="contact-stat-count">{s.val}</span>
                                <span className="contact-stat-label">{s.lbl}</span>
                            </button>
                        ))}
                    </div>

                    <div className="contact-list-section">
                        {contactLoading ? <div className="loading">Loading messages...</div> : contactError ? <div className="error">{contactError}</div> : contactMessages.length === 0 ? (
                            <div className="contact-empty">No {contactFilter || ''} messages found</div>
                        ) : (
                            <div className="contact-list">
                                {contactMessages.map(msg => (
                                    <div key={msg.id} className={`contact-card contact-card-${msg.status}`}>
                                        <div className="contact-card-top">
                                            <div className="contact-sender">
                                                <span className={`contact-dot dot-${msg.status}`} />
                                                <span className="contact-sender-name">{msg.sender?.name || 'Unknown'}</span>
                                                <span className="contact-sender-email">{msg.sender?.email}</span>
                                                {msg.sender?.is_shop_owner && <span className="contact-tag tag-shop">Shop Owner</span>}
                                                {msg.sender?.premium_type === 'premier' && <span className="contact-tag tag-premier">Premier</span>}
                                            </div>
                                            <div className="contact-card-right">
                                                <span className="contact-date">{formatDate(msg.createdAt || msg.created_at)}</span>
                                                <span className={`contact-status-label status-${msg.status}`}>{msg.status}</span>
                                            </div>
                                        </div>

                                        <div className="contact-card-body">
                                            <div className="contact-subject-line">
                                                <span className="contact-subject">{msg.subject}</span>
                                                {msg.category && <span className="contact-category">{msg.category}</span>}
                                            </div>
                                            <p className="contact-message">{msg.message}</p>

                                            {msg.photos && msg.photos.length > 0 && (
                                                <div className="contact-photos-grid">
                                                    {msg.photos.map((photo, idx) => (
                                                        <img key={idx} src={photo} alt={`Attachment ${idx + 1}`} className="contact-photo-thumb" onClick={() => window.open(photo, '_blank')} />
                                                    ))}
                                                </div>
                                            )}

                                            {msg.admin_reply && (
                                                <div className="contact-reply-block">
                                                    <div className="contact-reply-header">Admin Reply</div>
                                                    <p>{msg.admin_reply}</p>
                                                    {msg.replied_at && <span className="contact-reply-date">{formatDate(msg.replied_at)}</span>}
                                                </div>
                                            )}
                                        </div>

                                        <div className="contact-actions">
                                            {msg.status === 'unread' && <button className="contact-btn btn-read" onClick={() => handleMarkRead(msg.id)}>Mark Read</button>}
                                            {msg.status !== 'replied' && <button className="contact-btn btn-reply" onClick={() => { setReplyModal({ show: true, message: msg }); setReplyText('') }}>Reply</button>}
                                            <button className="contact-btn btn-delete" onClick={() => setDeleteContactModal({ show: true, message: msg })}>Delete</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </>)}

                {/* ===== ANALYTICS TAB ===== */}
                {activeTab === 'analytics' && (<>
                    <div className="analytics-section">
                        <div className="section-header">
                            <h2>📊 Site Access Analytics</h2>
                            <div className="analytics-period-btns">
                                {[{ val: 7, lbl: '7 Days' }, { val: 14, lbl: '14 Days' }, { val: 30, lbl: '30 Days' }, { val: 90, lbl: '90 Days' }].map(p => (
                                    <button key={p.val} className={`user-filter-btn${visitDays === p.val ? ' active' : ''}`} onClick={() => setVisitDays(p.val)}>{p.lbl}</button>
                                ))}
                            </div>
                        </div>

                        {visitLoading ? <div className="loading">Loading analytics...</div> : visitError ? <div className="error">{visitError}</div> : visitStats && (<>
                            {/* Overview cards */}
                            <div className="analytics-overview">
                                {[
                                    { icon: '🌐', val: visitStats.grandTotal, lbl: 'Total Visits', cls: 'total' },
                                    { icon: '📅', val: visitStats.todayCount, lbl: 'Today', cls: 'today' },
                                    { icon: '👤', val: visitStats.totals.anonymous, lbl: 'Anonymous', cls: 'anon' },
                                    { icon: '👥', val: visitStats.totals.user, lbl: 'Users', cls: 'user' },
                                    { icon: '🏪', val: visitStats.totals.shop_owner, lbl: 'Shop Owners', cls: 'shop' }
                                ].map((s, i) => (
                                    <div key={i} className={`analytics-stat-card analytics-${s.cls}`}>
                                        <span className="analytics-stat-icon">{s.icon}</span>
                                        <span className="analytics-stat-num">{s.val}</span>
                                        <span className="analytics-stat-lbl">{s.lbl}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Stacked bar chart */}
                            {visitStats.daily?.length > 0 && (() => {
                                const data = visitStats.daily
                                const maxCount = Math.max(...data.map(d => d.anonymous + d.user + d.shop_owner), 1)
                                const barWidth = 28
                                const gap = 4
                                const chartHeight = 180
                                const svgWidth = data.length * (barWidth + gap) + gap
                                const colors = { anonymous: '#94a3b8', user: '#3b82f6', shop_owner: '#f59e0b' }

                                return (
                                    <div className="analytics-chart-wrap">
                                        <div className="analytics-chart-header">
                                            <span className="analytics-chart-title">Daily Visits by Type</span>
                                            <div className="analytics-legend">
                                                <span className="analytics-legend-item"><span className="analytics-dot" style={{ background: colors.anonymous }} /> Anonymous</span>
                                                <span className="analytics-legend-item"><span className="analytics-dot" style={{ background: colors.user }} /> Users</span>
                                                <span className="analytics-legend-item"><span className="analytics-dot" style={{ background: colors.shop_owner }} /> Shop Owners</span>
                                            </div>
                                        </div>
                                        <div className="analytics-chart-scroll">
                                            <svg width={svgWidth} height={chartHeight + 36} className="analytics-chart-svg">
                                                {data.map((d, i) => {
                                                    const total = d.anonymous + d.user + d.shop_owner
                                                    const fullH = Math.max((total / maxCount) * chartHeight, 2)
                                                    const x = i * (barWidth + gap) + gap
                                                    const shopH = (d.shop_owner / maxCount) * chartHeight
                                                    const userH = (d.user / maxCount) * chartHeight
                                                    const anonH = (d.anonymous / maxCount) * chartHeight
                                                    const dateLabel = d.date.slice(5) // MM-DD
                                                    return (
                                                        <g key={i}>
                                                            {/* anonymous (bottom) */}
                                                            <rect x={x} y={chartHeight - anonH} width={barWidth} height={Math.max(anonH, 0)} rx={0} fill={colors.anonymous} />
                                                            {/* user (middle) */}
                                                            <rect x={x} y={chartHeight - anonH - userH} width={barWidth} height={Math.max(userH, 0)} rx={0} fill={colors.user} />
                                                            {/* shop_owner (top) */}
                                                            <rect x={x} y={chartHeight - anonH - userH - shopH} width={barWidth} height={Math.max(shopH, 0)} rx={2} fill={colors.shop_owner} />
                                                            {total > 0 && <text x={x + barWidth / 2} y={chartHeight - fullH - 4} textAnchor="middle" className="analytics-chart-val">{total}</text>}
                                                            {i % (data.length > 30 ? 7 : data.length > 14 ? 3 : 1) === 0 && (
                                                                <text x={x + barWidth / 2} y={chartHeight + 16} textAnchor="middle" className="analytics-chart-label">{dateLabel}</text>
                                                            )}
                                                        </g>
                                                    )
                                                })}
                                            </svg>
                                        </div>
                                    </div>
                                )
                            })()}

                            {/* Pie chart summary */}
                            {(() => {
                                const total = visitStats.grandTotal || 1
                                const pcts = {
                                    anonymous: Math.round((visitStats.totals.anonymous / total) * 100),
                                    user: Math.round((visitStats.totals.user / total) * 100),
                                    shop_owner: Math.round((visitStats.totals.shop_owner / total) * 100)
                                }
                                const r = 60, cx = 80, cy = 80
                                const circumference = 2 * Math.PI * r
                                const anonArc = (visitStats.totals.anonymous / total) * circumference
                                const userArc = (visitStats.totals.user / total) * circumference
                                const shopArc = (visitStats.totals.shop_owner / total) * circumference

                                return (
                                    <div className="analytics-pie-wrap">
                                        <div className="analytics-pie-header">Visitor Distribution</div>
                                        <div className="analytics-pie-content">
                                            <svg width={160} height={160} className="analytics-pie-svg">
                                                <circle cx={cx} cy={cy} r={r} fill="none" stroke="#94a3b8" strokeWidth="20"
                                                    strokeDasharray={`${anonArc} ${circumference - anonArc}`}
                                                    strokeDashoffset={0}
                                                    transform={`rotate(-90 ${cx} ${cy})`} />
                                                <circle cx={cx} cy={cy} r={r} fill="none" stroke="#3b82f6" strokeWidth="20"
                                                    strokeDasharray={`${userArc} ${circumference - userArc}`}
                                                    strokeDashoffset={-anonArc}
                                                    transform={`rotate(-90 ${cx} ${cy})`} />
                                                <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f59e0b" strokeWidth="20"
                                                    strokeDasharray={`${shopArc} ${circumference - shopArc}`}
                                                    strokeDashoffset={-(anonArc + userArc)}
                                                    transform={`rotate(-90 ${cx} ${cy})`} />
                                                <text x={cx} y={cy - 6} textAnchor="middle" className="analytics-pie-total">{visitStats.grandTotal}</text>
                                                <text x={cx} y={cy + 12} textAnchor="middle" className="analytics-pie-label-text">visits</text>
                                            </svg>
                                            <div className="analytics-pie-legend">
                                                <div className="analytics-pie-row"><span className="analytics-dot" style={{ background: '#94a3b8' }} /> Anonymous <strong>{pcts.anonymous}%</strong> ({visitStats.totals.anonymous})</div>
                                                <div className="analytics-pie-row"><span className="analytics-dot" style={{ background: '#3b82f6' }} /> Users <strong>{pcts.user}%</strong> ({visitStats.totals.user})</div>
                                                <div className="analytics-pie-row"><span className="analytics-dot" style={{ background: '#f59e0b' }} /> Shop Owners <strong>{pcts.shop_owner}%</strong> ({visitStats.totals.shop_owner})</div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })()}
                        </>)}
                    </div>
                </>)}

                {/* ===== SETTINGS TAB ===== */}
                {activeTab === 'settings' && (<>
                    <div className="section-card">
                        <div className="section-header"><h2>⚙️ Site Settings</h2></div>
                        {settingsLoading ? <p style={{ padding: '20px', textAlign: 'center' }}>Loading settings...</p> : (
                            <div className="settings-list">
                                {/* Jobs Feature Toggle */}
                                <div className="setting-item">
                                    <div className="setting-info">
                                        <div className="setting-label">💼 Jobs Section</div>
                                        <div className="setting-desc">Show or hide the Jobs dropdown in the navigation bar for all users.</div>
                                    </div>
                                    <button
                                        className={`setting-toggle ${siteSettings.feature_jobs?.enabled ? 'toggle-on' : 'toggle-off'}`}
                                        onClick={() => toggleFeatureFlag('feature_jobs')}
                                    >
                                        <span className="toggle-knob" />
                                        <span className="toggle-label">{siteSettings.feature_jobs?.enabled ? 'ON' : 'OFF'}</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </>)}

                {/* ===== AI SEARCH TAB ===== */}
                {activeTab === 'ai-search' && (<>
                    <div className="ai-search-container">
                        {/* Search Panel */}
                        <div className="section-card ai-search-panel">
                            <div className="section-header">
                                <h2>🤖 AI Deep Search Bot</h2>
                                <span className="ai-badge">Powered by Gemini AI</span>
                            </div>
                            <p className="ai-subtitle">Deep dive into Facebook, Google Maps, Tabelog & community forums to find Burmese restaurants in Japan and auto-add them to your shops.</p>

                            <div className="ai-search-form">
                                <div className="ai-form-row">
                                    <div className="ai-form-group ai-form-main">
                                        <label>🔍 Search Query</label>
                                        <input
                                            type="text"
                                            value={aiQuery}
                                            onChange={e => setAiQuery(e.target.value)}
                                            placeholder="e.g. Burmese restaurants in Takadanobaba, Myanmar food near Shin-Okubo..."
                                            onKeyDown={e => e.key === 'Enter' && !aiSearching && runAiSearch()}
                                        />
                                    </div>
                                </div>
                                <div className="ai-form-row">
                                    <div className="ai-form-group">
                                        <label>📍 Location</label>
                                        <input type="text" value={aiLocation} onChange={e => setAiLocation(e.target.value)} placeholder="Tokyo, Japan" />
                                    </div>
                                    <div className="ai-form-group">
                                        <label>🍜 Cuisine Type</label>
                                        <select value={aiCuisine} onChange={e => setAiCuisine(e.target.value)}>
                                            <option value="Burmese">Burmese / Myanmar</option>
                                            <option value="Shan">Shan Cuisine</option>
                                            <option value="Burmese and Southeast Asian">Burmese + SE Asian</option>
                                            <option value="Halal Burmese">Halal Burmese</option>
                                            <option value="Any Asian">Any Asian</option>
                                        </select>
                                    </div>
                                    <div className="ai-form-group">
                                        <label>📊 Max Results</label>
                                        <select value={aiMaxResults} onChange={e => setAiMaxResults(Number(e.target.value))}>
                                            <option value={5}>5</option>
                                            <option value={8}>8</option>
                                            <option value={10}>10</option>
                                            <option value={15}>15</option>
                                            <option value={20}>20</option>
                                        </select>
                                    </div>
                                    <div className="ai-form-group">
                                        <label>📂 Import Category</label>
                                        <select value={aiImportCategoryId} onChange={e => setAiImportCategoryId(e.target.value)}>
                                            <option value="">Auto (Restaurants)</option>
                                            {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name_en}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <button className="ai-search-btn" onClick={runAiSearch} disabled={aiSearching || !aiQuery.trim()}>
                                    {aiSearching ? (
                                        <><span className="ai-spinner" /> Searching deeply...</>
                                    ) : (
                                        <>🚀 Launch Deep Search</>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Live Search Log */}
                        {aiSearchLog.length > 0 && (
                            <div className="section-card ai-log-panel">
                                <div className="section-header"><h2>📡 Search Log</h2></div>
                                <div className="ai-log-scroll">
                                    {aiSearchLog.map((log, i) => (
                                        <div key={i} className={`ai-log-line ai-log-${log.type}`}>
                                            <span className="ai-log-time">{log.time}</span>
                                            <span className="ai-log-msg">{log.msg}</span>
                                        </div>
                                    ))}
                                    {aiSearching && <div className="ai-log-line ai-log-search"><span className="ai-log-time">{new Date().toLocaleTimeString()}</span><span className="ai-log-msg ai-typing">⏳ AI is analyzing data<span className="dots">...</span></span></div>}
                                </div>
                            </div>
                        )}

                        {/* Error */}
                        {aiError && <div className="ai-error-box">❌ {aiError}</div>}

                        {/* Results */}
                        {aiResults.length > 0 && (
                            <div className="section-card ai-results-panel">
                                <div className="section-header">
                                    <h2>📋 Found {aiResults.length} Restaurants</h2>
                                    <div className="ai-results-actions">
                                        <button className="ai-select-all-btn" onClick={selectAllAi}>
                                            {aiSelected.size === aiResults.length ? '☐ Deselect All' : '☑ Select All'}
                                        </button>
                                        <button
                                            className="ai-import-btn"
                                            onClick={importSelectedAi}
                                            disabled={aiSelected.size === 0 || aiImporting}
                                        >
                                            {aiImporting ? (
                                                <><span className="ai-spinner" /> Importing...</>
                                            ) : (
                                                <>📥 Import Selected ({aiSelected.size})</>
                                            )}
                                        </button>
                                    </div>
                                </div>
                                <div className="ai-results-grid">
                                    {aiResults.map((r, i) => (
                                        <div
                                            key={i}
                                            className={`ai-result-card ${aiSelected.has(i) ? 'ai-card-selected' : ''}`}
                                            onClick={() => toggleAiSelect(i)}
                                        >
                                            <div className="ai-card-select">
                                                <span className={`ai-checkbox ${aiSelected.has(i) ? 'checked' : ''}`}>
                                                    {aiSelected.has(i) ? '✓' : ''}
                                                </span>
                                            </div>
                                            <div className="ai-card-body">
                                                <div className="ai-card-header">
                                                    <h3 className="ai-card-name">{r.name}</h3>
                                                    <span className={`ai-confidence ai-conf-${r.confidence}`}>{r.confidence}</span>
                                                </div>
                                                <p className="ai-card-desc">{r.description_en}</p>
                                                {r.description_my && <p className="ai-card-desc-my">{r.description_my}</p>}
                                                <div className="ai-card-meta">
                                                    <span>📍 {r.address}</span>
                                                    {r.phone && <span>📞 {r.phone}</span>}
                                                    <span>💰 {r.price_range}</span>
                                                </div>
                                                {r.tags && r.tags.length > 0 && (
                                                    <div className="ai-card-tags">
                                                        {r.tags.map((tag, ti) => <span key={ti} className="ai-tag">{tag}</span>)}
                                                    </div>
                                                )}
                                                <div className="ai-card-source">Source: {r.source_hint}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </>)}

            </div></div>

            {/* Reject Request Modal */}
            {rejectModal.show && <div className="modal-overlay" onClick={() => setRejectModal({ show: false, request: null })}><div className="modal" onClick={e => e.stopPropagation()}>
                <h3>❌ Reject Request</h3>
                <p>Reject shop owner request from <strong>{rejectModal.request?.user?.name || rejectModal.request?.user?.email}</strong> for <strong>{rejectModal.request?.shop_name}</strong>?</p>
                <div className="form-group" style={{ margin: '16px 0' }}><label>Reason (optional)</label><textarea value={rejectNote} onChange={e => setRejectNote(e.target.value)} placeholder="Enter reason for rejection..." rows="3" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' }} /></div>
                <div className="modal-actions"><button type="button" onClick={() => setRejectModal({ show: false, request: null })} className="btn-cancel">Cancel</button><button onClick={handleRejectRequest} className="btn-confirm-delete" disabled={requestActionLoading}>{requestActionLoading ? 'Rejecting...' : 'Reject Request'}</button></div>
            </div></div>}

            {/* Delete Modals */}
            {/* Admin Password Confirmation Modal */}
            {adminPwModal.show && (
                <div className="modal-overlay" onClick={() => setAdminPwModal({ show: false, user: null })}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <h3>Confirm Admin Action</h3>
                        <p>{adminPwModal.user?.is_admin ? 'Remove admin from' : 'Grant admin to'} <strong>{adminPwModal.user?.email}</strong></p>
                        <p className="modal-hint">Enter your admin password to confirm.</p>
                        <form onSubmit={toggleAdmin}>
                            <div className="form-group modal-field">
                                <input type="password" value={adminPassword} onChange={e => setAdminPassword(e.target.value)} placeholder="Your password" required autoFocus className="modal-input" />
                            </div>
                            <div className="modal-actions">
                                <button type="button" onClick={() => setAdminPwModal({ show: false, user: null })} className="btn-cancel">Cancel</button>
                                <button type="submit" className="btn-save" disabled={adminToggleSaving}>{adminToggleSaving ? 'Confirming...' : 'Confirm'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Reset Password Modal */}
            {resetPwModal.show && (
                <div className="modal-overlay" onClick={() => setResetPwModal({ show: false, user: null })}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <h3>Reset Password</h3>
                        <p>Set a new password for <strong>{resetPwModal.user?.email}</strong></p>
                        <form onSubmit={resetUserPassword}>
                            <div className="form-group modal-field">
                                <label>New Password</label>
                                <input type="text" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Min 6 characters" minLength="6" required autoFocus className="modal-input" />
                            </div>
                            <div className="modal-actions">
                                <button type="button" onClick={() => setResetPwModal({ show: false, user: null })} className="btn-cancel">Cancel</button>
                                <button type="submit" className="btn-save" disabled={resetSaving}>{resetSaving ? 'Resetting...' : 'Reset Password'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {deleteModal.show && <div className="modal-overlay" onClick={() => setDeleteModal({ show: false, user: null })}><div className="modal" onClick={e => e.stopPropagation()}><h3>Confirm Delete</h3><p>Are you sure you want to delete user <strong>{deleteModal.user?.email}</strong>?</p><p className="warning">This action cannot be undone.</p><div className="modal-actions"><button onClick={() => setDeleteModal({ show: false, user: null })} className="btn-cancel">Cancel</button><button onClick={deleteUser} className="btn-confirm-delete">Delete User</button></div></div></div>}
            {deleteBlogModal.show && <div className="modal-overlay" onClick={() => setDeleteBlogModal({ show: false, blog: null })}><div className="modal" onClick={e => e.stopPropagation()}><h3>Confirm Delete</h3><p>Are you sure you want to delete blog <strong>{deleteBlogModal.blog?.title}</strong>?</p><p className="warning">This action cannot be undone.</p><div className="modal-actions"><button onClick={() => setDeleteBlogModal({ show: false, blog: null })} className="btn-cancel">Cancel</button><button onClick={deleteBlog} className="btn-confirm-delete">Delete Blog</button></div></div></div>}
            {deleteCategoryModal.show && <div className="modal-overlay" onClick={() => setDeleteCategoryModal({ show: false, category: null })}><div className="modal" onClick={e => e.stopPropagation()}><h3>Confirm Delete</h3><p>Are you sure you want to delete category <strong>{deleteCategoryModal.category?.name_en}</strong>?</p><p className="warning">This will fail if the category has shops assigned.</p><div className="modal-actions"><button onClick={() => setDeleteCategoryModal({ show: false, category: null })} className="btn-cancel">Cancel</button><button onClick={deleteCategory} className="btn-confirm-delete">Delete Category</button></div></div></div>}
            {deleteShopModal.show && <div className="modal-overlay" onClick={() => setDeleteShopModal({ show: false, shop: null })}><div className="modal" onClick={e => e.stopPropagation()}><h3>Confirm Delete</h3><p>Are you sure you want to delete shop <strong>{deleteShopModal.shop?.name}</strong>?</p><p className="warning">This action cannot be undone.</p><div className="modal-actions"><button onClick={() => setDeleteShopModal({ show: false, shop: null })} className="btn-cancel">Cancel</button><button onClick={deleteShop} className="btn-confirm-delete">Delete Shop</button></div></div></div>}

            {/* Category Form Modal */}
            {categoryFormModal.show && <div className="modal-overlay" onClick={() => setCategoryFormModal({ show: false, category: null })}><div className="blog-form-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header"><h3>{categoryFormModal.category ? 'Edit Category' : 'Create New Category'}</h3><button onClick={() => setCategoryFormModal({ show: false, category: null })} className="btn-close">✕</button></div>
                <form onSubmit={saveCategory} className="blog-form">
                    <div className="form-row"><div className="form-group flex-1"><label>English Name *</label><input value={categoryForm.name_en} onChange={cf('name_en')} type="text" required placeholder="e.g. Ramen Restaurants" /></div><div className="form-group" style={{ width: 120 }}><label>Icon *</label><input value={categoryForm.icon} onChange={cf('icon')} type="text" required maxLength="10" placeholder="🍜" /></div></div>
                    <div className="form-row"><div className="form-group"><label>Burmese Name *</label><input value={categoryForm.name_my} onChange={cf('name_my')} type="text" required /></div></div>
                    <div className="form-row"><div className="form-group"><label>Slug *</label><input value={categoryForm.slug} onChange={cf('slug')} type="text" required pattern="[a-z0-9\-]+" /></div><div className="form-group" style={{ width: 150 }}><label>Display Order</label><input value={categoryForm.display_order} onChange={cf('display_order')} type="number" min="0" /></div></div>
                    <div className="form-actions"><button type="button" onClick={() => setCategoryFormModal({ show: false, category: null })} className="btn-cancel">Cancel</button><button type="submit" className="btn-save" disabled={categorySaving}>{categorySaving ? 'Saving...' : 'Save Category'}</button></div>
                </form>
            </div></div>}

            {/* Shop Form Modal */}
            {shopFormModal.show && <div className="modal-overlay" onClick={() => setShopFormModal({ show: false, shop: null })}><div className="blog-form-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header"><h3>{shopFormModal.shop ? 'Edit Shop' : 'Create New Shop'}</h3><button onClick={() => setShopFormModal({ show: false, shop: null })} className="btn-close">✕</button></div>
                <form onSubmit={saveShop} className="blog-form">
                    <div className="form-row"><div className="form-group flex-1"><label>Shop Name *</label><input value={shopForm.name} onChange={sf('name')} type="text" required /></div><div className="form-group"><label>Category *</label><select value={shopForm.category_id} onChange={sf('category_id')} required><option value="">Select</option>{shopCategoryOptions.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}</select></div></div>
                    <div className="form-group"><label>Description (EN)</label><textarea value={shopForm.description_en} onChange={sf('description_en')} rows="3" /></div>
                    <div className="form-group"><label>Description (MY)</label><textarea value={shopForm.description_my} onChange={sf('description_my')} rows="3" /></div>
                    <div className="form-row"><div className="form-group flex-1"><label>Address</label><input value={shopForm.address} onChange={sf('address')} type="text" /></div><div className="form-group" style={{ width: 150 }}><label>Price</label><select value={shopForm.price_range} onChange={sf('price_range')}><option value="">None</option><option value="¥">¥</option><option value="¥¥">¥¥</option><option value="¥¥¥">¥¥¥</option><option value="¥¥¥¥">¥¥¥¥</option></select></div></div>
                    <div className="form-row"><div className="form-group"><label>Phone</label><input value={shopForm.phone} onChange={sf('phone')} type="text" /></div><div className="form-group"><label>Website</label><input value={shopForm.website} onChange={sf('website')} type="text" /></div></div>
                    <div className="form-row"><div className="form-group"><label>Latitude</label><input value={shopForm.latitude} onChange={sf('latitude')} type="text" /></div><div className="form-group"><label>Longitude</label><input value={shopForm.longitude} onChange={sf('longitude')} type="text" /></div></div>
                    <div className="form-group">
                        <label>Upload Photos</label>
                        <input type="file" accept="image/*" multiple onChange={handleShopPhotoUpload} />
                        {shopPhotos.length > 0 && (
                            <div className="photo-preview" style={{ marginTop: 10 }}>
                                {shopPhotos.map((photo, index) => (
                                    <div key={`${photo.slice(0, 24)}-${index}`} style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', marginRight: 10, marginBottom: 10 }}>
                                        <img src={photo} alt={`Shop photo ${index + 1}`} style={{ width: 96, height: 72, objectFit: 'cover', borderRadius: 8 }} />
                                        <button type="button" className="btn-delete" style={{ marginTop: 6, padding: '4px 8px' }} onClick={() => removeShopPhoto(index)}>Remove</button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="form-group"><label>Tags (comma-separated)</label><input value={shopTagsText} onChange={e => setShopTagsText(e.target.value)} type="text" /></div>
                    <div className="form-group"><label>Languages (comma-separated)</label><input value={shopLangsText} onChange={e => setShopLangsText(e.target.value)} type="text" /></div>
                    <div className="form-group checkbox-group"><label><input type="checkbox" checked={shopForm.is_active} onChange={sf('is_active')} /> Active</label></div>
                    <div className="form-actions"><button type="button" onClick={() => setShopFormModal({ show: false, shop: null })} className="btn-cancel">Cancel</button><button type="submit" className="btn-save" disabled={shopSaving}>{shopSaving ? 'Saving...' : 'Save Shop'}</button></div>
                </form>
            </div></div>}

            {/* Blog Form Modal */}
            {blogFormModal.show && <div className="modal-overlay" onClick={() => setBlogFormModal({ show: false, blog: null })}><div className="blog-form-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header"><h3>{blogFormModal.blog ? 'Edit Blog' : 'Create New Blog'}</h3><button onClick={() => setBlogFormModal({ show: false, blog: null })} className="btn-close">✕</button></div>
                <form onSubmit={saveBlog} className="blog-form">
                    <div className="form-row"><div className="form-group flex-1"><label>Title (EN) *</label><input value={blogForm.title} onChange={bf('title')} type="text" required /></div><div className="form-group" style={{ width: 120 }}><label>Emoji *</label><input value={blogForm.emoji} onChange={bf('emoji')} type="text" required maxLength="10" /></div></div>
                    <div className="form-group"><label>Title (MY)</label><input value={blogForm.title_my} onChange={bf('title_my')} type="text" /></div>
                    <div className="form-group"><label>Photo URL</label><input value={blogForm.photo} onChange={bf('photo')} type="text" />{blogForm.photo && <div className="photo-preview"><img src={blogForm.photo} alt="Preview" onError={e => e.target.style.display = 'none'} /></div>}</div>
                    <div className="form-row">
                        <div className="form-group"><label>Category *</label><select value={blogForm.category} onChange={bf('category')} required><option value="">Select</option>{['Culture', 'Travel Tips', 'Food & Drink', 'Etiquette', 'Seasons', 'Practical'].map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                        <div className="form-group"><label>Tag *</label><select value={blogForm.tag} onChange={bf('tag')} required><option value="">Select</option>{['culture', 'travel', 'food', 'etiquette', 'seasons', 'practical'].map(t => <option key={t} value={t}>{t}</option>)}</select></div>
                        <div className="form-group"><label>Read Time</label><input value={blogForm.read_time} onChange={bf('read_time')} type="text" /></div>
                    </div>
                    <div className="form-group"><label>Excerpt (EN) *</label><textarea value={blogForm.excerpt} onChange={bf('excerpt')} required rows="3" maxLength="500" /><small>{blogForm.excerpt?.length || 0} / 500</small></div>
                    <div className="form-group"><label>Excerpt (MY)</label><textarea value={blogForm.excerpt_my} onChange={bf('excerpt_my')} rows="3" maxLength="500" /><small>{blogForm.excerpt_my?.length || 0} / 500</small></div>
                    <div className="form-group"><label>Content (EN) * (HTML)</label><textarea value={blogForm.content} onChange={bf('content')} required rows="12" /></div>
                    <div className="form-group"><label>Content (MY) (HTML)</label><textarea value={blogForm.content_my} onChange={bf('content_my')} rows="12" /></div>
                    <div className="form-group checkbox-group"><label><input type="checkbox" checked={blogForm.published} onChange={bf('published')} /> Publish immediately</label></div>
                    <div className="form-actions"><button type="button" onClick={() => setBlogFormModal({ show: false, blog: null })} className="btn-cancel">Cancel</button><button type="submit" className="btn-save" disabled={blogSaving}>{blogSaving ? 'Saving...' : 'Save Blog'}</button></div>
                </form>
            </div></div>}

            {/* Reply to Contact Modal */}
            {replyModal.show && (
                <div className="modal-overlay" onClick={() => setReplyModal({ show: false, message: null })}>
                    <div className="modal contact-reply-modal" onClick={e => e.stopPropagation()}>
                        <h3>Reply to Message</h3>
                        <p className="reply-modal-to">To: <strong>{replyModal.message?.sender?.name || replyModal.message?.sender?.email}</strong></p>
                        <div className="reply-modal-original">
                            <div className="reply-modal-subject">{replyModal.message?.subject}</div>
                            <div className="reply-modal-body">{replyModal.message?.message}</div>
                        </div>
                        <div className="form-group reply-modal-input">
                            <label>Your Reply</label>
                            <textarea value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="Type your reply..." rows="4" required />
                        </div>
                        <div className="modal-actions">
                            <button type="button" onClick={() => setReplyModal({ show: false, message: null })} className="btn-cancel">Cancel</button>
                            <button onClick={handleReply} className="btn-save" disabled={replySaving || !replyText.trim()}>{replySaving ? 'Sending...' : 'Send Reply'}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Contact Message Modal */}
            {deleteContactModal.show && (
                <div className="modal-overlay" onClick={() => setDeleteContactModal({ show: false, message: null })}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <h3>Delete Message</h3>
                        <p>Delete message from <strong>{deleteContactModal.message?.sender?.name || deleteContactModal.message?.sender?.email}</strong>?</p>
                        <p className="warning">This action cannot be undone.</p>
                        <div className="modal-actions">
                            <button onClick={() => setDeleteContactModal({ show: false, message: null })} className="btn-cancel">Cancel</button>
                            <button onClick={handleDeleteContact} className="btn-confirm-delete">Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
