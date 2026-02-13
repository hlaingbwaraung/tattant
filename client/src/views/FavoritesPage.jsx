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
                                <Link to={`/business/${business.id}`} className="card-link">
                                    <div className="card-image">
                                        <img src={business.photos?.[0] || 'https://via.placeholder.com/400x250'} alt={business.name} />
                                    </div>
                                    <div className="card-content">
                                        <div className="card-header">
                                            <h3 className="business-name">{business.name}</h3>
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
