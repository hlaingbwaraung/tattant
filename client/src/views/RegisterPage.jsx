/**
 * RegisterPage – Account creation form with Google OAuth.
 */
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import useAuthStore from '../store/useAuthStore'
import { useGoogleAuth } from '../hooks/useGoogleAuth'
import './RegisterPage.css'

export default function RegisterPage() {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const register = useAuthStore(s => s.register)
    const googleLogin = useAuthStore(s => s.googleLogin)

    const [form, setForm] = useState({ name: '', email: '', birthdate: '', password: '', confirmPassword: '' })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    const updateField = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))

    const handleGoogleSuccess = async (credential) => {
        setError('')
        await googleLogin(credential)
        navigate('/dashboard')
    }
    const handleGoogleError = (msg) => setError(msg)
    const { googleLoading, isGoogleAvailable, triggerGoogleSignIn } = useGoogleAuth(handleGoogleSuccess, handleGoogleError)

    const handleRegister = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        setSuccess('')

        if (form.password !== form.confirmPassword) {
            setError('Passwords do not match')
            setLoading(false)
            return
        }

        try {
            await register({ name: form.name, email: form.email, birthdate: form.birthdate, password: form.password })
            setSuccess('Account created successfully! Redirecting to dashboard...')
            setTimeout(() => navigate('/dashboard'), 1000)
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.')
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

                        <form onSubmit={handleRegister} className="auth-form">
                            <div className="form-group">
                                <label htmlFor="name" className="form-label">{t('auth.fullName')}</label>
                                <input id="name" type="text" className="form-input" placeholder={t('auth.enterFullName')} value={form.name} onChange={updateField('name')} required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="email" className="form-label">{t('auth.emailAddress')}</label>
                                <input id="email" type="email" className="form-input" placeholder={t('auth.enterEmail')} value={form.email} onChange={updateField('email')} required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="birthdate" className="form-label">{t('auth.birthdate')} <span className="optional">({t('auth.optional')})</span></label>
                                <input id="birthdate" type="date" className="form-input" value={form.birthdate} onChange={updateField('birthdate')} />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="password" className="form-label">{t('auth.password')}</label>
                                    <div className="password-wrapper">
                                        <input id="password" type={showPassword ? 'text' : 'password'} className="form-input password-input" placeholder={t('auth.minCharacters')} value={form.password} onChange={updateField('password')} required minLength={6} />
                                        <button type="button" className="password-toggle" onClick={() => setShowPassword(v => !v)} tabIndex={-1}>{showPassword ? <EyeOpen /> : <EyeClosed />}</button>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="confirmPassword" className="form-label">{t('auth.confirmPassword')}</label>
                                    <div className="password-wrapper">
                                        <input id="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} className="form-input password-input" placeholder={t('auth.confirmPasswordPlaceholder')} value={form.confirmPassword} onChange={updateField('confirmPassword')} required />
                                        <button type="button" className="password-toggle" onClick={() => setShowConfirmPassword(v => !v)} tabIndex={-1}>{showConfirmPassword ? <EyeOpen /> : <EyeClosed />}</button>
                                    </div>
                                </div>
                            </div>

                            {error && <div className="error-message"><span className="error-icon">⚠️</span> {error}</div>}
                            {success && <div className="success-message"><span className="success-icon">✓</span> {success}</div>}

                            <button type="submit" className="btn-submit" disabled={loading}>
                                {loading && <span className="loading-spinner"></span>}
                                {loading ? t('auth.creatingAccount') : t('auth.createAccount')}
                            </button>
                        </form>

                        <div className="auth-divider"><span>{t('auth.orContinueWith')}</span></div>

                        {isGoogleAvailable && (
                            <button className="btn-google" onClick={triggerGoogleSignIn} disabled={googleLoading}>
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
