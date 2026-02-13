/**
 * AboutJapan – Blog/articles page about Japanese culture with tabs, featured hero, modal.
 */
import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { createPortal } from 'react-dom'
import axios from 'axios'
import AppHeader from '../components/layout/AppHeader'
import './AboutJapan.css'

export default function AboutJapan() {
    const { t, i18n } = useTranslation()
    const currentLocale = i18n.language
    const [activeTab, setActiveTab] = useState('all')
    const [selectedArticle, setSelectedArticle] = useState(null)
    const [articles, setArticles] = useState([])
    const [loading, setLoading] = useState(true)

    const tabs = useMemo(() => [
        { id: 'all', label: t('aboutJapan.all'), icon: '📰' },
        { id: 'culture', label: t('aboutJapan.culture'), icon: '🎎' },
        { id: 'travel', label: t('aboutJapan.travelTips'), icon: '🧳' },
        { id: 'food', label: t('aboutJapan.foodDrink'), icon: '🍣' },
        { id: 'etiquette', label: t('aboutJapan.etiquette'), icon: '🙇' },
        { id: 'seasons', label: t('aboutJapan.seasons'), icon: '🌸' },
        { id: 'practical', label: t('aboutJapan.practical'), icon: '💡' },
    ], [t])

    const openArticle = useCallback((article) => {
        setSelectedArticle(article)
        document.body.style.overflow = 'hidden'
    }, [])

    const closeModal = useCallback(() => {
        setSelectedArticle(null)
        document.body.style.overflow = ''
    }, [])

    useEffect(() => {
        return () => { document.body.style.overflow = '' }
    }, [])

    useEffect(() => {
        const loadBlogs = async () => {
            try {
                setLoading(true)
                const response = await axios.get('http://localhost:5000/api/blogs', { params: { published: true } })
                setArticles(response.data.data.map(blog => ({
                    id: blog.id, title: blog.title, title_my: blog.title_my, emoji: blog.emoji,
                    category: blog.category, tag: blog.tag,
                    date: new Date(blog.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                    readTime: blog.read_time, excerpt: blog.excerpt, excerpt_my: blog.excerpt_my,
                    content: blog.content, content_my: blog.content_my, photo: blog.photo
                })))
            } catch (error) { console.error('Error loading blogs:', error) }
            finally { setLoading(false) }
        }
        loadBlogs()
    }, [])

    const featuredArticle = useMemo(() => {
        if (activeTab === 'all') return articles[0]
        const filtered = articles.filter(a => a.tag === activeTab)
        return filtered.length > 0 ? filtered[0] : null
    }, [activeTab, articles])

    const filteredArticles = useMemo(() => {
        const list = activeTab === 'all' ? articles : articles.filter(a => a.tag === activeTab)
        if (featuredArticle) return list.filter(a => a.id !== featuredArticle.id)
        return list
    }, [activeTab, articles, featuredArticle])

    const getLocalizedField = (article, field) => currentLocale === 'my' ? (article[`${field}_my`] || article[field]) : article[field]

    return (
        <div className="about-japan">
            <AppHeader />
            <section className="aj-hero">
                <div className="aj-hero-overlay"></div>
                <div className="aj-hero-content">
                    <span className="aj-badge">🇯🇵 {t('aboutJapan.badge')}</span>
                    <h1 className="aj-hero-title">{t('aboutJapan.title')} <span className="text-gold">{t('aboutJapan.titleHighlight')}</span> {t('aboutJapan.titleEnd')}</h1>
                    <p className="aj-hero-subtitle">{t('aboutJapan.subtitle')}</p>
                </div>
            </section>

            <section className="aj-filter-section">
                <div className="aj-container">
                    <div className="aj-tabs">
                        {tabs.map(tab => (
                            <button key={tab.id} className={`aj-tab ${activeTab === tab.id ? 'active' : ''}`} onClick={() => setActiveTab(tab.id)}>
                                <span className="aj-tab-icon">{tab.icon}</span> {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            <section className="aj-blog-section">
                <div className="aj-container">
                    {loading ? (
                        <div className="aj-loading"><div className="spinner"></div><p>{t('aboutJapan.loadingBlogs')}</p></div>
                    ) : articles.length === 0 ? (
                        <div className="aj-no-blogs"><p>{t('aboutJapan.noBlogs')}</p></div>
                    ) : (
                        <>
                            {featuredArticle && (
                                <div className="aj-featured" onClick={() => openArticle(featuredArticle)}>
                                    <div className="aj-featured-image"><span className="aj-featured-emoji">{featuredArticle.emoji}</span></div>
                                    <div className="aj-featured-content">
                                        <span className="aj-category-tag">{featuredArticle.category}</span>
                                        <h2 className="aj-featured-title">{getLocalizedField(featuredArticle, 'title')}</h2>
                                        <p className="aj-featured-excerpt">{getLocalizedField(featuredArticle, 'excerpt')}</p>
                                        <div className="aj-meta"><span>📅 {featuredArticle.date}</span><span>⏱️ {featuredArticle.readTime}</span></div>
                                    </div>
                                </div>
                            )}
                            <div className="aj-grid">
                                {filteredArticles.map(article => (
                                    <article key={article.id} className="aj-card" onClick={() => openArticle(article)}>
                                        <div className="aj-card-image"><span className="aj-card-emoji">{article.emoji}</span><span className="aj-card-tag">{article.category}</span></div>
                                        <div className="aj-card-body">
                                            <h3 className="aj-card-title">{getLocalizedField(article, 'title')}</h3>
                                            <p className="aj-card-excerpt">{getLocalizedField(article, 'excerpt')}</p>
                                            <div className="aj-card-meta"><span>{article.date}</span><span>{article.readTime}</span></div>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </section>

            {selectedArticle && createPortal(
                <div className="aj-modal-overlay" onClick={(e) => e.target === e.currentTarget && closeModal()}>
                    <div className="aj-modal">
                        <button className="aj-modal-close" onClick={closeModal}>✕</button>
                        <div className="aj-modal-hero"><span className="aj-modal-emoji">{selectedArticle.emoji}</span></div>
                        <div className="aj-modal-body">
                            <span className="aj-category-tag">{selectedArticle.category}</span>
                            <h1 className="aj-modal-title">{getLocalizedField(selectedArticle, 'title')}</h1>
                            <div className="aj-meta" style={{ marginBottom: '1.5rem' }}><span>📅 {selectedArticle.date}</span><span>⏱️ {selectedArticle.readTime}</span></div>
                            <div className="aj-modal-content" dangerouslySetInnerHTML={{ __html: getLocalizedField(selectedArticle, 'content') }}></div>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            <footer className="aj-footer">
                <div className="aj-container"><div className="aj-footer-inner"><p>{t('aboutJapan.footerText')}</p></div></div>
            </footer>
        </div>
    )
}
