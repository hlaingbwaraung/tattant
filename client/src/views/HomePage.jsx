/**
 * HomePage
 *
 * Landing page with:
 *   - Hero banner with CTA buttons
 *   - Category grid (6 featured categories)
 *   - Stats section
 *   - Features section
 *   - CTA section
 *   - Footer
 */

import React from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import useAuthStore from '../store/useAuthStore'
import AppHeader from '../components/layout/AppHeader'
import './HomePage.css'

export default function HomePage() {
    const { t } = useTranslation()
    const token = useAuthStore(s => s.token)
    const isAuthenticated = !!token

    const businessCount = 150
    const categoryCount = 6

    const categories = [
        { id: 1, slug: 'sim-cards', name: t('category.simCards'), icon: '📶', description: t('category.simCardsDesc') },
        { id: 2, slug: 'ramen', name: t('category.ramen'), icon: '🍜', description: t('category.ramenDesc') },
        { id: 3, slug: 'sushi', name: t('category.sushi'), icon: '🍣', description: t('category.sushiDesc') },
        { id: 4, slug: 'yakiniku', name: t('category.yakiniku'), icon: '🥩', description: t('category.yakinikuDesc') },
        { id: 5, slug: 'bookstores', name: t('category.bookstores'), icon: '📚', description: t('category.bookstoresDesc') },
        { id: 6, slug: 'currency-exchange', name: t('category.currencyExchange'), icon: '💱', description: t('category.currencyExchangeDesc') },
    ]

    return (
        <div className="home-page">
            <AppHeader />

            {/* Hero Section */}
            <section className="hero">
                <div className="hero-bg"></div>
                <div className="hero-content">
                    <span className="hero-badge">{t('home.badge')}</span>
                    <h1 className="hero-title">
                        {t('home.title')} <span className="text-gold">{t('home.titleHighlight')}</span> {t('home.titleEnd')}
                    </h1>
                    <p className="hero-subtitle">{t('home.subtitle')}</p>
                    <div className="hero-actions">
                        <Link to="/categories" className="btn-hero-primary">
                            {t('home.exploreNow')}
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                <path d="M4 10H16M16 10L11 5M16 10L11 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </Link>
                        <Link to="/about-japan" className="btn-hero-secondary">{t('home.learnMore')}</Link>
                    </div>
                </div>

                {/* Floating Elements */}
                <div className="hero-float hero-float-1">🗻</div>
                <div className="hero-float hero-float-2">🌸</div>
                <div className="hero-float hero-float-3">⛩️</div>
            </section>

            {/* Categories Section */}
            <section className="categories-section">
                <div className="section-container">
                    <div className="section-header">
                        <span className="section-badge">{t('nav.explore')}</span>
                        <h2 className="section-title">{t('home.categoriesTitle')}</h2>
                        <p className="section-subtitle">{t('home.categoriesSubtitle')}</p>
                    </div>
                    <div className="category-grid">
                        {categories.map(category => (
                            <Link key={category.id} to={`/categories/${category.slug}`} className="category-card">
                                <div className="category-icon-wrapper">
                                    <span className="category-icon">{category.icon}</span>
                                </div>
                                <div className="category-content">
                                    <h3 className="category-name">{category.name}</h3>
                                    <p className="category-description">{category.description}</p>
                                </div>
                                <div className="category-arrow">→</div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="stats-section">
                <div className="section-container">
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-icon">📍</div>
                            <div className="stat-number">{businessCount}+</div>
                            <div className="stat-label">{t('home.statsBusinesses')}</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon">📂</div>
                            <div className="stat-number">{categoryCount}</div>
                            <div className="stat-label">{t('home.statsCategories')}</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon">🌐</div>
                            <div className="stat-number">2</div>
                            <div className="stat-label">{t('home.statsLanguages')}</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon">⭐</div>
                            <div className="stat-number">5.0</div>
                            <div className="stat-label">{t('home.statsRating')}</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features-section">
                <div className="section-container">
                    <div className="section-header">
                        <span className="section-badge">{t('home.featuredTitle')}</span>
                        <h2 className="section-title">{t('home.featuredSubtitle')}</h2>
                    </div>
                    <div className="features-grid">
                        <div className="feature-card">
                            <div className="feature-icon">🎯</div>
                            <h3 className="feature-title">{t('home.featureCurated')}</h3>
                            <p className="feature-description">{t('home.featureCuratedDesc')}</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">🌏</div>
                            <h3 className="feature-title">{t('home.featureMultilingual')}</h3>
                            <p className="feature-description">{t('home.featureMultilingualDesc')}</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">💎</div>
                            <h3 className="feature-title">{t('home.featurePremium')}</h3>
                            <p className="feature-description">{t('home.featurePremiumDesc')}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <div className="section-container">
                    <div className="cta-card">
                        <div className="cta-content">
                            <h2 className="cta-title">{t('home.ctaTitle')}</h2>
                            <p className="cta-subtitle">{t('home.ctaSubtitle')}</p>
                        </div>
                        {!isAuthenticated ? (
                            <Link to="/register" className="btn-cta">{t('home.ctaButton')}</Link>
                        ) : (
                            <Link to="/dashboard" className="btn-cta">{t('nav.dashboard')}</Link>
                        )}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="footer">
                <div className="section-container">
                    <div className="footer-grid">
                        <div className="footer-brand">
                            <div className="footer-logo">🎌 Tattant</div>
                            <p className="footer-tagline">{t('footer.tagline')}</p>
                        </div>
                        <div className="footer-links">
                            <h4>{t('footer.explore')}</h4>
                            <Link to="/categories">{t('nav.categories')}</Link>
                            <Link to="/about-japan">{t('nav.about')}</Link>
                            <Link to="/faq">{t('nav.faq')}</Link>
                        </div>
                        <div className="footer-links">
                            <h4>{t('footer.quickLinks')}</h4>
                            <Link to="/login">{t('nav.login')}</Link>
                            <Link to="/register">{t('nav.register')}</Link>
                            <Link to="/dashboard">{t('nav.dashboard')}</Link>
                        </div>
                        <div className="footer-links">
                            <h4>{t('footer.support')}</h4>
                            <Link to="/contact">{t('footer.contact')}</Link>
                            <a href="#">{t('footer.privacy')}</a>
                            <a href="#">{t('footer.terms')}</a>
                        </div>
                    </div>
                    <div className="footer-bottom">
                        <p>{t('footer.copyright')}</p>
                    </div>
                </div>
            </footer>
        </div>
    )
}
