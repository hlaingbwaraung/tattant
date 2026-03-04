/**
 * AppHeader – Global navigation bar shared by all pages.
 *   - Logo + main nav links (Home, SHOPS, About, Learn Japanese, Points Shop)
 *   - Language toggle (EN / MY)
 *   - Dark / light theme toggle
 *   - Auth area: login/register buttons or user dropdown menu
 *   - Mobile hamburger menu with overlay
 */

import React, { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import useAuthStore from '../../store/useAuthStore'
import useThemeStore from '../../store/useThemeStore'
import './AppHeader.css'

export default function AppHeader() {
    const { t, i18n } = useTranslation()
    const location = useLocation()
    const navigate = useNavigate()
    const user = useAuthStore(s => s.user)
    const token = useAuthStore(s => s.token)
    const logout = useAuthStore(s => s.logout)
    const isAuthenticated = !!token
    const isDarkMode = useThemeStore(s => s.isDarkMode)
    const toggleTheme = useThemeStore(s => s.toggleTheme)

    const [showUserMenu, setShowUserMenu] = useState(false)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const userMenuRef = useRef(null)

    const currentLang = i18n.language

    /* ---------- Language ---------- */
    const toggleLanguage = () => {
        const newLang = currentLang === 'en' ? 'my' : 'en'
        i18n.changeLanguage(newLang)
        localStorage.setItem('locale', newLang)
    }

    /* ---------- Desktop User Menu ---------- */
    const toggleUserMenu = () => setShowUserMenu(v => !v)
    const closeMenu = () => setShowUserMenu(false)

    /* ---------- Mobile Menu ---------- */
    const toggleMobile = () => {
        setMobileMenuOpen(v => {
            document.body.style.overflow = !v ? 'hidden' : ''
            return !v
        })
    }

    const closeMobile = () => {
        setMobileMenuOpen(false)
        document.body.style.overflow = ''
    }

    /* ---------- Auth ---------- */
    const handleLogout = () => {
        logout()
        setShowUserMenu(false)
        closeMobile()
        navigate('/')
    }

    /* ---------- Click-outside (close dropdown) ---------- */
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setShowUserMenu(false)
            }
        }
        document.addEventListener('click', handleClickOutside)
        return () => {
            document.removeEventListener('click', handleClickOutside)
            document.body.style.overflow = ''
        }
    }, [])

    const isActive = (path) => location.pathname === path

    return (
        <header className="header">
            <div className="header-container">
                <Link to="/" className="logo">
                    <span className="logo-icon">🎌</span>
                    <span className="logo-text">Tattant</span>
                </Link>

                <nav className={`nav ${mobileMenuOpen ? 'open' : ''}`}>
                    {/* Desktop nav links (no icons) */}
                    <Link to="/" className={`nav-link desktop-nav ${isActive('/') ? 'active' : ''}`} onClick={closeMobile}>{t('nav.home')}</Link>
                    <Link to="/explore" className={`nav-link desktop-nav ${isActive('/explore') ? 'active' : ''}`} onClick={closeMobile}>{t('nav.explore')}</Link>

                    {/* Jobs dropdown (desktop) */}
                    <div className="nav-dropdown desktop-nav">
                        <button className={`nav-link nav-dropdown-trigger ${location.pathname.startsWith('/categories/jobs') ? 'active' : ''}`}>
                            {t('category.jobs')} <span className="nav-dropdown-arrow">▾</span>
                        </button>
                        <div className="nav-dropdown-menu">
                            <Link to="/categories/jobs-fulltime" className="nav-dropdown-item" onClick={closeMobile}>
                                <span className="nav-dropdown-icon">💼</span>
                                <div>
                                    <div className="nav-dropdown-label">{t('category.jobsFulltime')}</div>
                                    <div className="nav-dropdown-desc">{t('category.jobsFulltimeDesc')}</div>
                                </div>
                            </Link>
                            <Link to="/categories/jobs-parttime" className="nav-dropdown-item" onClick={closeMobile}>
                                <span className="nav-dropdown-icon">🕐</span>
                                <div>
                                    <div className="nav-dropdown-label">{t('category.jobsParttime')}</div>
                                    <div className="nav-dropdown-desc">{t('category.jobsParttimeDesc')}</div>
                                </div>
                            </Link>
                        </div>
                    </div>

                    <Link to="/about-japan" className={`nav-link desktop-nav ${isActive('/about-japan') ? 'active' : ''}`} onClick={closeMobile}>{t('nav.about')}</Link>

                    {/* Mobile drawer content */}
                    {mobileMenuOpen && (
                        <div className="mobile-drawer-content">
                            {/* Drawer header */}
                            <div className="mobile-drawer-header">
                                <span className="mobile-drawer-logo">🎌 Tattant</span>
                                {isAuthenticated && (
                                    <div className="mobile-user-info">
                                        <span className="mobile-user-avatar">{user?.name?.charAt(0).toUpperCase() || 'U'}</span>
                                        <div className="mobile-user-details">
                                            <span className="mobile-user-name">{user?.name || 'User'}</span>
                                            <span className="mobile-user-email">{user?.email}</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Navigation */}
                            <div className="mobile-nav-section">
                                <Link to="/" className={`mobile-nav-item ${isActive('/') ? 'active' : ''}`} onClick={closeMobile}>
                                    <span className="mobile-nav-icon">🏠</span> {t('nav.home')}
                                </Link>
                                <Link to="/explore" className={`mobile-nav-item ${isActive('/explore') ? 'active' : ''}`} onClick={closeMobile}>
                                    <span className="mobile-nav-icon">🔍</span> {t('nav.explore')}
                                </Link>

                                {/* Jobs sub-section (mobile) */}
                                <div className="mobile-nav-group">
                                    <div className="mobile-nav-group-label"><span className="mobile-nav-icon">💼</span> {t('category.jobs')}</div>
                                    <Link to="/categories/jobs-fulltime" className={`mobile-nav-item mobile-nav-sub ${isActive('/categories/jobs-fulltime') ? 'active' : ''}`} onClick={closeMobile}>
                                        <span className="mobile-nav-icon">💼</span> {t('category.jobsFulltime')}
                                    </Link>
                                    <Link to="/categories/jobs-parttime" className={`mobile-nav-item mobile-nav-sub ${isActive('/categories/jobs-parttime') ? 'active' : ''}`} onClick={closeMobile}>
                                        <span className="mobile-nav-icon">🕐</span> {t('category.jobsParttime')}
                                    </Link>
                                </div>

                                <Link to="/about-japan" className={`mobile-nav-item ${isActive('/about-japan') ? 'active' : ''}`} onClick={closeMobile}>
                                    <span className="mobile-nav-icon">🗾</span> {t('nav.about')}
                                </Link>
                            </div>

                            {/* Auth section */}
                            <div className="mobile-auth-section">
                                {!isAuthenticated ? (
                                    <>
                                        <Link to="/login" className="mobile-auth-btn mobile-login-btn" onClick={closeMobile}>
                                            <span className="mobile-nav-icon">👤</span> {t('nav.login')}
                                        </Link>
                                        <Link to="/register" className="mobile-auth-btn mobile-register-btn" onClick={closeMobile}>
                                            {t('nav.getStarted')}
                                        </Link>
                                    </>
                                ) : (
                                    <>
                                        {user?.is_admin && (
                                            <Link to="/admin" className="mobile-nav-item admin-item" onClick={closeMobile}>
                                                <span className="mobile-nav-icon">⚙️</span> {t('nav.adminDashboard')}
                                            </Link>
                                        )}
                                        {user?.is_shop_owner && (
                                            <Link to="/shop-owner" className="mobile-nav-item shop-item" onClick={closeMobile}>
                                                <span className="mobile-nav-icon">🏪</span> Shop Dashboard
                                            </Link>
                                        )}
                                        {user?.is_shop_owner && (
                                            <Link to="/bookings" className="mobile-nav-item" onClick={closeMobile}>
                                                <span className="mobile-nav-icon">📅</span> Bookings
                                            </Link>
                                        )}
                                        <Link to="/dashboard" className="mobile-nav-item" onClick={closeMobile}>
                                            <span className="mobile-nav-icon">📊</span> {t('nav.dashboard')}
                                        </Link>
                                        <Link to="/favorites" className="mobile-nav-item" onClick={closeMobile}>
                                            <span className="mobile-nav-icon">❤️</span> {t('nav.favorites')}
                                        </Link>
                                        <Link to="/profile/settings" className="mobile-nav-item" onClick={closeMobile}>
                                            <span className="mobile-nav-icon">⚙️</span> {t('nav.settings')}
                                        </Link>
                                        <button onClick={handleLogout} className="mobile-nav-item mobile-logout-btn">
                                            <span className="mobile-nav-icon">🚪</span> {t('nav.signOut')}
                                        </button>
                                    </>
                                )}
                            </div>

                            {/* Settings row */}
                            <div className="mobile-settings-row">
                                <button onClick={toggleLanguage} className="mobile-setting-btn">
                                    <span>🌐</span> {currentLang === 'en' ? 'English' : 'Myanmar'}
                                </button>
                                <button onClick={toggleTheme} className="mobile-setting-btn">
                                    {isDarkMode ? '☀️' : '🌙'} {isDarkMode ? 'Light' : 'Dark'}
                                </button>
                            </div>
                        </div>
                    )}
                </nav>

                <div className="header-actions">
                    <button onClick={toggleLanguage} className="lang-toggle" title={currentLang === 'en' ? 'Switch to Myanmar' : 'Switch to English'}>
                        <svg className="lang-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="2" y1="12" x2="22" y2="12" />
                            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                        </svg>
                        <span className="lang-label">{currentLang === 'en' ? 'EN' : 'MY'}</span>
                    </button>

                    <button onClick={toggleTheme} className="theme-toggle" title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
                        {isDarkMode ? (
                            <svg className="theme-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="5" />
                                <line x1="12" y1="1" x2="12" y2="3" />
                                <line x1="12" y1="21" x2="12" y2="23" />
                                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                                <line x1="1" y1="12" x2="3" y2="12" />
                                <line x1="21" y1="12" x2="23" y2="12" />
                                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                            </svg>
                        ) : (
                            <svg className="theme-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                            </svg>
                        )}
                    </button>

                    {!isAuthenticated ? (
                        <>
                            <Link to="/login" className="nav-link login-link desktop-only">{t('nav.login')}</Link>
                            <Link to="/register" className="btn-signup desktop-only">{t('nav.getStarted')}</Link>
                        </>
                    ) : (
                        <div className="user-menu desktop-only" ref={userMenuRef}>
                            <button onClick={toggleUserMenu} className="user-button">
                                <span className="user-avatar">{user?.name?.charAt(0).toUpperCase() || 'U'}</span>
                                <span className="user-name">{user?.name || 'User'}</span>
                                <svg className={`dropdown-arrow ${showUserMenu ? 'rotate' : ''}`} width="12" height="12" viewBox="0 0 12 12" fill="none">
                                    <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>
                            {showUserMenu && (
                                <div className="user-dropdown">
                                    <div className="dropdown-header">
                                        <span className="dropdown-user-name">{user?.name}</span>
                                        <span className="dropdown-user-email">{user?.email}</span>
                                    </div>
                                    <div className="dropdown-divider"></div>
                                    {user?.is_admin && (
                                        <Link to="/admin" className="dropdown-item admin" onClick={closeMenu}>
                                            <span className="dropdown-icon">⚙</span> {t('nav.adminDashboard')}
                                        </Link>
                                    )}
                                    {user?.is_shop_owner && (
                                        <Link to="/shop-owner" className="dropdown-item shop-owner" onClick={closeMenu}>
                                            <span className="dropdown-icon">🏪</span> Shop Dashboard
                                        </Link>
                                    )}
                                    {user?.is_shop_owner && (
                                        <Link to="/bookings" className="dropdown-item" onClick={closeMenu}>
                                            <span className="dropdown-icon">📅</span> Bookings
                                        </Link>
                                    )}
                                    <Link to="/dashboard" className="dropdown-item" onClick={closeMenu}>
                                        <span className="dropdown-icon">📊</span> {t('nav.dashboard')}
                                    </Link>
                                    <Link to="/favorites" className="dropdown-item" onClick={closeMenu}>
                                        <span className="dropdown-icon">❤</span> {t('nav.favorites')}
                                    </Link>
                                    <Link to="/profile/settings" className="dropdown-item" onClick={closeMenu}>
                                        <span className="dropdown-icon">⚙</span> {t('nav.settings')}
                                    </Link>
                                    <div className="dropdown-divider"></div>
                                    <button onClick={handleLogout} className="dropdown-item logout">
                                        <span className="dropdown-icon">➜</span> {t('nav.signOut')}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    <button className={`hamburger ${mobileMenuOpen ? 'open' : ''}`} onClick={toggleMobile}>
                        <span></span>
                        <span></span>
                        <span></span>
                    </button>
                </div>
            </div>
            <div className={`mobile-overlay ${mobileMenuOpen ? 'show' : ''}`} onClick={closeMobile}></div>
        </header>
    )
}
