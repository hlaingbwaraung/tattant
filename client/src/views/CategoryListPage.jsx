/**
 * CategoryListPage – Displays businesses filtered by category slug.
 */
import React, { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import axios from 'axios'
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
        'sim-cards': { name: t('category.simCards'), icon: '📶', description: t('category.simCardsDesc') },
        'ramen': { name: t('category.ramen'), icon: '🍜', description: t('category.ramenDesc') },
        'sushi': { name: t('category.sushi'), icon: '🍣', description: t('category.sushiDesc') },
        'yakiniku': { name: t('category.yakiniku'), icon: '🥩', description: t('category.yakinikuDesc') },
        'bookstores': { name: t('category.bookstores'), icon: '📚', description: t('category.bookstoresDesc') },
        'currency-exchange': { name: t('category.currencyExchange'), icon: '💱', description: t('category.currencyExchangeDesc') },
    }

    const category = categoryMap[slug] || { name: slug, icon: '📂', description: '' }

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            setError('')
            try {
                const response = await axios.get(`http://localhost:5000/api/businesses?category=${slug}`)
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
                                            <h3 className="business-name">{business.name}</h3>
                                            <p className="business-description">{currentLocale === 'my' ? (business.description_my || business.description_en) : business.description_en}</p>
                                            <div className="business-meta"><span className="address">📍 {business.address}</span></div>
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
