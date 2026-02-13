/**
 * ShopOwnerDashboard – Dashboard for shop owners to manage businesses and coupons.
 */
import React, { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AppHeader from '../components/layout/AppHeader'
import { getOwnerStats, getMyBusinesses, updateMyBusiness } from '../services/shopOwnerService'
import { getMyCoupons, createCoupon, updateCoupon, deleteCoupon as deleteCouponApi } from '../services/couponService'
import './ShopOwnerDashboard.css'

const emptyCoupon = {
    business_id: '', code: '', title: '', description: '',
    discount_type: 'percentage', discount_value: 0,
    min_purchase: null, max_uses: null,
    start_date: '', end_date: '', is_active: true
}

export default function ShopOwnerDashboard() {
    const navigate = useNavigate()

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

    const loadStats = useCallback(async () => {
        try { const res = await getOwnerStats(); setStats(res.data) }
        catch (err) { console.error('Error loading stats:', err) }
    }, [])

    const loadBusinessesFn = useCallback(async () => {
        setLoadingBusinesses(true)
        try { const res = await getMyBusinesses(); setBusinesses(res.data.businesses || res.data || []) }
        catch (err) { console.error('Error loading businesses:', err) }
        finally { setLoadingBusinesses(false) }
    }, [])

    const loadCouponsFn = useCallback(async () => {
        setLoadingCoupons(true)
        try { const res = await getMyCoupons(); setCoupons(res.data.coupons || res.data || []) }
        catch (err) { console.error('Error loading coupons:', err) }
        finally { setLoadingCoupons(false) }
    }, [])

    useEffect(() => {
        Promise.all([loadStats(), loadBusinessesFn(), loadCouponsFn()])
    }, [loadStats, loadBusinessesFn, loadCouponsFn])

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

    return (
        <div className="shop-owner-dashboard">
            <AppHeader />
            <div className="dashboard-container">
                <div className="container">
                    <div className="page-header"><h1>🏪 Shop Owner Dashboard</h1><p className="subtitle">Manage your businesses and coupons</p></div>

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

                    <button className="page-back-btn" onClick={goBack} type="button">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M5 12L12 19M5 12L12 5" /></svg>
                        Back
                    </button>
                </div>
            </div>
        </div>
    )
}
