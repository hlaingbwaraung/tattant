/**
 * CategoryListPage – Displays businesses filtered by category slug.
 */
import React, { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import api from '../services/api'
import AppHeader from '../components/layout/AppHeader'
import './CategoryListPage.css'

export default function CategoryListPage() {
    const { slug } = useParams()
    const { t, i18n } = useTranslation()
    const currentLocale = i18n.language

    const [businesses, setBusinesses] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const categoryMap = {
        'phone-and-sim-cards': { name: t('category.simCards'), icon: '📱', description: t('category.simCardsDesc') },
        'restaurants': { name: t('category.restaurants'), icon: '🍽️', description: t('category.restaurantsDesc') },
        'real-estate': { name: t('category.realEstate'), icon: '🏠', description: t('category.realEstateDesc') },
        'book-stores': { name: t('category.bookstores'), icon: '📚', description: t('category.bookstoresDesc') },
        'currency-exchange': { name: t('category.currencyExchange'), icon: '💱', description: t('category.currencyExchangeDesc') },
    }

    const category = categoryMap[slug] || { name: slug, icon: '📂', description: '' }

    useEffect(() => {
        document.title = `${category.name} | Tattant`
        return () => { document.title = 'Tattant' }
    }, [slug, category.name])

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            setError('')
            try {
                const response = await api.get(`/businesses?category=${slug}`)
                setBusinesses(response.data.businesses || response.data)
            } catch (err) {
                setError('Failed to load businesses. Please try again later.')
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [slug])

    return (
        <div className="category-list-page">
            <AppHeader />

            <section className="category-header">
                <div className="container">
                    <div className="breadcrumb">
                        <Link to="/">{t('common.home')}</Link>
                        <span className="separator">/</span>
                        <span className="current">{category.name}</span>
                    </div>
                    <div className="header-content">
                        <span className="category-icon">{category.icon}</span>
                        <div>
                            <h1 className="category-title">{category.name}</h1>
                            <p className="category-description">{category.description}</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="businesses-section">
                <div className="container">
                    {loading ? (
                        <div className="loading-container">
                            <div className="loading-spinner"></div>
                            <p>{t('business.loadingBusinesses')}</p>
                        </div>
                    ) : error ? (
                        <div className="error-container">
                            <div className="error-icon">⚠️</div>
                            <p className="error">{error}</p>
                            <Link to="/" className="back-btn">{t('auth.backToHome')}</Link>
                        </div>
                    ) : businesses.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">📭</div>
                            <h2>{t('business.noResults')}</h2>
                            <p>{t('business.noResultsDesc')}</p>
                            <Link to="/" className="browse-btn">{t('business.browseAll')}</Link>
                        </div>
                    ) : (
                        <div>
                            <p className="results-count">{businesses.length} {t('business.businessesFound')}</p>
                            <div className="businesses-grid">
                                {businesses.map(business => (
                                    <Link key={business.id} to={`/businesses/${business.id}`} className="business-card">
                                        <div className="card-image">
                                            <img src={business.photos?.[0] || 'https://via.placeholder.com/400x250'} alt={business.name} />
                                            <span className="price-badge">{business.price_range}</span>
                                            {business.coupons?.length > 0 && (
                                                <span className="coupon-badge-overlay">🎟️ {business.coupons.length} {business.coupons.length === 1 ? 'Coupon' : 'Coupons'}</span>
                                            )}
                                        </div>
                                        <div className="card-content">
                                            <h3 className="business-name">{business.name}{business.is_premier && <svg className="verified-mark verified-mark-sm" viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg"><path d="M20.396 11c0-.61-.208-1.18-.572-1.632.249-.467.39-.996.39-1.559 0-1.327-.795-2.467-1.934-2.971a3.174 3.174 0 0 0-.389-1.56A3.195 3.195 0 0 0 15.12.872a3.17 3.17 0 0 0-1.559.39A3.196 3.196 0 0 0 11 .396c-.61 0-1.18.208-1.632.572a3.174 3.174 0 0 0-1.559-.39A3.195 3.195 0 0 0 4.838 2.51a3.174 3.174 0 0 0-.389 1.56 3.195 3.195 0 0 0-1.933 2.97c0 .564.14 1.093.39 1.56A3.196 3.196 0 0 0 2.333 11c0 .61.208 1.18.572 1.632a3.174 3.174 0 0 0-.39 1.559c0 1.327.796 2.467 1.934 2.971.085.552.29 1.08.589 1.556a3.195 3.195 0 0 0 2.771 1.596c.564 0 1.093-.14 1.56-.39.452.364 1.022.572 1.631.572s1.18-.208 1.632-.572c.467.249.996.39 1.559.39a3.195 3.195 0 0 0 2.771-1.596c.3-.476.504-1.004.589-1.556a3.195 3.195 0 0 0 1.934-2.971c0-.564-.14-1.093-.39-1.56.364-.452.572-1.022.572-1.631Z" fill="#1d9bf0"/><path d="M9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246-5.683 6.206Z" fill="#fff"/></svg>}</h3>
                                            <p className="business-description">{currentLocale === 'my' ? (business.description_my || business.description_en) : business.description_en}</p>
                                            <div className="business-meta"><a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(business.address)}`} target="_blank" rel="noreferrer" className="address" onClick={e => e.stopPropagation()} style={{display:'inline-flex',alignItems:'center',gap:'4px',color:'#666',textDecoration:'none',cursor:'pointer',fontSize:'0.9rem',transition:'color 0.2s'}} onMouseEnter={e => e.currentTarget.style.color='#333'} onMouseLeave={e => e.currentTarget.style.color='#666'}><span style={{opacity:0.7}}>📍</span><span>{business.address}</span></a></div>
                                            <div className="business-tags">
                                                {business.tags?.slice(0, 3).map(tag => <span key={tag} className="tag">{tag}</span>)}
                                            </div>
                                            <span className="view-link">{t('business.viewDetails')} →</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </div>
    )
}
