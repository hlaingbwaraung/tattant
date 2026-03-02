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
                                            <h3 className="business-name">{business.name}{business.is_premier && <svg className="verified-mark verified-mark-sm" viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg"><path d="M20.396 11c0-.61-.208-1.18-.572-1.632.249-.467.39-.996.39-1.559 0-1.327-.795-2.467-1.934-2.971a3.174 3.174 0 0 0-.389-1.56A3.195 3.195 0 0 0 15.12.872a3.17 3.17 0 0 0-1.559.39A3.196 3.196 0 0 0 11 .396c-.61 0-1.18.208-1.632.572a3.174 3.174 0 0 0-1.559-.39A3.195 3.195 0 0 0 4.838 2.51a3.174 3.174 0 0 0-.389 1.56 3.195 3.195 0 0 0-1.933 2.97c0 .564.14 1.093.39 1.56A3.196 3.196 0 0 0 2.333 11c0 .61.208 1.18.572 1.632a3.174 3.174 0 0 0-.39 1.559c0 1.327.796 2.467 1.934 2.971.085.552.29 1.08.589 1.556a3.195 3.195 0 0 0 2.771 1.596c.564 0 1.093-.14 1.56-.39.452.364 1.022.572 1.631.572s1.18-.208 1.632-.572c.467.249.996.39 1.559.39a3.195 3.195 0 0 0 2.771-1.596c.3-.476.504-1.004.589-1.556a3.195 3.195 0 0 0 1.934-2.971c0-.564-.14-1.093-.39-1.56.364-.452.572-1.022.572-1.631Z" fill="#1d9bf0"/><path d="M9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246-5.683 6.206Z" fill="#fff"/></svg>}</h3>
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
