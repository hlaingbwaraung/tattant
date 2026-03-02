/**
 * BusinessDetailPage – Single business view with coupons, save toggle, gallery.
 */
import React, { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import api from '../services/api'
import { createPublicBooking } from '../services/bookingService'
import { getPublicMenu } from '../services/menuItemService'
import AppHeader from '../components/layout/AppHeader'
import { saveBusiness, unsaveBusiness, checkIfSaved } from '../services/favoriteService'
import useAuthStore from '../store/useAuthStore'
import './BusinessDetailPage.css'

export default function BusinessDetailPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { t, i18n } = useTranslation()
    const currentLocale = i18n.language
    const token = useAuthStore(s => s.token)
    const isAuthenticated = !!token

    const [business, setBusiness] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [isSaved, setIsSaved] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [showShareMenu, setShowShareMenu] = useState(false)

    // Booking form
    const [showBookingForm, setShowBookingForm] = useState(false)
    const [bookingForm, setBookingForm] = useState({
        customer_name: '', customer_phone: '',
        booking_date: '', booking_time: '', party_size: 1, notes: ''
    })
    const [bookingSaving, setBookingSaving] = useState(false)
    const [bookingSuccess, setBookingSuccess] = useState('')

    // Menu items
    const [menuItems, setMenuItems] = useState([])

    useEffect(() => {
        return () => { document.title = 'Tattant' }
    }, [])

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await api.get(`/businesses/${id}`)
                setBusiness(response.data)
                document.title = `${response.data.name} | Tattant`
                if (isAuthenticated) {
                    try {
                        const savedResponse = await checkIfSaved(id)
                        setIsSaved(savedResponse.data.isSaved)
                    } catch (err) { console.error('Error checking saved status:', err) }
                }
                // Load menu
                try {
                    const menuRes = await api.get(`/businesses/${id}/menu`)
                    setMenuItems(menuRes.data.items || [])
                } catch (err) { console.error('Error loading menu:', err) }
            } catch (err) {
                setError(t('business.failedToLoad'))
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [id, isAuthenticated, t])

    const goBack = () => window.history.length > 1 ? navigate(-1) : navigate('/')

    const handleToggleFavorite = async () => {
        if (!isAuthenticated) { navigate('/login'); return }
        setIsSaving(true)
        try {
            if (isSaved) { await unsaveBusiness(business.id); setIsSaved(false) }
            else { await saveBusiness(business.id); setIsSaved(true) }
        } catch (err) {
            console.error('Error toggling favorite:', err)
            alert(err.response?.data?.message || 'Failed to update favorites')
        } finally { setIsSaving(false) }
    }

    const getShareUrl = () => window.location.href

    const handleCopyLink = async () => {
        try { await navigator.clipboard.writeText(getShareUrl()); alert(t('business.linkCopied')) }
        catch (err) { console.error('Error copying:', err) }
        setShowShareMenu(false)
    }

    const handleShareFacebook = () => {
        const url = getShareUrl()
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank', 'noopener,noreferrer,width=600,height=400')
        setShowShareMenu(false)
    }

    const handleShareTikTok = async () => {
        try { await navigator.clipboard.writeText(getShareUrl()) } catch (e) {}
        window.open('https://www.tiktok.com/upload', '_blank')
        alert('Link copied! Paste it in your TikTok post.')
        setShowShareMenu(false)
    }

    const handleNativeShare = async () => {
        const url = getShareUrl()
        try { await navigator.share({ title: business?.name || 'Tattant', text: `Check out ${business?.name} on Tattant!`, url }) }
        catch (err) { if (err.name !== 'AbortError') console.error('Share failed:', err) }
        setShowShareMenu(false)
    }

    const copyCoupon = async (code) => {
        try { await navigator.clipboard.writeText(code); alert(`Coupon code "${code}" copied!`) }
        catch (err) { console.error('Error copying coupon:', err) }
    }

    const handleBookingSubmit = async (e) => {
        e.preventDefault()
        if (!isAuthenticated) { navigate('/login'); return }
        setBookingSaving(true); setBookingSuccess('')
        try {
            const res = await createPublicBooking(id, bookingForm)
            setBookingSuccess(res.data.message || 'Booking submitted!')
            setBookingForm({ customer_name: '', customer_phone: '', booking_date: '', booking_time: '', party_size: 1, notes: '' })
            setTimeout(() => setBookingSuccess(''), 5000)
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to submit booking')
        } finally { setBookingSaving(false) }
    }

    const bf = (field) => (e) => setBookingForm(p => ({ ...p, [field]: e.target.type === 'number' ? Number(e.target.value) : e.target.value }))

    // Group menu by category
    const groupedMenu = menuItems.reduce((acc, item) => {
        const cat = item.category || 'Other'
        if (!acc[cat]) acc[cat] = []
        acc[cat].push(item)
        return acc
    }, {})

    return (
        <div className="business-detail-page">
            <AppHeader />
            {loading ? (
                <div className="loading-container"><div className="loading-spinner"></div><p>{t('business.loadingDetails')}</p></div>
            ) : error ? (
                <div className="error-container"><div className="error-icon">⚠️</div><p className="error">{error}</p><Link to="/" className="back-btn">{t('auth.backToHome')}</Link></div>
            ) : business && (
                <div className="business-detail">
                    <div className="business-hero">
                        <img src={business.photos?.[0] || 'https://via.placeholder.com/1200x400'} alt={business.name} />
                        <div className="hero-overlay"></div>
                    </div>
                    <div className="container">
                        <div className="breadcrumb">
                            <Link to="/">{t('common.home')}</Link><span className="separator">/</span><span className="current">{business.name}</span>
                        </div>
                        <div className="business-content">
                            <div className="main-content">
                                <div className="title-section">
                                    <h1 className="business-name">{business.name}{business.is_premier && <svg className="verified-mark" viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg"><path d="M20.396 11c0-.61-.208-1.18-.572-1.632.249-.467.39-.996.39-1.559 0-1.327-.795-2.467-1.934-2.971a3.174 3.174 0 0 0-.389-1.56A3.195 3.195 0 0 0 15.12.872a3.17 3.17 0 0 0-1.559.39A3.196 3.196 0 0 0 11 .396c-.61 0-1.18.208-1.632.572a3.174 3.174 0 0 0-1.559-.39A3.195 3.195 0 0 0 4.838 2.51a3.174 3.174 0 0 0-.389 1.56 3.195 3.195 0 0 0-1.933 2.97c0 .564.14 1.093.39 1.56A3.196 3.196 0 0 0 2.333 11c0 .61.208 1.18.572 1.632a3.174 3.174 0 0 0-.39 1.559c0 1.327.796 2.467 1.934 2.971.085.552.29 1.08.589 1.556a3.195 3.195 0 0 0 2.771 1.596c.564 0 1.093-.14 1.56-.39.452.364 1.022.572 1.631.572s1.18-.208 1.632-.572c.467.249.996.39 1.559.39a3.195 3.195 0 0 0 2.771-1.596c.3-.476.504-1.004.589-1.556a3.195 3.195 0 0 0 1.934-2.971c0-.564-.14-1.093-.39-1.56.364-.452.572-1.022.572-1.631Z" fill="#1d9bf0"/><path d="M9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246-5.683 6.206Z" fill="#fff"/></svg>}</h1>
                                    <span className="price-badge">{business.price_range}</span>
                                </div>
                                <div className="business-meta"><span className="languages">🌐 {business.languages_supported?.join(', ')}</span></div>
                                <div className="business-tags">{business.tags?.map(tag => <span key={tag} className="tag">{tag}</span>)}</div>
                                <div className="section">
                                    <h2>{t('business.about')}</h2>
                                    <p>{currentLocale === 'my' ? (business.description_my || business.description_en) : business.description_en}</p>
                                </div>
                                {business.opening_hours && (
                                    <div className="section">
                                        <h2>{t('business.hours')}</h2>
                                        <div className="opening-hours">
                                            {Object.entries(business.opening_hours).map(([day, hours]) => (
                                                <div key={day} className="hours-row"><span className="day">{day.toUpperCase()}</span><span className="hours">{hours}</span></div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                <div className="section"><h2>{t('business.location')}</h2><a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(business.address)}`} target="_blank" rel="noreferrer" className="address-link detail-link-btn"><span style={{opacity:0.7}}>📍</span><span>{business.address}</span></a></div>
                                {business.phone && (
                                    <div className="section">
                                        <h2>{t('business.contact')}</h2>
                                        <a href={`tel:${business.phone}`} className="phone detail-link-btn"><span style={{opacity:0.7}}>📞</span><span>{business.phone.replace(/^\+81-?/, '0')}</span></a>
                                        {business.website && <p><a href={business.website} target="_blank" rel="noreferrer" className="website-link">🌐 {t('business.visitWebsite')} →</a></p>}
                                    </div>
                                )}

                                {/* Menu Section */}
                                {menuItems.length > 0 && (
                                    <div className="section menu-section">
                                        <h2>🍽️ Menu</h2>
                                        {Object.entries(groupedMenu).map(([cat, items]) => (
                                            <div key={cat} className="menu-category-group">
                                                <h4 className="menu-cat-title">{cat}</h4>
                                                <div className="menu-list">
                                                    {items.map(item => (
                                                        <div key={item.id} className="menu-list-item">
                                                            <div className="menu-list-info">
                                                                <span className="menu-list-name">{item.name}</span>
                                                                {item.name_my && <span className="menu-list-name-my">{item.name_my}</span>}
                                                                {item.description && <span className="menu-list-desc">{item.description}</span>}
                                                            </div>
                                                            <span className="menu-list-price">¥{Number(item.price).toLocaleString()}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="sidebar">
                                {business.coupons?.length > 0 && (
                                    <div className="coupons-card">
                                        <h3>🎟️ Available Coupons</h3>
                                        <div className="coupon-list">
                                            {business.coupons.map(coupon => (
                                                <div key={coupon.id} className="coupon-item">
                                                    <div className="coupon-header">
                                                        <span className={`coupon-badge ${coupon.discount_type}`}>
                                                            {coupon.discount_type === 'percentage' ? coupon.discount_value + '%' : coupon.discount_type === 'fixed' ? '¥' + coupon.discount_value : '🎁'}
                                                            {coupon.discount_type === 'freebie' ? ' FREE' : ' OFF'}
                                                        </span>
                                                        <span className="coupon-code">{coupon.code}</span>
                                                    </div>
                                                    <div className="coupon-title">{coupon.title}</div>
                                                    {coupon.description && <p className="coupon-desc">{coupon.description}</p>}
                                                    <div className="coupon-meta">
                                                        {coupon.min_purchase && <span>Min: ¥{coupon.min_purchase}</span>}
                                                        {coupon.end_date && <span>Expires: {new Date(coupon.end_date).toLocaleDateString()}</span>}
                                                    </div>
                                                    <button className="coupon-copy-btn" onClick={() => copyCoupon(coupon.code)}>📋 Copy Code</button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                <div className="action-card">
                                    <button onClick={handleToggleFavorite} disabled={!isAuthenticated || isSaving} className={`action-btn save-btn ${isSaved ? 'saved' : ''}`}>
                                        <span className="btn-icon">{isSaved ? '❤️' : '🤍'}</span>
                                        {isSaved ? t('business.savedToFavorites') : t('business.saveToFavorites')}
                                    </button>
                                    <div className="share-wrapper">
                                        <button className="action-btn share-btn" onClick={() => setShowShareMenu(v => !v)}>
                                            <svg className="share-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                                            {t('business.shareBusiness')}
                                        </button>
                                        {showShareMenu && (
                                            <>
                                                <div className="share-backdrop" onClick={() => setShowShareMenu(false)} />
                                                <div className="share-menu">
                                                    <button className="share-option" onClick={handleShareFacebook}>
                                                        <svg viewBox="0 0 24 24" width="20" height="20" fill="#1877F2"><path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073c0 6.025 4.388 11.02 10.125 11.927v-8.437H7.078v-3.49h3.047V9.41c0-3.026 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.971H15.83c-1.491 0-1.956.93-1.956 1.886v2.267h3.328l-.532 3.49h-2.796v8.437C19.612 23.093 24 18.098 24 12.073z"/></svg>
                                                        Facebook
                                                    </button>
                                                    <button className="share-option" onClick={handleShareTikTok}>
                                                        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1 0-5.78 2.86 2.86 0 0 1 .9.14V9.01a6.27 6.27 0 0 0-1-.08 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V9.48a8.3 8.3 0 0 0 4.86 1.56V7.59a4.84 4.84 0 0 1-1-.9z"/></svg>
                                                        TikTok
                                                    </button>
                                                    <button className="share-option" onClick={handleCopyLink}>
                                                        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                                                        Copy Link
                                                    </button>
                                                    {typeof navigator !== 'undefined' && navigator.share && (
                                                        <button className="share-option" onClick={handleNativeShare}>
                                                            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
                                                            More...
                                                        </button>
                                                    )}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                    {!isAuthenticated && <p className="login-hint"><Link to="/login">{t('nav.login')}</Link> {t('business.loginToSave')}</p>}
                                </div>

                                {/* Booking Card — Premier shops only */}
                                {business.is_premier ? (
                                    <div className="booking-card">
                                        <h3 className="booking-card-title">Make a Reservation</h3>
                                        {bookingSuccess && <div className="booking-success">{bookingSuccess}</div>}
                                        {!showBookingForm ? (
                                            <button className="action-btn booking-toggle-btn" onClick={() => { if (!isAuthenticated) { navigate('/login'); return; } setShowBookingForm(true) }}>
                                                Book Now
                                            </button>
                                        ) : (
                                            <form className="booking-form" onSubmit={handleBookingSubmit}>
                                                <div className="bf-field">
                                                    <label className="bf-label">Name *</label>
                                                    <input type="text" placeholder="Your full name" value={bookingForm.customer_name} onChange={bf('customer_name')} required />
                                                </div>
                                                <div className="bf-field">
                                                    <label className="bf-label">Phone *</label>
                                                    <input type="tel" placeholder="e.g. 090-1234-5678" value={bookingForm.customer_phone} onChange={bf('customer_phone')} required />
                                                </div>
                                                <div className="bf-row">
                                                    <div className="bf-field">
                                                        <label className="bf-label">Date *</label>
                                                        <input type="date" value={bookingForm.booking_date} onChange={bf('booking_date')} required min={new Date().toISOString().split('T')[0]} />
                                                    </div>
                                                    <div className="bf-field">
                                                        <label className="bf-label">Time</label>
                                                        <input type="time" value={bookingForm.booking_time} onChange={bf('booking_time')} />
                                                    </div>
                                                </div>
                                                <div className="bf-field">
                                                    <label className="bf-label">Party Size</label>
                                                    <div className="bf-counter">
                                                        <button type="button" className="bf-counter-btn" onClick={() => setBookingForm(p => ({ ...p, party_size: Math.max(1, (p.party_size || 1) - 1) }))}>−</button>
                                                        <span className="bf-counter-val">{bookingForm.party_size}</span>
                                                        <button type="button" className="bf-counter-btn" onClick={() => setBookingForm(p => ({ ...p, party_size: Math.min(20, (p.party_size || 1) + 1) }))}>+</button>
                                                    </div>
                                                </div>
                                                <div className="bf-field">
                                                    <label className="bf-label">Notes</label>
                                                    <textarea placeholder="Any special requests..." value={bookingForm.notes} onChange={bf('notes')} rows={3} />
                                                </div>
                                                <div className="booking-actions">
                                                    <button type="submit" className="booking-submit-btn" disabled={bookingSaving}>{bookingSaving ? 'Submitting...' : 'Confirm Booking'}</button>
                                                    <button type="button" className="booking-cancel-btn" onClick={() => setShowBookingForm(false)}>Cancel</button>
                                                </div>
                                            </form>
                                        )}
                                    </div>
                                ) : null}

                                {business.photos?.length > 1 && (
                                    <div className="photos-card">
                                        <h3>{t('business.photos')}</h3>
                                        <div className="photo-grid">
                                            {business.photos.slice(1, 5).map((photo, index) => (
                                                <img key={index} src={photo} alt={`${business.name} - ${index}`} />
                                            ))}
                                        </div>
                                    </div>
                                )}
                                <div className="info-card">
                                    <h3>{t('business.quickInfo')}</h3>
                                    <div className="info-row"><span className="info-label">{t('business.priceRange')}</span><span className="info-value price">{business.price_range}</span></div>
                                    {business.languages_supported && <div className="info-row"><span className="info-label">{t('business.languages')}</span><span className="info-value">{business.languages_supported.length}</span></div>}
                                </div>
                            </div>
                        </div>
                        <button className="page-back-btn" onClick={goBack} type="button">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M5 12L12 19M5 12L12 5" /></svg>
                            Back
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
