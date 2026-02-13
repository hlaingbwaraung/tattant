/**
 * ExplorePage – Browse categories and featured businesses
 */
import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import api from '../services/api'
import AppHeader from '../components/layout/AppHeader'
import './ExplorePage.css'

export default function ExplorePage() {
    const { t, i18n } = useTranslation()
    const currentLocale = i18n.language

    const [categories, setCategories] = useState([])
    const [businesses, setBusinesses] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const catRes = await api.get('/categories')
                const cats = catRes.data.categories || catRes.data || []

                const bizRes = await api.get('/businesses')
                const allBusinesses = bizRes.data.businesses || bizRes.data || []

                const countMap = {}
                allBusinesses.forEach(b => {
                    const cid = b.category_id
                    countMap[cid] = (countMap[cid] || 0) + 1
                })

                setCategories(cats.map(c => ({ ...c, businessCount: countMap[c.id] || 0 })))
                setBusinesses(allBusinesses.slice(0, 6))
            } catch (err) {
                console.error('Error loading explore data:', err)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    return (
        <div className="explore-page">
            <AppHeader />

            <section className="explore-hero">
                <div className="explore-hero-overlay"></div>
                <div className="explore-hero-content">
                    <span className="explore-badge">🗾 {t('explore.badge')}</span>
                    <h1 className="explore-hero-title">{t('explore.title')} <span className="text-gold">{t('explore.titleHighlight')}</span> {t('explore.titleEnd')}</h1>
                    <p className="explore-hero-subtitle">{t('explore.subtitle')}</p>
                </div>
            </section>

            <section className="explore-section">
                <div className="explore-container">
                    <h2 className="section-title">{t('explore.allCategories')}</h2>

                    {loading ? (
                        <div className="loading-container">
                            <div className="loading-spinner"></div>
                            <p>{t('explore.loadingCategories')}</p>
                        </div>
                    ) : categories.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">📭</div>
                            <p>{t('explore.noCategories')}</p>
                        </div>
                    ) : (
                        <div className="categories-grid">
                            {categories.map(cat => (
                                <Link key={cat.id} to={`/categories/${cat.slug}`} className="category-card">
                                    <div className="category-card-icon"><span>{cat.icon}</span></div>
                                    <div className="category-card-body">
                                        <h3 className="category-card-name">{currentLocale === 'my' ? cat.name_my : cat.name_en}</h3>
                                        <p className="category-card-count">{cat.businessCount || 0} {t('explore.businessCount')}</p>
                                    </div>
                                    <span className="category-card-arrow">→</span>
                                </Link>
                            ))}
                        </div>
                    )}

                    {businesses.length > 0 && (
                        <div className="featured-section">
                            <h2 className="section-title">{t('home.featured')}</h2>
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

            <footer className="explore-footer">
                <div className="explore-container"><p>{t('footer.copyright')}</p></div>
            </footer>
        </div>
    )
}
