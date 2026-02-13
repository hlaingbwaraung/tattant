/**
 * AdminDashboard – Central admin panel: Users, Blogs, Categories, Shops management.
 */
import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import axios from 'axios'
import AppHeader from '../components/layout/AppHeader'
import useAuthStore from '../store/useAuthStore'
import './AdminDashboard.css'

const API = '/api'
const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` })

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
    const [shopPhotosText, setShopPhotosText] = useState('')
    const [shopTagsText, setShopTagsText] = useState('')
    const [shopLangsText, setShopLangsText] = useState('')

    const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })

    // ========== USER MANAGEMENT ==========
    const loadData = useCallback(async () => {
        try {
            setLoading(true); setError('')
            const headers = authHeaders()
            const [usersRes, statsRes] = await Promise.all([
                axios.get(`${API}/admin/users`, { headers }),
                axios.get(`${API}/admin/stats`, { headers })
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
            await axios.patch(`${API}/admin/users/${u.id}/admin`, { is_admin: !u.is_admin, admin_password: adminPassword }, { headers: authHeaders() })
            setAdminPwModal({ show: false, user: null }); setAdminPassword(''); await loadData()
        } catch (err) { alert(err.response?.data?.message || 'Failed to update admin status') }
        finally { setAdminToggleSaving(false) }
    }
    const togglePremium = async (u) => {
        try { await axios.patch(`${API}/admin/users/${u.id}/premium`, { is_premium: !u.is_premium, premium_type: u.is_premium ? null : 'lifetime' }, { headers: authHeaders() }); await loadData() }
        catch { alert('Failed to update premium status') }
    }
    const deleteUser = async () => {
        try { await axios.delete(`${API}/admin/users/${deleteModal.user.id}`, { headers: authHeaders() }); setDeleteModal({ show: false, user: null }); await loadData() }
        catch { alert('Failed to delete user') }
    }
    const resetUserPassword = async (e) => {
        e.preventDefault(); setResetSaving(true)
        try {
            await axios.patch(`${API}/admin/users/${resetPwModal.user.id}/password`, { new_password: newPassword }, { headers: authHeaders() })
            alert(`Password reset successfully for ${resetPwModal.user.email}`)
            setResetPwModal({ show: false, user: null }); setNewPassword('')
        } catch (err) { alert(err.response?.data?.message || 'Failed to reset password') }
        finally { setResetSaving(false) }
    }

    // ========== BLOG MANAGEMENT ==========
    const loadBlogs = useCallback(async () => {
        try {
            setBlogLoading(true); setBlogError('')
            const headers = authHeaders()
            const [blogsRes, statsRes] = await Promise.all([
                axios.get(`${API}/blogs`, { headers }),
                axios.get(`${API}/blogs/admin/stats`, { headers })
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
            const headers = authHeaders()
            if (blogFormModal.blog) await axios.put(`${API}/blogs/${blogFormModal.blog.id}`, blogForm, { headers })
            else await axios.post(`${API}/blogs`, blogForm, { headers })
            setBlogFormModal({ show: false, blog: null }); await loadBlogs()
        } catch (err) { alert(err.response?.data?.error || 'Failed to save blog') }
        finally { setBlogSaving(false) }
    }
    const deleteBlog = async () => {
        try { await axios.delete(`${API}/blogs/${deleteBlogModal.blog.id}`, { headers: authHeaders() }); setDeleteBlogModal({ show: false, blog: null }); await loadBlogs() }
        catch { alert('Failed to delete blog') }
    }

    // ========== CATEGORY MANAGEMENT ==========
    const loadCategories = useCallback(async () => {
        try {
            setCategoryLoading(true); setCategoryError('')
            const headers = authHeaders()
            const [catsRes, statsRes] = await Promise.all([
                axios.get(`${API}/categories`, { headers }),
                axios.get(`${API}/categories/admin/stats`, { headers })
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
            const headers = authHeaders()
            if (categoryFormModal.category) await axios.put(`${API}/categories/${categoryFormModal.category.id}`, categoryForm, { headers })
            else await axios.post(`${API}/categories`, categoryForm, { headers })
            setCategoryFormModal({ show: false, category: null }); await loadCategories()
        } catch (err) { alert(err.response?.data?.error || 'Failed to save category') }
        finally { setCategorySaving(false) }
    }
    const deleteCategory = async () => {
        try { await axios.delete(`${API}/categories/${deleteCategoryModal.category.id}`, { headers: authHeaders() }); setDeleteCategoryModal({ show: false, category: null }); await loadCategories() }
        catch { alert('Failed to delete category') }
    }

    // ========== SHOP MANAGEMENT ==========
    const loadShops = useCallback(async () => {
        try {
            setShopLoading(true); setShopError('')
            const headers = authHeaders()
            const [shopsRes, statsRes] = await Promise.all([
                axios.get(`${API}/businesses`, { headers }),
                axios.get(`${API}/businesses/admin/stats`, { headers })
            ])
            setShops(shopsRes.data.businesses || shopsRes.data.data || []); setShopStats(statsRes.data.data)
        } catch { setShopError('Failed to load shops') }
        finally { setShopLoading(false) }
    }, [])

    const openShopForm = (shop) => {
        if (shop) {
            setShopForm({ name: shop.name, category_id: shop.category_id || '', description_en: shop.description_en || '', description_my: shop.description_my || '', address: shop.address || '', latitude: shop.latitude || '', longitude: shop.longitude || '', phone: shop.phone || '', website: shop.website || '', price_range: shop.price_range || '', is_active: shop.is_active !== false })
            setShopPhotosText((shop.photos || []).join('\n'))
            setShopTagsText((shop.tags || []).join(', '))
            setShopLangsText((shop.languages_supported || []).join(', '))
        } else {
            setShopForm({ ...emptyShopForm }); setShopPhotosText(''); setShopTagsText(''); setShopLangsText('')
        }
        setShopFormModal({ show: true, shop })
    }
    const saveShop = async (e) => {
        e.preventDefault(); setShopSaving(true)
        try {
            const headers = authHeaders()
            let categoryId = shopForm.category_id

            if (typeof categoryId === 'string' && categoryId.startsWith('new:')) {
                const slug = categoryId.replace('new:', '')
                const preset = shopCategoryPresets.find(c => c.slug === slug)
                const existingCategory = categories.find(c => c.slug === slug)

                if (existingCategory) {
                    categoryId = existingCategory.id
                } else if (preset) {
                    const createRes = await axios.post(`${API}/categories`, {
                        name_en: preset.name_en,
                        name_my: preset.name_my,
                        icon: preset.icon,
                        slug: preset.slug,
                        display_order: categories.length + 1
                    }, { headers })
                    categoryId = createRes.data?.data?.id
                    await loadCategories()
                }
            }

            const data = {
                ...shopForm,
                category_id: categoryId,
                photos: shopPhotosText.split('\n').map(s => s.trim()).filter(Boolean),
                tags: shopTagsText.split(',').map(s => s.trim()).filter(Boolean),
                languages_supported: shopLangsText.split(',').map(s => s.trim()).filter(Boolean)
            }
            if (shopFormModal.shop) await axios.put(`${API}/businesses/${shopFormModal.shop.id}`, data, { headers })
            else await axios.post(`${API}/businesses`, data, { headers })
            setShopFormModal({ show: false, shop: null }); await loadShops()
        } catch (err) { alert(err.response?.data?.error || 'Failed to save shop') }
        finally { setShopSaving(false) }
    }
    const toggleShopActive = async (shop) => {
        try { await axios.patch(`${API}/businesses/${shop.id}`, { is_active: !shop.is_active }, { headers: authHeaders() }); await loadShops() }
        catch { alert('Failed to toggle shop status') }
    }
    const deleteShop = async () => {
        try { await axios.delete(`${API}/businesses/${deleteShopModal.shop.id}`, { headers: authHeaders() }); setDeleteShopModal({ show: false, shop: null }); await loadShops() }
        catch { alert('Failed to delete shop') }
    }

    useEffect(() => { loadData() }, [loadData])
    useEffect(() => { if (activeTab === 'blogs') loadBlogs() }, [activeTab, loadBlogs])
    useEffect(() => { if (activeTab === 'categories') loadCategories() }, [activeTab, loadCategories])
    useEffect(() => { if (activeTab === 'shops') loadShops() }, [activeTab, loadShops])

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
                    {['users', 'blogs', 'categories', 'shops'].map(tab => (
                        <button key={tab} className={`tab-btn ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
                            {tab === 'users' ? '👥' : tab === 'blogs' ? '📝' : tab === 'categories' ? '📂' : '🏪'} {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>

                {/* ===== USERS TAB ===== */}
                {activeTab === 'users' && (<>
                    {stats && <div className="stats-grid">
                        {[{ icon: '👥', val: stats.totalUsers, lbl: 'Total Users' }, { icon: '✅', val: stats.verifiedUsers, lbl: 'Verified' }, { icon: '🆕', val: stats.newUsersLast7Days, lbl: 'New (7d)' }, { icon: '👨‍💼', val: stats.adminUsers, lbl: 'Admins' }, { icon: '⭐', val: stats.premiumUsers || 0, lbl: 'Premium' }].map((s, i) => (
                            <div key={i} className="stat-card"><div className="stat-icon">{s.icon}</div><div className="stat-info"><div className="stat-number">{s.val}</div><div className="stat-label">{s.lbl}</div></div></div>
                        ))}
                    </div>}
                    <div className="users-section"><h2>All Users</h2>
                        {loading ? <div className="loading">Loading users...</div> : error ? <div className="error">{error}</div> : (
                            <div className="table-container"><table className="users-table"><thead><tr><th>Name</th><th>Email</th><th>Status</th><th>Role</th><th>Premium</th><th>Joined</th><th>Actions</th></tr></thead><tbody>
                                {users.map(u => (
                                    <tr key={u.id}>
                                        <td><div className="user-name">{u.name || 'N/A'}{u.google_id && <span className="badge google">Google</span>}</div></td>
                                        <td>{u.email}</td>
                                        <td><span className={`badge ${u.email_verified ? 'verified' : 'unverified'}`}>{u.email_verified ? '✓ Verified' : '✗ Unverified'}</span></td>
                                        <td><span className={`badge ${u.is_admin ? 'admin' : 'user'}`}>{u.is_admin ? '👨‍💼 Admin' : '👤 User'}</span></td>
                                        <td><span className={`badge ${u.is_premium ? 'premium' : 'free'}`}>{u.is_premium ? '⭐ ' + (u.premium_type || 'Premium') : '🆓 Free'}</span></td>
                                        <td>{formatDate(u.created_at)}</td>
                                        <td>{u.id !== currentUserId ? (
                                            <div className="actions">
                                                <button onClick={() => openAdminToggle(u)} className={`btn-action ${u.is_admin ? 'demote' : 'promote'}`}>{u.is_admin ? '↓ Remove Admin' : '↑ Make Admin'}</button>
                                                <button onClick={() => togglePremium(u)} className={`btn-action ${u.is_premium ? 'demote' : 'promote'}`}>{u.is_premium ? '⭐ Remove Premium' : '⭐ Give Premium'}</button>
                                                <button onClick={() => { setResetPwModal({ show: true, user: u }); setNewPassword('') }} className="btn-action promote">🔑 Reset Password</button>
                                                <button onClick={() => setDeleteModal({ show: true, user: u })} className="btn-action delete">🗑️ Delete</button>
                                            </div>
                                        ) : <span className="current-user-badge">You</span>}</td>
                                    </tr>
                                ))}
                            </tbody></table></div>
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
            </div></div>

            {/* Delete Modals */}
            {/* Admin Password Confirmation Modal */}
            {adminPwModal.show && <div className="modal-overlay" onClick={() => setAdminPwModal({ show: false, user: null })}><div className="modal" onClick={e => e.stopPropagation()}>
                <h3>🔒 Confirm Admin Password</h3>
                <p>{adminPwModal.user?.is_admin ? 'Remove admin from' : 'Grant admin to'} <strong>{adminPwModal.user?.email}</strong></p>
                <p style={{ color: '#888', fontSize: '13px' }}>Enter your admin password to confirm this action.</p>
                <form onSubmit={toggleAdmin}>
                    <div className="form-group" style={{ margin: '16px 0' }}><input type="password" value={adminPassword} onChange={e => setAdminPassword(e.target.value)} placeholder="Enter your password" required autoFocus style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' }} /></div>
                    <div className="modal-actions"><button type="button" onClick={() => setAdminPwModal({ show: false, user: null })} className="btn-cancel">Cancel</button><button type="submit" className="btn-save" disabled={adminToggleSaving}>{adminToggleSaving ? 'Confirming...' : 'Confirm'}</button></div>
                </form>
            </div></div>}

            {/* Reset Password Modal */}
            {resetPwModal.show && <div className="modal-overlay" onClick={() => setResetPwModal({ show: false, user: null })}><div className="modal" onClick={e => e.stopPropagation()}>
                <h3>🔑 Reset Password</h3>
                <p>Set a new password for <strong>{resetPwModal.user?.email}</strong></p>
                <form onSubmit={resetUserPassword}>
                    <div className="form-group" style={{ margin: '16px 0' }}><label>New Password</label><input type="text" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Enter new password (min 6 chars)" minLength="6" required autoFocus style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' }} /></div>
                    <div className="modal-actions"><button type="button" onClick={() => setResetPwModal({ show: false, user: null })} className="btn-cancel">Cancel</button><button type="submit" className="btn-save" disabled={resetSaving}>{resetSaving ? 'Resetting...' : 'Reset Password'}</button></div>
                </form>
            </div></div>}

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
                    <div className="form-group"><label>Photo URLs (one per line)</label><textarea value={shopPhotosText} onChange={e => setShopPhotosText(e.target.value)} rows="3" /></div>
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
        </div>
    )
}
