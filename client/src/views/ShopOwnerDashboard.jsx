/**
 * ShopOwnerDashboard – Dashboard for shop owners to manage businesses and coupons.
 */
import React, { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AppHeader from '../components/layout/AppHeader'
import useAuthStore from '../store/useAuthStore'
import { getOwnerStats, getMyBusinesses, updateMyBusiness } from '../services/shopOwnerService'
import { getMyCoupons, createCoupon, updateCoupon, deleteCoupon as deleteCouponApi } from '../services/couponService'
import { getMenuItems, createMenuItem, updateMenuItem, deleteMenuItem } from '../services/menuItemService'
import { getBookings, updateBooking, deleteBooking as deleteBookingApi } from '../services/bookingService'
import { submitContactMessage, getMyContactMessages } from '../services/contactService'
import './ShopOwnerDashboard.css'

const emptyCoupon = {
    business_id: '', code: '', title: '', description: '',
    discount_type: 'percentage', discount_value: 0,
    min_purchase: null, max_uses: null,
    start_date: '', end_date: '', is_active: true
}

const emptyMenuItem = {
    name: '', name_my: '', description: '', price: '',
    category: '', photo: '', is_available: true, display_order: 0
}

const menuCategories = ['Appetizer', 'Main Course', 'Noodles', 'Rice', 'Soup', 'Salad', 'Dessert', 'Drinks', 'Side Dish', 'Special']

export default function ShopOwnerDashboard() {
    const navigate = useNavigate()
    const { user } = useAuthStore()

    // Premier check
    const isPremier = user?.is_shop_owner && user?.premium_type === 'premier'

    const [activeTab, setActiveTab] = useState('businesses')
    const [stats, setStats] = useState(null)
    const [businesses, setBusinesses] = useState([])
    const [coupons, setCoupons] = useState([])
    const [loadingBusinesses, setLoadingBusinesses] = useState(true)
    const [loadingCoupons, setLoadingCoupons] = useState(true)

    const [showBusinessModal, setShowBusinessModal] = useState(false)
    const [savingBusiness, setSavingBusiness] = useState(false)
    const [editingBusiness, setEditingBusiness] = useState({})

    const [showCouponModal, setShowCouponModal] = useState(false)
    const [savingCoupon, setSavingCoupon] = useState(false)
    const [editingCoupon, setEditingCoupon] = useState({ ...emptyCoupon })

    // Menu Items
    const [menuItems, setMenuItems] = useState([])
    const [loadingMenu, setLoadingMenu] = useState(false)
    const [selectedMenuBiz, setSelectedMenuBiz] = useState('')
    const [showMenuModal, setShowMenuModal] = useState(false)
    const [savingMenu, setSavingMenu] = useState(false)
    const [editingMenuItem, setEditingMenuItem] = useState({ ...emptyMenuItem })

    // Bookings
    const [bookings, setBookings] = useState([])
    const [loadingBookings, setLoadingBookings] = useState(false)
    const [bookingFilter, setBookingFilter] = useState('all')
    const [selectedBookingBiz, setSelectedBookingBiz] = useState('')

    // Contact Form
    const [contactForm, setContactForm] = useState({ subject: '', message: '', category: 'general' })
    const [contactSending, setContactSending] = useState(false)
    const [contactSuccess, setContactSuccess] = useState('')
    const [contactError, setContactError] = useState('')
    const [myMessages, setMyMessages] = useState([])
    const [loadingMessages, setLoadingMessages] = useState(false)
    const [contactPhotos, setContactPhotos] = useState([])

    const loadStats = useCallback(async () => {
        try { const res = await getOwnerStats(); setStats(res.data.data || res.data) }
        catch (err) { console.error('Error loading stats:', err) }
    }, [])

    const loadBusinessesFn = useCallback(async () => {
        setLoadingBusinesses(true)
        try { const res = await getMyBusinesses(); setBusinesses(res.data.data || res.data.businesses || []) }
        catch (err) { console.error('Error loading businesses:', err) }
        finally { setLoadingBusinesses(false) }
    }, [])

    const loadCouponsFn = useCallback(async () => {
        setLoadingCoupons(true)
        try { const res = await getMyCoupons(); setCoupons(res.data.data || res.data.coupons || []) }
        catch (err) { console.error('Error loading coupons:', err) }
        finally { setLoadingCoupons(false) }
    }, [])

    useEffect(() => {
        Promise.all([loadStats(), loadBusinessesFn(), loadCouponsFn()])
    }, [loadStats, loadBusinessesFn, loadCouponsFn])

    // Set default menu business when businesses load
    useEffect(() => {
        if (businesses.length > 0 && !selectedMenuBiz) setSelectedMenuBiz(businesses[0].id)
    }, [businesses, selectedMenuBiz])

    // Load menu items when business changes
    const loadMenuItems = useCallback(async () => {
        if (!selectedMenuBiz) return
        setLoadingMenu(true)
        try { const res = await getMenuItems(selectedMenuBiz); setMenuItems(res.data.items || res.data.menuItems || []) }
        catch (err) { console.error('Error loading menu:', err) }
        finally { setLoadingMenu(false) }
    }, [selectedMenuBiz])

    useEffect(() => {
        if (activeTab === 'menu' && selectedMenuBiz) loadMenuItems()
    }, [activeTab, selectedMenuBiz, loadMenuItems])

    // Load bookings
    const loadBookingsFn = useCallback(async () => {
        if (!selectedBookingBiz) return
        setLoadingBookings(true)
        try {
            const res = await getBookings({ business_id: selectedBookingBiz })
            setBookings(res.data.data || res.data.bookings || [])
        } catch (err) { console.error('Error loading bookings:', err) }
        finally { setLoadingBookings(false) }
    }, [selectedBookingBiz])

    useEffect(() => {
        if (businesses.length > 0 && !selectedBookingBiz) setSelectedBookingBiz(businesses[0].id)
    }, [businesses, selectedBookingBiz])

    useEffect(() => {
        if (activeTab === 'bookings' && selectedBookingBiz) loadBookingsFn()
    }, [activeTab, selectedBookingBiz, loadBookingsFn])

    const handleBookingStatus = async (booking, newStatus) => {
        try { await updateBooking(booking.id, { status: newStatus }); await loadBookingsFn() }
        catch (err) { alert('Failed to update booking: ' + (err.response?.data?.message || err.message)) }
    }

    const handleDeleteBooking = async (booking) => {
        if (!window.confirm(`Delete booking for "${booking.customer_name}"?`)) return
        try { await deleteBookingApi(booking.id); await loadBookingsFn() }
        catch (err) { alert('Failed to delete booking: ' + (err.response?.data?.message || err.message)) }
    }

    const filteredBookings = bookingFilter === 'all' ? bookings : bookings.filter(b => b.status === bookingFilter)

    // Contact form
    const loadMyMessages = useCallback(async () => {
        setLoadingMessages(true)
        try {
            const res = await getMyContactMessages()
            setMyMessages(res.data.messages || [])
        } catch (err) { console.error('Error loading messages:', err) }
        finally { setLoadingMessages(false) }
    }, [])

    useEffect(() => {
        if (activeTab === 'contact') loadMyMessages()
    }, [activeTab, loadMyMessages])

    const handleSendContact = async (e) => {
        e.preventDefault()
        setContactSending(true); setContactError(''); setContactSuccess('')
        try {
            await submitContactMessage({ ...contactForm, photos: contactPhotos })
            setContactSuccess('Message sent successfully! Admin will review it soon.')
            setContactForm({ subject: '', message: '', category: 'general' })
            setContactPhotos([])
            await loadMyMessages()
        } catch (err) {
            setContactError(err.response?.data?.message || 'Failed to send message.')
        } finally { setContactSending(false) }
    }

    const handleContactPhotoUpload = async (e) => {
        const files = Array.from(e.target.files || [])
        if (!files.length) return
        if (contactPhotos.length + files.length > 5) {
            alert('Maximum 5 photos allowed.'); return
        }
        const imageFiles = files.filter(f => f.type.startsWith('image/'))
        const encoded = await Promise.all(imageFiles.map(file => new Promise(resolve => {
            const reader = new FileReader()
            reader.onload = () => resolve(reader.result)
            reader.readAsDataURL(file)
        })))
        setContactPhotos(prev => [...prev, ...encoded].slice(0, 5))
        e.target.value = ''
    }

    const openMenuModal = (item = null) => {
        setEditingMenuItem(item ? { ...item } : { ...emptyMenuItem })
        setShowMenuModal(true)
    }

    const saveMenuItemFn = async (e) => {
        e.preventDefault(); setSavingMenu(true)
        try {
            const data = { ...editingMenuItem, price: Number(editingMenuItem.price), display_order: Number(editingMenuItem.display_order) || 0 }
            if (data.id) { await updateMenuItem(selectedMenuBiz, data.id, data) } else { await createMenuItem(selectedMenuBiz, data) }
            setShowMenuModal(false); await loadMenuItems()
        } catch (err) { alert('Failed to save menu item: ' + (err.response?.data?.message || err.message)) }
        finally { setSavingMenu(false) }
    }

    const toggleMenuAvailable = async (item) => {
        try { await updateMenuItem(selectedMenuBiz, item.id, { is_available: !item.is_available }); await loadMenuItems() }
        catch (err) { alert('Failed to toggle: ' + (err.response?.data?.message || err.message)) }
    }

    const handleDeleteMenuItem = async (item) => {
        if (!window.confirm(`Delete "${item.name}"? This cannot be undone.`)) return
        try { await deleteMenuItem(selectedMenuBiz, item.id); await loadMenuItems() }
        catch (err) { alert('Failed to delete: ' + (err.response?.data?.message || err.message)) }
    }

    /* Business editing */
    const editBusiness = (biz) => { setEditingBusiness({ ...biz }); setShowBusinessModal(true) }

    const saveBusiness = async (e) => {
        e.preventDefault(); setSavingBusiness(true)
        try {
            await updateMyBusiness(editingBusiness.id, {
                name: editingBusiness.name, description_en: editingBusiness.description_en,
                description_my: editingBusiness.description_my, phone: editingBusiness.phone,
                website: editingBusiness.website, address: editingBusiness.address,
                price_range: editingBusiness.price_range, hours: editingBusiness.hours
            })
            setShowBusinessModal(false); await loadBusinessesFn(); await loadStats()
        } catch (err) { alert('Failed to save business: ' + (err.response?.data?.message || err.message)) }
        finally { setSavingBusiness(false) }
    }

    /* Coupon management */
    const openCouponModal = (coupon = null) => {
        if (coupon) {
            setEditingCoupon({ ...coupon, start_date: coupon.start_date ? coupon.start_date.split('T')[0] : '', end_date: coupon.end_date ? coupon.end_date.split('T')[0] : '' })
        } else {
            setEditingCoupon({ ...emptyCoupon, business_id: businesses[0]?.id || '' })
        }
        setShowCouponModal(true)
    }

    const saveCouponFn = async (e) => {
        e.preventDefault(); setSavingCoupon(true)
        try {
            const data = { ...editingCoupon }
            if (!data.start_date) delete data.start_date
            if (!data.end_date) delete data.end_date
            if (!data.min_purchase) delete data.min_purchase
            if (!data.max_uses) delete data.max_uses
            if (data.id) { await updateCoupon(data.id, data) } else { await createCoupon(data) }
            setShowCouponModal(false); await loadCouponsFn(); await loadStats()
        } catch (err) { alert('Failed to save coupon: ' + (err.response?.data?.message || err.message)) }
        finally { setSavingCoupon(false) }
    }

    const toggleCoupon = async (coupon) => {
        try { await updateCoupon(coupon.id, { is_active: !coupon.is_active }); await loadCouponsFn(); await loadStats() }
        catch (err) { alert('Failed to toggle coupon: ' + (err.response?.data?.message || err.message)) }
    }

    const handleDeleteCoupon = async (coupon) => {
        if (!window.confirm(`Delete coupon "${coupon.code}"? This cannot be undone.`)) return
        try { await deleteCouponApi(coupon.id); await loadCouponsFn(); await loadStats() }
        catch (err) { alert('Failed to delete coupon: ' + (err.response?.data?.message || err.message)) }
    }

    const goBack = () => window.history.length > 1 ? navigate(-1) : navigate('/')

    const updateField = (setter) => (field) => (e) => setter(prev => ({ ...prev, [field]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))
    const updateBiz = updateField(setEditingBusiness)
    const updateCpn = updateField(setEditingCoupon)
    const updateMenu = updateField(setEditingMenuItem)

    // Group menu items by category
    const groupedMenu = menuItems.reduce((acc, item) => {
        const cat = item.category || 'Uncategorized'
        if (!acc[cat]) acc[cat] = []
        acc[cat].push(item)
        return acc
    }, {})

    return (
        <div className="shop-owner-dashboard">
            <AppHeader />
            <div className="dashboard-container">
                <div className="container">
                    <div className="page-header">
                        <h1>🏪 Shop Owner Dashboard</h1>
                        <p className="subtitle" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            Manage your businesses and coupons
                            {isPremier && <span style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, letterSpacing: 1 }}>⭐ PREMIER</span>}
                        </p>
                    </div>

                    {stats && (
                        <div className="stats-grid">
                            {[{ icon: '🏢', value: stats.totalBusinesses, label: 'My Businesses' },
                            { icon: '🎟️', value: stats.totalCoupons, label: 'Total Coupons' },
                            { icon: '✅', value: stats.activeCoupons, label: 'Active Coupons' },
                            { icon: '📊', value: stats.totalCouponUses, label: 'Total Coupon Uses' }
                            ].map((s, i) => (
                                <div key={i} className="stat-card">
                                    <div className="stat-icon">{s.icon}</div>
                                    <div className="stat-info"><div className="stat-number">{s.value}</div><div className="stat-label">{s.label}</div></div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="tab-nav">
                        <button className={`tab-btn ${activeTab === 'businesses' ? 'active' : ''}`} onClick={() => setActiveTab('businesses')}>🏢 My Businesses</button>
                        <button className={`tab-btn ${activeTab === 'coupons' ? 'active' : ''}`} onClick={() => setActiveTab('coupons')}>🎟️ Coupons</button>
                        <button className={`tab-btn ${activeTab === 'menu' ? 'active' : ''}`} onClick={() => setActiveTab('menu')}>🍽️ Menu</button>
                        <button className={`tab-btn ${activeTab === 'bookings' ? 'active' : ''}`} onClick={() => setActiveTab('bookings')}>📅 Bookings {isPremier ? <span style={{ fontSize: 10, background: '#f59e0b', color: '#fff', borderRadius: 10, padding: '1px 6px', marginLeft: 4 }}>PREMIER</span> : <span style={{ fontSize: 10, background: '#94a3b8', color: '#fff', borderRadius: 10, padding: '1px 6px', marginLeft: 4 }}>⭐</span>}</button>
                        <button className={`tab-btn ${activeTab === 'contact' ? 'active' : ''}`} onClick={() => setActiveTab('contact')}>📩 Contact Admin</button>
                    </div>

                    {/* BUSINESSES TAB */}
                    {activeTab === 'businesses' && (
                        loadingBusinesses ? (
                            <div className="loading-container"><div className="loading-spinner"></div><p>Loading your businesses...</p></div>
                        ) : businesses.length === 0 ? (
                            <div className="empty-state"><div className="empty-icon">🏢</div><h3>No businesses assigned</h3><p>Contact an administrator to assign businesses to your account.</p></div>
                        ) : (
                            <div className="businesses-list">
                                {businesses.map(biz => (
                                    <div key={biz.id} className="business-row">
                                        <div className="business-row-image"><img src={biz.photos?.[0] || 'https://via.placeholder.com/120x80'} alt={biz.name} /></div>
                                        <div className="business-row-info"><h3>{biz.name}</h3><p className="biz-category">{biz.category?.name_en || 'Uncategorized'}</p><p className="biz-address">📍 {biz.address}</p></div>
                                        <div className="business-row-meta"><span className="coupon-count">{biz.coupons?.length || 0} coupons</span><span className="price-badge">{biz.price_range}</span></div>
                                        <div className="business-row-actions">
                                            <button className="btn-sm btn-outline" onClick={() => editBusiness(biz)}>✏️ Edit</button>
                                            <Link to={`/businesses/${biz.id}`} className="btn-sm btn-primary">👁️ View</Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )
                    )}

                    {/* COUPONS TAB */}
                    {activeTab === 'coupons' && (
                        <>
                            <div className="section-header"><h2>Manage Coupons</h2><button className="btn btn-primary" onClick={() => openCouponModal()}>+ Add Coupon</button></div>
                            {loadingCoupons ? (
                                <div className="loading-container"><div className="loading-spinner"></div><p>Loading coupons...</p></div>
                            ) : coupons.length === 0 ? (
                                <div className="empty-state"><div className="empty-icon">🎟️</div><h3>No coupons yet</h3><p>Create your first coupon to attract more customers.</p><button className="btn btn-primary" onClick={() => openCouponModal()}>+ Create Coupon</button></div>
                            ) : (
                                <div className="coupons-table-wrapper">
                                    <table className="data-table">
                                        <thead><tr><th>Code</th><th>Title</th><th>Business</th><th>Discount</th><th>Uses</th><th>Status</th><th>Expires</th><th>Actions</th></tr></thead>
                                        <tbody>
                                            {coupons.map(coupon => (
                                                <tr key={coupon.id}>
                                                    <td><code className="coupon-code">{coupon.code}</code></td>
                                                    <td>{coupon.title}</td>
                                                    <td>{coupon.business?.name || 'N/A'}</td>
                                                    <td><span className={`discount-badge ${coupon.discount_type}`}>{coupon.discount_type === 'percentage' ? coupon.discount_value + '%' : coupon.discount_type === 'fixed' ? '¥' + coupon.discount_value : '🎁 Freebie'}</span></td>
                                                    <td>{coupon.used_count || 0} / {coupon.max_uses || '∞'}</td>
                                                    <td><span className={`status-badge ${coupon.is_active ? 'active' : 'inactive'}`}>{coupon.is_active ? 'Active' : 'Inactive'}</span></td>
                                                    <td>{coupon.end_date ? new Date(coupon.end_date).toLocaleDateString() : 'No expiry'}</td>
                                                    <td className="actions-cell">
                                                        <button className="btn-icon" title="Edit" onClick={() => openCouponModal(coupon)}>✏️</button>
                                                        <button className="btn-icon" title="Toggle" onClick={() => toggleCoupon(coupon)}>{coupon.is_active ? '⏸️' : '▶️'}</button>
                                                        <button className="btn-icon danger" title="Delete" onClick={() => handleDeleteCoupon(coupon)}>🗑️</button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </>
                    )}

                    {/* MENU TAB */}
                    {activeTab === 'menu' && (
                        <>
                            <div className="section-header">
                                <div className="menu-header-left">
                                    <h2>🍽️ Menu Items</h2>
                                    {businesses.length > 1 && (
                                        <select className="biz-select" value={selectedMenuBiz} onChange={e => setSelectedMenuBiz(e.target.value)}>
                                            {businesses.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                        </select>
                                    )}
                                </div>
                                <button className="btn btn-primary" onClick={() => openMenuModal()}>+ Add Item</button>
                            </div>
                            {loadingMenu ? (
                                <div className="loading-container"><div className="loading-spinner"></div><p>Loading menu...</p></div>
                            ) : businesses.length === 0 ? (
                                <div className="empty-state"><div className="empty-icon">🏢</div><h3>No businesses assigned</h3><p>You need a business to manage menu items.</p></div>
                            ) : menuItems.length === 0 ? (
                                <div className="empty-state"><div className="empty-icon">🍽️</div><h3>No menu items yet</h3><p>Add your first menu item to showcase your offerings.</p><button className="btn btn-primary" onClick={() => openMenuModal()}>+ Add Menu Item</button></div>
                            ) : (
                                <div className="menu-sections">
                                    {Object.entries(groupedMenu).map(([cat, items]) => (
                                        <div key={cat} className="menu-category-section">
                                            <h3 className="menu-category-title">{cat}</h3>
                                            <div className="menu-items-grid">
                                                {items.map(item => (
                                                    <div key={item.id} className={`menu-item-card ${!item.is_available ? 'unavailable' : ''}`}>
                                                        {item.photo && <div className="menu-item-photo"><img src={item.photo} alt={item.name} /></div>}
                                                        <div className="menu-item-info">
                                                            <div className="menu-item-name">{item.name}</div>
                                                            {item.name_my && <div className="menu-item-name-my">{item.name_my}</div>}
                                                            {item.description && <div className="menu-item-desc">{item.description}</div>}
                                                            <div className="menu-item-price">¥{Number(item.price).toLocaleString()}</div>
                                                        </div>
                                                        <div className="menu-item-actions">
                                                            <button className="btn-icon" title="Edit" onClick={() => openMenuModal(item)}>✏️</button>
                                                            <button className="btn-icon" title="Toggle" onClick={() => toggleMenuAvailable(item)}>{item.is_available ? '⏸️' : '▶️'}</button>
                                                            <button className="btn-icon danger" title="Delete" onClick={() => handleDeleteMenuItem(item)}>🗑️</button>
                                                        </div>
                                                        {!item.is_available && <span className="unavailable-badge">Unavailable</span>}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}

                    {/* BOOKINGS TAB */}
                    {activeTab === 'bookings' && !isPremier && (
                        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                            <div style={{ fontSize: 64, marginBottom: 12 }}>⭐</div>
                            <h2 style={{ fontSize: 22, fontWeight: 700, color: '#1e293b', marginBottom: 8 }}>Premier Feature</h2>
                            <p style={{ color: '#64748b', marginBottom: 16, maxWidth: 400, margin: '0 auto 16px' }}>The Booking System is exclusively available to <strong>Premier Shop Owners</strong>. Upgrade to accept customer reservations, manage bookings, and view revenue analytics.</p>
                            <p style={{ color: '#94a3b8', fontSize: 13 }}>Contact an administrator to upgrade your account.</p>
                        </div>
                    )}
                    {activeTab === 'bookings' && isPremier && (
                        <>
                            <div className="section-header">
                                <div className="menu-header-left">
                                    <h2>📅 Bookings <span style={{ fontSize: 12, background: '#f59e0b', color: '#fff', borderRadius: 10, padding: '2px 8px', marginLeft: 6, verticalAlign: 'middle' }}>PREMIER</span></h2>
                                    {businesses.length > 1 && (
                                        <select className="biz-select" value={selectedBookingBiz} onChange={e => setSelectedBookingBiz(e.target.value)}>
                                            {businesses.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                        </select>
                                    )}
                                </div>
                                <div className="booking-filters">
                                    {['all','pending','confirmed','completed','cancelled','no-show'].map(f => (
                                        <button key={f} className={`filter-btn ${bookingFilter === f ? 'active' : ''}`} onClick={() => setBookingFilter(f)}>
                                            {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1).replace('-', ' ')}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            {loadingBookings ? (
                                <div className="loading-container"><div className="loading-spinner"></div><p>Loading bookings...</p></div>
                            ) : businesses.length === 0 ? (
                                <div className="empty-state"><div className="empty-icon">🏢</div><h3>No businesses assigned</h3><p>You need a business to view bookings.</p></div>
                            ) : filteredBookings.length === 0 ? (
                                <div className="empty-state"><div className="empty-icon">📅</div><h3>No {bookingFilter === 'all' ? '' : bookingFilter + ' '}bookings</h3><p>Bookings from customers will appear here.</p></div>
                            ) : (
                                <div className="coupons-table-wrapper">
                                    <table className="data-table">
                                        <thead><tr><th>Customer</th><th>Contact</th><th>Date</th><th>Time</th><th>Party</th><th>Service</th><th>Status</th><th>Actions</th></tr></thead>
                                        <tbody>
                                            {filteredBookings.map(bk => (
                                                <tr key={bk.id}>
                                                    <td><strong>{bk.customer_name}</strong>{bk.notes && <div className="booking-note">📝 {bk.notes}</div>}</td>
                                                    <td>{bk.customer_email && <div>{bk.customer_email}</div>}{bk.customer_phone && <div>{bk.customer_phone}</div>}</td>
                                                    <td>{bk.booking_date ? new Date(bk.booking_date).toLocaleDateString() : '—'}</td>
                                                    <td>{bk.booking_time || '—'}</td>
                                                    <td>{bk.party_size || 1}</td>
                                                    <td>{bk.service || '—'}</td>
                                                    <td><span className={`status-badge status-${bk.status}`}>{bk.status}</span></td>
                                                    <td className="actions-cell">
                                                        {bk.status === 'pending' && <button className="btn-icon" title="Confirm" onClick={() => handleBookingStatus(bk, 'confirmed')}>✅</button>}
                                                        {(bk.status === 'pending' || bk.status === 'confirmed') && <button className="btn-icon" title="Complete" onClick={() => handleBookingStatus(bk, 'completed')}>🏁</button>}
                                                        {bk.status !== 'cancelled' && bk.status !== 'completed' && <button className="btn-icon" title="Cancel" onClick={() => handleBookingStatus(bk, 'cancelled')}>❌</button>}
                                                        {bk.status === 'confirmed' && <button className="btn-icon" title="No-show" onClick={() => handleBookingStatus(bk, 'no-show')}>👻</button>}
                                                        <button className="btn-icon danger" title="Delete" onClick={() => handleDeleteBooking(bk)}>🗑️</button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </>
                    )}

                    {/* CONTACT TAB */}
                    {activeTab === 'contact' && (
                        <div className="contact-tab">
                            <div className="contact-form-section" style={{ maxWidth: 600, margin: '0 auto' }}>
                                <h2 style={{ marginBottom: 16 }}>📩 Send Message to Admin</h2>
                                {contactSuccess && <div className="success-msg" style={{ background: '#dcfce7', color: '#166534', padding: '12px 16px', borderRadius: 10, marginBottom: 16, fontSize: 14 }}>{contactSuccess}</div>}
                                {contactError && <div className="error-msg" style={{ background: '#fef2f2', color: '#dc2626', padding: '12px 16px', borderRadius: 10, marginBottom: 16, fontSize: 14 }}>{contactError}</div>}
                                <form onSubmit={handleSendContact} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                    <div className="form-group">
                                        <label style={{ fontWeight: 600, marginBottom: 4, display: 'block' }}>Category</label>
                                        <select value={contactForm.category} onChange={e => setContactForm(p => ({ ...p, category: e.target.value }))} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14 }}>
                                            <option value="general">General Inquiry</option>
                                            <option value="support">Technical Support</option>
                                            <option value="billing">Billing / Payment</option>
                                            <option value="feature">Feature Request</option>
                                            <option value="bug">Bug Report</option>
                                            <option value="premier">Premier Upgrade</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label style={{ fontWeight: 600, marginBottom: 4, display: 'block' }}>Subject *</label>
                                        <input type="text" value={contactForm.subject} onChange={e => setContactForm(p => ({ ...p, subject: e.target.value }))} required placeholder="Brief subject of your message" style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14 }} />
                                    </div>
                                    <div className="form-group">
                                        <label style={{ fontWeight: 600, marginBottom: 4, display: 'block' }}>Message *</label>
                                        <textarea value={contactForm.message} onChange={e => setContactForm(p => ({ ...p, message: e.target.value }))} required rows="5" placeholder="Describe your question or issue in detail..." style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14, resize: 'vertical' }} />
                                    </div>
                                    <div className="form-group">
                                        <label style={{ fontWeight: 600, marginBottom: 4, display: 'block' }}>📷 Attach Photos (max 5)</label>
                                        <input type="file" accept="image/*" multiple onChange={handleContactPhotoUpload} style={{ fontSize: 14 }} />
                                        {contactPhotos.length > 0 && (
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
                                                {contactPhotos.map((photo, idx) => (
                                                    <div key={idx} style={{ position: 'relative', display: 'inline-block' }}>
                                                        <img src={photo} alt={`Attachment ${idx + 1}`} style={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 8, border: '1px solid #e5e7eb' }} />
                                                        <button type="button" onClick={() => setContactPhotos(prev => prev.filter((_, i) => i !== idx))} style={{ position: 'absolute', top: -6, right: -6, background: '#ef4444', color: '#fff', border: 'none', borderRadius: '50%', width: 20, height: 20, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>✕</button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <button type="submit" className="btn btn-primary" disabled={contactSending} style={{ alignSelf: 'flex-start', padding: '10px 24px' }}>
                                        {contactSending ? 'Sending...' : '📤 Send Message'}
                                    </button>
                                </form>
                            </div>

                            {/* Previous Messages */}
                            <div style={{ maxWidth: 600, margin: '32px auto 0' }}>
                                <h3 style={{ marginBottom: 12 }}>📋 My Previous Messages</h3>
                                {loadingMessages ? (
                                    <div className="loading-container"><div className="loading-spinner"></div><p>Loading messages...</p></div>
                                ) : myMessages.length === 0 ? (
                                    <div className="empty-state" style={{ padding: 24 }}><div className="empty-icon">📭</div><h3>No messages yet</h3><p>Your sent messages will appear here.</p></div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                        {myMessages.map(msg => (
                                            <div key={msg.id} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 16 }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                                    <strong style={{ fontSize: 15 }}>{msg.subject}</strong>
                                                    <span style={{
                                                        fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20,
                                                        background: msg.status === 'unread' ? '#fef3c7' : msg.status === 'read' ? '#dbeafe' : msg.status === 'replied' ? '#dcfce7' : '#f3f4f6',
                                                        color: msg.status === 'unread' ? '#92400e' : msg.status === 'read' ? '#1e40af' : msg.status === 'replied' ? '#166534' : '#6b7280'
                                                    }}>
                                                        {msg.status === 'unread' ? '⏳ Pending' : msg.status === 'read' ? '👁️ Read' : msg.status === 'replied' ? '✅ Replied' : '📦 Archived'}
                                                    </span>
                                                </div>
                                                <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 6 }}>
                                                    📂 {msg.category || 'general'} · {new Date(msg.created_at || msg.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                                </div>
                                                <p style={{ fontSize: 14, color: '#374151', margin: 0, whiteSpace: 'pre-wrap' }}>{msg.message}</p>
                                                {msg.photos && msg.photos.length > 0 && (
                                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
                                                        {msg.photos.map((photo, idx) => (
                                                            <img key={idx} src={photo} alt={`Attachment ${idx + 1}`} style={{ width: 96, height: 72, objectFit: 'cover', borderRadius: 8, border: '1px solid #e5e7eb', cursor: 'pointer' }} onClick={() => window.open(photo, '_blank')} />
                                                        ))}
                                                    </div>
                                                )}
                                                {msg.admin_reply && (
                                                    <div style={{ marginTop: 12, padding: 12, background: '#f0fdf4', borderRadius: 8, borderLeft: '3px solid #22c55e' }}>
                                                        <div style={{ fontSize: 12, fontWeight: 600, color: '#166534', marginBottom: 4 }}>💬 Admin Reply:</div>
                                                        <p style={{ fontSize: 14, color: '#374151', margin: 0, whiteSpace: 'pre-wrap' }}>{msg.admin_reply}</p>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Edit Business Modal */}
                    {showBusinessModal && (
                        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowBusinessModal(false)}>
                            <div className="modal-content">
                                <div className="modal-header"><h2>✏️ Edit Business</h2><button className="modal-close" onClick={() => setShowBusinessModal(false)}>✕</button></div>
                                <form onSubmit={saveBusiness} className="modal-form">
                                    <div className="form-group"><label>Business Name</label><input value={editingBusiness.name || ''} onChange={updateBiz('name')} type="text" required /></div>
                                    <div className="form-row">
                                        <div className="form-group"><label>Description (EN)</label><textarea value={editingBusiness.description_en || ''} onChange={updateBiz('description_en')} rows="3"></textarea></div>
                                        <div className="form-group"><label>Description (MY)</label><textarea value={editingBusiness.description_my || ''} onChange={updateBiz('description_my')} rows="3"></textarea></div>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group"><label>Phone</label><input value={editingBusiness.phone || ''} onChange={updateBiz('phone')} type="text" /></div>
                                        <div className="form-group"><label>Website</label><input value={editingBusiness.website || ''} onChange={updateBiz('website')} type="text" /></div>
                                    </div>
                                    <div className="form-group"><label>Address</label><input value={editingBusiness.address || ''} onChange={updateBiz('address')} type="text" /></div>
                                    <div className="form-row">
                                        <div className="form-group"><label>Price Range</label><select value={editingBusiness.price_range || '¥'} onChange={updateBiz('price_range')}>
                                            <option value="¥">¥ - Budget</option><option value="¥¥">¥¥ - Moderate</option><option value="¥¥¥">¥¥¥ - Premium</option><option value="¥¥¥¥">¥¥¥¥ - Luxury</option>
                                        </select></div>
                                        <div className="form-group"><label>Hours</label><input value={editingBusiness.hours || ''} onChange={updateBiz('hours')} type="text" placeholder="e.g. 9:00-21:00" /></div>
                                    </div>
                                    <div className="modal-actions">
                                        <button type="button" className="btn btn-outline" onClick={() => setShowBusinessModal(false)}>Cancel</button>
                                        <button type="submit" className="btn btn-primary" disabled={savingBusiness}>{savingBusiness ? 'Saving...' : 'Save Changes'}</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Coupon Modal */}
                    {showCouponModal && (
                        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowCouponModal(false)}>
                            <div className="modal-content">
                                <div className="modal-header"><h2>{editingCoupon.id ? '✏️ Edit Coupon' : '➕ New Coupon'}</h2><button className="modal-close" onClick={() => setShowCouponModal(false)}>✕</button></div>
                                <form onSubmit={saveCouponFn} className="modal-form">
                                    <div className="form-group"><label>Business *</label><select value={editingCoupon.business_id} onChange={updateCpn('business_id')} required><option value="">Select business</option>{businesses.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}</select></div>
                                    <div className="form-row">
                                        <div className="form-group"><label>Coupon Code *</label><input value={editingCoupon.code} onChange={updateCpn('code')} type="text" required placeholder="e.g. SAVE20" /></div>
                                        <div className="form-group"><label>Title *</label><input value={editingCoupon.title} onChange={updateCpn('title')} type="text" required placeholder="e.g. 20% Off Lunch" /></div>
                                    </div>
                                    <div className="form-group"><label>Description</label><textarea value={editingCoupon.description} onChange={updateCpn('description')} rows="2" placeholder="Optional coupon description"></textarea></div>
                                    <div className="form-row">
                                        <div className="form-group"><label>Discount Type *</label><select value={editingCoupon.discount_type} onChange={updateCpn('discount_type')} required><option value="percentage">Percentage (%)</option><option value="fixed">Fixed Amount (¥)</option><option value="freebie">Freebie / Gift</option></select></div>
                                        <div className="form-group"><label>Discount Value</label><input value={editingCoupon.discount_value} onChange={e => setEditingCoupon(p => ({ ...p, discount_value: Number(e.target.value) }))} type="number" min="0" step="0.01" /></div>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group"><label>Min Purchase (¥)</label><input value={editingCoupon.min_purchase || ''} onChange={e => setEditingCoupon(p => ({ ...p, min_purchase: e.target.value ? Number(e.target.value) : null }))} type="number" min="0" placeholder="Optional" /></div>
                                        <div className="form-group"><label>Max Uses</label><input value={editingCoupon.max_uses || ''} onChange={e => setEditingCoupon(p => ({ ...p, max_uses: e.target.value ? Number(e.target.value) : null }))} type="number" min="0" placeholder="Unlimited" /></div>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group"><label>Start Date</label><input value={editingCoupon.start_date} onChange={updateCpn('start_date')} type="date" /></div>
                                        <div className="form-group"><label>End Date</label><input value={editingCoupon.end_date} onChange={updateCpn('end_date')} type="date" /></div>
                                    </div>
                                    <div className="form-group checkbox-group"><label><input type="checkbox" checked={editingCoupon.is_active} onChange={updateCpn('is_active')} /><span>Active</span></label></div>
                                    <div className="modal-actions">
                                        <button type="button" className="btn btn-outline" onClick={() => setShowCouponModal(false)}>Cancel</button>
                                        <button type="submit" className="btn btn-primary" disabled={savingCoupon}>{savingCoupon ? 'Saving...' : editingCoupon.id ? 'Update Coupon' : 'Create Coupon'}</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Menu Item Modal */}
                    {showMenuModal && (
                        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowMenuModal(false)}>
                            <div className="modal-content">
                                <div className="modal-header"><h2>{editingMenuItem.id ? '✏️ Edit Menu Item' : '➕ New Menu Item'}</h2><button className="modal-close" onClick={() => setShowMenuModal(false)}>✕</button></div>
                                <form onSubmit={saveMenuItemFn} className="modal-form">
                                    <div className="form-row">
                                        <div className="form-group"><label>Name (EN) *</label><input value={editingMenuItem.name} onChange={updateMenu('name')} type="text" required placeholder="e.g. Chicken Curry" /></div>
                                        <div className="form-group"><label>Name (MY)</label><input value={editingMenuItem.name_my || ''} onChange={updateMenu('name_my')} type="text" placeholder="Myanmar name" /></div>
                                    </div>
                                    <div className="form-group"><label>Description</label><textarea value={editingMenuItem.description || ''} onChange={updateMenu('description')} rows="2" placeholder="Short description of the dish"></textarea></div>
                                    <div className="form-row">
                                        <div className="form-group"><label>Price (¥) *</label><input value={editingMenuItem.price} onChange={updateMenu('price')} type="number" min="0" step="1" required placeholder="e.g. 800" /></div>
                                        <div className="form-group"><label>Category</label><select value={editingMenuItem.category || ''} onChange={updateMenu('category')}><option value="">Select category</option>{menuCategories.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group"><label>Photo URL</label><input value={editingMenuItem.photo || ''} onChange={updateMenu('photo')} type="text" placeholder="Image URL" /></div>
                                        <div className="form-group" style={{width:120}}><label>Order</label><input value={editingMenuItem.display_order || 0} onChange={updateMenu('display_order')} type="number" min="0" /></div>
                                    </div>
                                    <div className="form-group checkbox-group"><label><input type="checkbox" checked={editingMenuItem.is_available !== false} onChange={updateMenu('is_available')} /><span>Available</span></label></div>
                                    <div className="modal-actions">
                                        <button type="button" className="btn btn-outline" onClick={() => setShowMenuModal(false)}>Cancel</button>
                                        <button type="submit" className="btn btn-primary" disabled={savingMenu}>{savingMenu ? 'Saving...' : editingMenuItem.id ? 'Update Item' : 'Add Item'}</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    <button className="page-back-btn" onClick={goBack} type="button">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M5 12L12 19M5 12L12 5" /></svg>
                        Back
                    </button>
                </div>
            </div>
        </div>
    )
}
