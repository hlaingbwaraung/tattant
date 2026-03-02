/**
 * FavoritesPage – Lists the user's saved/bookmarked businesses with remove support.
 */
import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import AppHeader from '../components/layout/AppHeader'
import { getSavedBusinesses, unsaveBusiness } from '../services/favoriteService'
import useAuthStore from '../store/useAuthStore'
import './FavoritesPage.css'

export default function FavoritesPage() {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const token = useAuthStore(s => s.token)
    const isAuthenticated = !!token

    const [favorites, setFavorites] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const truncate = (text, length) => !text ? '' : text.length > length ? text.substring(0, length) + '...' : text
    const truncateAddress = (address) => {
        if (!address) return ''
        const parts = address.split(',')
        return parts.length > 2 ? parts.slice(0, 2).join(',') : address
    }

    const handleRemoveFavorite = async (businessId) => {
        if (!window.confirm('Remove this business from your favorites?')) return
        try {
            await unsaveBusiness(businessId)
            setFavorites(prev => prev.filter(b => b.id !== businessId))
        } catch (err) {
            console.error('Error removing favorite:', err)
            alert('Failed to remove from favorites')
        }
    }

    useEffect(() => {
        if (!isAuthenticated) { navigate('/login'); return }
        const fetchData = async () => {
            try {
                const response = await getSavedBusinesses()
                setFavorites(response.data)
            } catch (err) {
                setError('Failed to load favorites. Please try again later.')
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [isAuthenticated, navigate])

    return (
        <div className="favorites-page">
            <AppHeader />
            <div className="container">
                <div className="page-header">
                    <h1>❤️ {t('favorites.title')}</h1>
                    <p className="subtitle">{t('favorites.subtitle')}</p>
                </div>

                {loading ? (
                    <div className="loading-container"><p className="loading">{t('favorites.loading')}</p></div>
                ) : error ? (
                    <div className="error-container"><p className="error">{error}</p></div>
                ) : favorites.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">💔</div>
                        <h2>{t('favorites.empty')}</h2>
                        <p>{t('favorites.emptyDesc')}</p>
                        <Link to="/" className="browse-btn">{t('favorites.browseBusiness')}</Link>
                    </div>
                ) : (
                    <div className="favorites-grid">
                        {favorites.map(business => (
                            <div key={business.id} className="business-card">
                                <Link to={`/businesses/${business.id}`} className="card-link">
                                    <div className="card-image">
                                        <img src={business.photos?.[0] || 'https://via.placeholder.com/400x250'} alt={business.name} />
                                    </div>
                                    <div className="card-content">
                                        <div className="card-header">
                                            <h3 className="business-name">{business.name}{business.is_premier && <svg className="verified-mark verified-mark-sm" viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg"><path d="M20.396 11c0-.61-.208-1.18-.572-1.632.249-.467.39-.996.39-1.559 0-1.327-.795-2.467-1.934-2.971a3.174 3.174 0 0 0-.389-1.56A3.195 3.195 0 0 0 15.12.872a3.17 3.17 0 0 0-1.559.39A3.196 3.196 0 0 0 11 .396c-.61 0-1.18.208-1.632.572a3.174 3.174 0 0 0-1.559-.39A3.195 3.195 0 0 0 4.838 2.51a3.174 3.174 0 0 0-.389 1.56 3.195 3.195 0 0 0-1.933 2.97c0 .564.14 1.093.39 1.56A3.196 3.196 0 0 0 2.333 11c0 .61.208 1.18.572 1.632a3.174 3.174 0 0 0-.39 1.559c0 1.327.796 2.467 1.934 2.971.085.552.29 1.08.589 1.556a3.195 3.195 0 0 0 2.771 1.596c.564 0 1.093-.14 1.56-.39.452.364 1.022.572 1.631.572s1.18-.208 1.632-.572c.467.249.996.39 1.559.39a3.195 3.195 0 0 0 2.771-1.596c.3-.476.504-1.004.589-1.556a3.195 3.195 0 0 0 1.934-2.971c0-.564-.14-1.093-.39-1.56.364-.452.572-1.022.572-1.631Z" fill="#1d9bf0"/><path d="M9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246-5.683 6.206Z" fill="#fff"/></svg>}</h3>
                                            {business.category && <span className="category-badge">{business.category.icon} {business.category.name_en}</span>}
                                        </div>
                                        <p className="description">{truncate(business.description_en, 120)}</p>
                                        <div className="card-meta">
                                            <span className="price">{business.price_range}</span>
                                            <span className="address">📍 {truncateAddress(business.address)}</span>
                                        </div>
                                        <div className="tags">
                                            {business.tags?.slice(0, 3).map(tag => <span key={tag} className="tag">{tag}</span>)}
                                        </div>
                                    </div>
                                </Link>
                                <button onClick={() => handleRemoveFavorite(business.id)} className="remove-btn" title="Remove from favorites">✕</button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
