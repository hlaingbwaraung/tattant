/**
 * LoginPage – Email + password login with Google OAuth option.
 */
import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import useAuthStore from '../store/useAuthStore'
import { useGoogleAuth } from '../hooks/useGoogleAuth'
import './LoginPage.css'

export default function LoginPage() {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const login = useAuthStore(s => s.login)
    const googleLogin = useAuthStore(s => s.googleLogin)

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [fieldErrors, setFieldErrors] = useState({ email: false, password: false })
    const [shake, setShake] = useState(false)

    const handleGoogleSuccess = async (credential) => {
        setError('')
        await googleLogin(credential)
        navigate(searchParams.get('redirect') || '/dashboard')
    }

    const handleGoogleError = (msg) => setError(msg)

    const googleBtnRef = useRef(null)
    const { googleLoading, isGoogleAvailable, isGoogleLoaded, setupGoogleButton } = useGoogleAuth(
        handleGoogleSuccess,
        handleGoogleError
    )

    // Render the real Google SDK button into the overlay div once the SDK loads.
    // The overlay sits transparently on top of our styled button so the user's
    // click goes directly to Google's iframe — no programmatic clicking needed.
    useEffect(() => {
        if (isGoogleLoaded && googleBtnRef.current) {
            setupGoogleButton(googleBtnRef.current)
        }
    }, [isGoogleLoaded, setupGoogleButton])

    const handleLogin = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            await login({ email, password })
            navigate(searchParams.get('redirect') || '/dashboard')
        } catch (err) {
            const msg = err.response?.data?.message || 'Login failed. Please try again.'
            setError(msg)
            // Highlight specific fields based on error
            const lmsg = msg.toLowerCase()
            if (lmsg.includes('email') || lmsg.includes('not found') || lmsg.includes('invalid email')) {
                setFieldErrors({ email: true, password: false })
            } else if (lmsg.includes('password') || lmsg.includes('invalid email or password')) {
                setFieldErrors({ email: false, password: true })
            } else {
                setFieldErrors({ email: true, password: true })
            }
            setShake(true)
            setTimeout(() => setShake(false), 600)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-container">
                {/* Left Side - Branding */}
                <div className="auth-branding">
                    <Link to="/" className="brand-logo">🎌 Tattant</Link>
                    <h1 className="brand-title">{t('auth.welcomeBack')}</h1>
                    <p className="brand-subtitle">{t('auth.signInSubtitle')}</p>
                    <div className="brand-features">
                        <div className="brand-feature">
                            <span className="feature-icon">✓</span>
                            <span>{t('auth.accessGuides')}</span>
                        </div>
                        <div className="brand-feature">
                            <span className="feature-icon">✓</span>
                            <span>{t('auth.saveOrganize')}</span>
                        </div>
                        <div className="brand-feature">
                            <span className="feature-icon">✓</span>
                            <span>{t('auth.getRecommendations')}</span>
                        </div>
                    </div>
                </div>

                {/* Right Side - Form */}
                <div className="auth-form-container">
                    <div className="auth-card">
                        <div className="auth-header">
                            <h2 className="auth-title">{t('auth.signIn')}</h2>
                            <p className="auth-subtitle">{t('auth.enterCredentials')}</p>
                        </div>

                        <form onSubmit={handleLogin} className="auth-form">
                            <div className="form-group">
                                <label htmlFor="email" className="form-label">{t('auth.emailAddress')}</label>
                                <input id="email" type="email" className={`form-input ${fieldErrors.email ? 'input-error' : ''}`} placeholder={t('auth.enterEmail')} value={email} onChange={e => { setEmail(e.target.value); setFieldErrors(f => ({ ...f, email: false })); setError('') }} required />
                                {fieldErrors.email && <span className="field-error-hint">⚠ Check your email address</span>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="password" className="form-label">{t('auth.password')}</label>
                                <div className="password-wrapper">
                                    <input id="password" type={showPassword ? 'text' : 'password'} className={`form-input password-input ${fieldErrors.password ? 'input-error' : ''}`} placeholder={t('auth.enterPassword')} value={password} onChange={e => { setPassword(e.target.value); setFieldErrors(f => ({ ...f, password: false })); setError('') }} required />
                                    <button type="button" className="password-toggle" onClick={() => setShowPassword(v => !v)} tabIndex={-1}>
                                        {showPassword ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                                        )}
                                    </button>
                                </div>
                                {fieldErrors.password && <span className="field-error-hint">⚠ Check your password</span>}
                            </div>

                            <div className="forgot-link-row">
                                <Link to="/forgot-password" className="forgot-link">Forgot password?</Link>
                            </div>

                            {error && (
                                <div className={`error-message ${shake ? 'shake' : ''}`}>
                                    <span className="error-icon">🚫</span>
                                    <div className="error-body">
                                        <strong className="error-title">Login Failed</strong>
                                        <span className="error-detail">{error}</span>
                                        {(error.toLowerCase().includes('password') || error.toLowerCase().includes('invalid')) && (
                                            <Link to="/forgot-password" className="error-action-link">Forgot your password?</Link>
                                        )}
                                        {error.toLowerCase().includes('google') && (
                                            <span className="error-action-link" style={{cursor:'default'}}>Please use the Google button below ↓</span>
                                        )}
                                    </div>
                                </div>
                            )}

                            <button type="submit" className="btn-submit" disabled={loading}>
                                {loading && <span className="loading-spinner"></span>}
                                {loading ? t('auth.signingIn') : t('auth.signIn')}
                            </button>
                        </form>

                        <div className="auth-divider"><span>{t('auth.orContinueWith')}</span></div>

                        {isGoogleAvailable && (
                            /* Transparent overlay pattern:
                               Our styled button is pointer-events:none (visual only).
                               Google's real SDK button renders into the overlay div
                               (opacity:0, position:absolute) on top, so the user's
                               click goes directly to Google's iframe — works on production. */
                            <div style={{ position: 'relative', overflow: 'hidden' }}>
                                <button className="btn-google" tabIndex={-1} style={{ pointerEvents: 'none' }} disabled={googleLoading}>
                                    {googleLoading ? (
                                        <span className="loading-spinner google-spinner"></span>
                                    ) : (
                                        <svg viewBox="0 0 24 24" width="20" height="20">
                                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                        </svg>
                                    )}
                                    {googleLoading ? t('auth.signingIn') : t('auth.continueWithGoogle')}
                                </button>
                                <div ref={googleBtnRef} style={{ position: 'absolute', inset: 0, opacity: 0 }} />
                            </div>
                        )}

                        <div className="auth-footer">
                            <p>{t('auth.noAccount')} <Link to="/register" className="auth-link">{t('auth.createOne')}</Link></p>
                            <Link to="/" className="back-link">{t('auth.backToHome')}</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
