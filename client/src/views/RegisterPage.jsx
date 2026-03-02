/**
 * RegisterPage – Account creation form with Google OAuth + Shop Owner registration.
 */
import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import useAuthStore from '../store/useAuthStore'
import { useGoogleAuth } from '../hooks/useGoogleAuth'
import { submitShopOwnerRequest } from '../services/shopOwnerRequestService'
import './RegisterPage.css'

export default function RegisterPage() {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const register = useAuthStore(s => s.register)
    const googleLogin = useAuthStore(s => s.googleLogin)

    const [isShopOwner, setIsShopOwner] = useState(false)
    const [form, setForm] = useState({ name: '', email: '', birthdate: '', password: '', confirmPassword: '' })
    const [shopForm, setShopForm] = useState({ shop_name: '', shop_description: '', shop_phone: '', shop_address: '', shop_category: '', message: '' })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [fieldErrors, setFieldErrors] = useState({})
    const [shake, setShake] = useState(false)

    const triggerError = (msg, fields = {}) => {
        setError(msg)
        setFieldErrors(fields)
        setShake(true)
        setTimeout(() => setShake(false), 600)
    }

    const updateField = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))
    const updateShopField = (field) => (e) => setShopForm(f => ({ ...f, [field]: e.target.value }))

    const handleGoogleSuccess = async (credential) => {
        setError('')
        await googleLogin(credential)
        navigate('/dashboard')
    }
    const handleGoogleError = (msg) => setError(msg)
    const googleBtnRef = useRef(null)
    const { googleLoading, isGoogleAvailable, isGoogleLoaded, setupGoogleButton } = useGoogleAuth(handleGoogleSuccess, handleGoogleError)

    useEffect(() => {
        if (isGoogleLoaded && googleBtnRef.current) {
            setupGoogleButton(googleBtnRef.current)
        }
    }, [isGoogleLoaded, setupGoogleButton])

    const handleRegister = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        setSuccess('')

        if (form.password.length < 6) {
            triggerError('Password must be at least 6 characters.', { password: true })
            setLoading(false)
            return
        }

        if (form.password !== form.confirmPassword) {
            triggerError('Passwords do not match. Please re-enter your password.', { password: true, confirmPassword: true })
            setLoading(false)
            return
        }

        if (isShopOwner && !shopForm.shop_name.trim()) {
            triggerError('Shop name is required for shop owner registration.', { shop_name: true })
            setLoading(false)
            return
        }

        try {
            // 1. Register the user account
            await register({ name: form.name, email: form.email, birthdate: form.birthdate, password: form.password })

            // 2. If shop owner, submit the request
            if (isShopOwner) {
                try {
                    await submitShopOwnerRequest(shopForm)
                    setSuccess('Account created! Your shop owner request has been submitted for admin review. You will be notified once approved.')
                    setTimeout(() => navigate('/dashboard'), 2500)
                } catch (err) {
                    // Account was created but request failed
                    setSuccess('Account created! However, shop owner request failed. You can resubmit from your dashboard.')
                    setTimeout(() => navigate('/dashboard'), 2500)
                }
            } else {
                setSuccess('Account created successfully! Redirecting to dashboard...')
                setTimeout(() => navigate('/dashboard'), 1000)
            }
        } catch (err) {
            const msg = err.response?.data?.message || 'Registration failed. Please try again.'
            const lmsg = msg.toLowerCase()
            const fields = {}
            if (lmsg.includes('email') || lmsg.includes('already exists')) fields.email = true
            if (lmsg.includes('password')) { fields.password = true; fields.confirmPassword = true }
            if (lmsg.includes('name')) fields.name = true
            triggerError(msg, fields)
        } finally {
            setLoading(false)
        }
    }

    const EyeOpen = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
    const EyeClosed = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-branding">
                    <Link to="/" className="brand-logo">🎌 Tattant</Link>
                    <h1 className="brand-title">{t('auth.joinTitle')}</h1>
                    <p className="brand-subtitle">{t('auth.joinSubtitle')}</p>
                    <div className="brand-features">
                        {['accessGuides', 'saveOrganize', 'getRecommendations', 'connectTravelers'].map(k => (
                            <div key={k} className="brand-feature"><span className="feature-icon">✓</span><span>{t(`auth.${k}`)}</span></div>
                        ))}
                    </div>
                </div>

                <div className="auth-form-container">
                    <div className="auth-card">
                        <div className="auth-header">
                            <h2 className="auth-title">{t('auth.createAccount')}</h2>
                            <p className="auth-subtitle">{t('auth.fillDetails')}</p>
                        </div>

                        {/* Account Type Toggle */}
                        <div className="account-type-toggle">
                            <button type="button" className={`type-btn ${!isShopOwner ? 'active' : ''}`} onClick={() => setIsShopOwner(false)}>
                                <span className="type-icon">👤</span> Regular User
                            </button>
                            <button type="button" className={`type-btn ${isShopOwner ? 'active' : ''}`} onClick={() => setIsShopOwner(true)}>
                                <span className="type-icon">🏪</span> Shop Owner
                            </button>
                        </div>

                        {isShopOwner && (
                            <div className="shop-owner-notice">
                                <span className="notice-icon">ℹ️</span>
                                <p>Shop owner accounts require admin approval. After registering, your request will be reviewed and you'll be notified once approved.</p>
                            </div>
                        )}

                        <form onSubmit={handleRegister} className="auth-form">
                            <div className="form-group">
                                <label htmlFor="name" className="form-label">{t('auth.fullName')}</label>
                                <input id="name" type="text" className={`form-input ${fieldErrors.name ? 'input-error' : ''}`} placeholder={t('auth.enterFullName')} value={form.name} onChange={e => { updateField('name')(e); setFieldErrors(f => ({ ...f, name: false })) }} required />
                                {fieldErrors.name && <span className="field-error-hint">⚠ Enter your full name</span>}
                            </div>
                            <div className="form-group">
                                <label htmlFor="email" className="form-label">{t('auth.emailAddress')}</label>
                                <input id="email" type="email" className={`form-input ${fieldErrors.email ? 'input-error' : ''}`} placeholder={t('auth.enterEmail')} value={form.email} onChange={e => { updateField('email')(e); setFieldErrors(f => ({ ...f, email: false })); setError('') }} required />
                                {fieldErrors.email && <span className="field-error-hint">⚠ This email is already registered or invalid</span>}
                            </div>
                            <div className="form-group">
                                <label htmlFor="birthdate" className="form-label">{t('auth.birthdate')} <span className="optional">({t('auth.optional')})</span></label>
                                <input id="birthdate" type="date" className="form-input" value={form.birthdate} onChange={updateField('birthdate')} />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="password" className="form-label">{t('auth.password')}</label>
                                    <div className="password-wrapper">
                                        <input id="password" type={showPassword ? 'text' : 'password'} className={`form-input password-input ${fieldErrors.password ? 'input-error' : ''}`} placeholder={t('auth.minCharacters')} value={form.password} onChange={e => { updateField('password')(e); setFieldErrors(f => ({ ...f, password: false })) }} required minLength={6} />
                                        <button type="button" className="password-toggle" onClick={() => setShowPassword(v => !v)} tabIndex={-1}>{showPassword ? <EyeOpen /> : <EyeClosed />}</button>
                                    </div>
                                    {fieldErrors.password && <span className="field-error-hint">⚠ Check your password</span>}
                                </div>
                                <div className="form-group">
                                    <label htmlFor="confirmPassword" className="form-label">{t('auth.confirmPassword')}</label>
                                    <div className="password-wrapper">
                                        <input id="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} className={`form-input password-input ${fieldErrors.confirmPassword ? 'input-error' : ''}`} placeholder={t('auth.confirmPasswordPlaceholder')} value={form.confirmPassword} onChange={e => { updateField('confirmPassword')(e); setFieldErrors(f => ({ ...f, confirmPassword: false })) }} required />
                                        <button type="button" className="password-toggle" onClick={() => setShowConfirmPassword(v => !v)} tabIndex={-1}>{showConfirmPassword ? <EyeOpen /> : <EyeClosed />}</button>
                                    </div>
                                    {fieldErrors.confirmPassword && <span className="field-error-hint">⚠ Passwords do not match</span>}
                                </div>
                            </div>

                            {/* Shop Owner Fields */}
                            {isShopOwner && (
                                <div className="shop-owner-fields">
                                    <div className="section-divider"><span>🏪 Shop Information</span></div>
                                    <div className="form-group">
                                        <label htmlFor="shop_name" className="form-label">Shop Name *</label>
                                        <input id="shop_name" type="text" className={`form-input ${fieldErrors.shop_name ? 'input-error' : ''}`} placeholder="Enter your shop name" value={shopForm.shop_name} onChange={e => { updateShopField('shop_name')(e); setFieldErrors(f => ({ ...f, shop_name: false })) }} required />
                                        {fieldErrors.shop_name && <span className="field-error-hint">⚠ Shop name is required</span>}
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="shop_category" className="form-label">Shop Category</label>
                                        <select id="shop_category" className="form-input" value={shopForm.shop_category} onChange={updateShopField('shop_category')}>
                                            <option value="">Select category</option>
                                            <option value="restaurant">🍽️ Restaurant</option>
                                            <option value="store">🏬 Store</option>
                                            <option value="real-estate">🏠 Real Estate</option>
                                            <option value="travel">✈️ Travel</option>
                                            <option value="service">🔧 Service</option>
                                            <option value="other">📦 Other</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="shop_description" className="form-label">Shop Description</label>
                                        <textarea id="shop_description" className="form-input" placeholder="Tell us about your business" value={shopForm.shop_description} onChange={updateShopField('shop_description')} rows="3" />
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label htmlFor="shop_phone" className="form-label">Shop Phone</label>
                                            <input id="shop_phone" type="tel" className="form-input" placeholder="Phone number" value={shopForm.shop_phone} onChange={updateShopField('shop_phone')} />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="shop_address" className="form-label">Shop Address</label>
                                            <input id="shop_address" type="text" className="form-input" placeholder="Shop address" value={shopForm.shop_address} onChange={updateShopField('shop_address')} />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="message" className="form-label">Message to Admin <span className="optional">(optional)</span></label>
                                        <textarea id="message" className="form-input" placeholder="Any additional information for the admin..." value={shopForm.message} onChange={updateShopField('message')} rows="2" />
                                    </div>
                                </div>
                            )}

                            {error && (
                                <div className={`error-message ${shake ? 'shake' : ''}`}>
                                    <span className="error-icon">🚫</span>
                                    <div className="error-body">
                                        <strong className="error-title">Registration Failed</strong>
                                        <span className="error-detail">{error}</span>
                                    </div>
                                </div>
                            )}
                            {success && <div className="success-message"><span className="success-icon">✓</span> {success}</div>}

                            <button type="submit" className="btn-submit" disabled={loading}>
                                {loading && <span className="loading-spinner"></span>}
                                {loading ? t('auth.creatingAccount') : isShopOwner ? '🏪 Register as Shop Owner' : t('auth.createAccount')}
                            </button>
                        </form>

                        {!isShopOwner && (
                            <>
                                <div className="auth-divider"><span>{t('auth.orContinueWith')}</span></div>

                                {isGoogleAvailable && (
                                    <div style={{ position: 'relative', overflow: 'hidden' }}>
                                        <button className="btn-google" tabIndex={-1} style={{ pointerEvents: 'none' }} disabled={googleLoading}>
                                            {googleLoading ? <span className="loading-spinner google-spinner"></span> : (
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
                            </>
                        )}

                        <div className="auth-footer">
                            <p>{t('auth.haveAccount')} <Link to="/login" className="auth-link">{t('auth.signInHere')}</Link></p>
                            <Link to="/" className="back-link">{t('auth.backToHome')}</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
