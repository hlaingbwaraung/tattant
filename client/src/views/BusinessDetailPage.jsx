/**
 * BusinessDetailPage – Single business view with coupons, save toggle, gallery.
 */
import React, { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import axios from 'axios'
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

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/businesses/${id}`)
                setBusiness(response.data)
                if (isAuthenticated) {
                    try {
                        const savedResponse = await checkIfSaved(id)
                        setIsSaved(savedResponse.data.isSaved)
                    } catch (err) { console.error('Error checking saved status:', err) }
                }
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

    const handleShare = async () => {
        try { await navigator.clipboard.writeText(window.location.href); alert(t('business.linkCopied')) }
        catch (err) { console.error('Error sharing:', err) }
    }

    const copyCoupon = async (code) => {
        try { await navigator.clipboard.writeText(code); alert(`Coupon code "${code}" copied!`) }
        catch (err) { console.error('Error copying coupon:', err) }
    }

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
                                    <h1 className="business-name">{business.name}</h1>
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
                                <div className="section"><h2>{t('business.location')}</h2><p className="address">📍 {business.address}</p></div>
                                {business.phone && (
                                    <div className="section">
                                        <h2>{t('business.contact')}</h2>
                                        <p className="phone">📞 {business.phone}</p>
                                        {business.website && <p><a href={business.website} target="_blank" rel="noreferrer" className="website-link">🌐 {t('business.visitWebsite')} →</a></p>}
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
                                    <h3>{t('business.quickActions')}</h3>
                                    <button onClick={handleToggleFavorite} disabled={!isAuthenticated || isSaving} className={`action-btn save-btn ${isSaved ? 'saved' : ''}`}>
                                        <span className="btn-icon">{isSaved ? '❤️' : '🤍'}</span>
                                        {isSaved ? t('business.savedToFavorites') : t('business.saveToFavorites')}
                                    </button>
                                    <button className="action-btn share-btn" onClick={handleShare}><span className="btn-icon">📤</span> {t('business.shareBusiness')}</button>
                                    {!isAuthenticated && <p className="login-hint"><Link to="/login">{t('nav.login')}</Link> {t('business.loginToSave')}</p>}
                                </div>
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
