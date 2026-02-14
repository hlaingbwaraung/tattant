/**
 * ForgotPasswordPage – 3-step password reset flow:
 *   1. Enter email → send OTP
 *   2. Enter 6-digit OTP code
 *   3. Set new password
 */
import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { forgotPassword, verifyOtp, resetPassword } from '../services/authService'
import './ForgotPasswordPage.css'

export default function ForgotPasswordPage() {
    const { t } = useTranslation()
    const navigate = useNavigate()

    /* ---------- State ---------- */
    const [step, setStep] = useState(1) // 1=email, 2=otp, 3=newPassword
    const [email, setEmail] = useState('')
    const [otp, setOtp] = useState(['', '', '', '', '', ''])
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [resetToken, setResetToken] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [countdown, setCountdown] = useState(0)

    const otpRefs = useRef([])

    /* ---------- Countdown for resend ---------- */
    useEffect(() => {
        if (countdown <= 0) return
        const timer = setTimeout(() => setCountdown(c => c - 1), 1000)
        return () => clearTimeout(timer)
    }, [countdown])

    /* ---------- Step 1: Send OTP ---------- */
    async function handleSendOtp(e) {
        e.preventDefault()
        setLoading(true)
        setError('')
        setSuccess('')
        try {
            await forgotPassword(email)
            setSuccess('A 6-digit code has been sent to your email.')
            setStep(2)
            setCountdown(60)
            // Focus first OTP input after render
            setTimeout(() => otpRefs.current[0]?.focus(), 100)
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send OTP. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    /* ---------- Resend OTP ---------- */
    async function handleResend() {
        if (countdown > 0) return
        setLoading(true)
        setError('')
        try {
            await forgotPassword(email)
            setSuccess('A new code has been sent to your email.')
            setCountdown(60)
            setOtp(['', '', '', '', '', ''])
            otpRefs.current[0]?.focus()
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to resend code.')
        } finally {
            setLoading(false)
        }
    }

    /* ---------- OTP input handlers ---------- */
    function handleOtpChange(index, value) {
        if (!/^\d*$/.test(value)) return
        const newOtp = [...otp]
        newOtp[index] = value.slice(-1)
        setOtp(newOtp)
        if (value && index < 5) {
            otpRefs.current[index + 1]?.focus()
        }
    }

    function handleOtpKeyDown(index, e) {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            otpRefs.current[index - 1]?.focus()
        }
    }

    function handleOtpPaste(e) {
        e.preventDefault()
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
        if (pasted.length > 0) {
            const newOtp = [...otp]
            for (let i = 0; i < 6; i++) newOtp[i] = pasted[i] || ''
            setOtp(newOtp)
            const focusIdx = Math.min(pasted.length, 5)
            otpRefs.current[focusIdx]?.focus()
        }
    }

    /* ---------- Step 2: Verify OTP ---------- */
    async function handleVerifyOtp(e) {
        e.preventDefault()
        const code = otp.join('')
        if (code.length !== 6) {
            setError('Please enter the full 6-digit code.')
            return
        }
        setLoading(true)
        setError('')
        setSuccess('')
        try {
            const res = await verifyOtp(email, code)
            setResetToken(res.data.resetToken)
            setSuccess('Code verified! Now set your new password.')
            setStep(3)
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid or expired code.')
        } finally {
            setLoading(false)
        }
    }

    /* ---------- Step 3: Reset Password ---------- */
    async function handleResetPassword(e) {
        e.preventDefault()
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match.')
            return
        }
        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters.')
            return
        }
        setLoading(true)
        setError('')
        setSuccess('')
        try {
            await resetPassword(resetToken, newPassword)
            setSuccess('Password reset successfully!')
            setTimeout(() => navigate('/login'), 2000)
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reset password.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="auth-page forgot-luxury">
            <div className="auth-container">
                {/* Left Side - Branding */}
                <div className="auth-branding">
                    <Link to="/" className="brand-logo">🎌 Tattant</Link>
                    <h1 className="brand-title">Reset Your Password</h1>
                    <p className="brand-subtitle">We'll send a verification code to your email to help you regain access.</p>
                    <div className="brand-features">
                        <div className="brand-feature"><span className="feature-icon">🔒</span><span>Secure OTP verification</span></div>
                        <div className="brand-feature"><span className="feature-icon">⚡</span><span>Quick 3-step process</span></div>
                        <div className="brand-feature"><span className="feature-icon">✉️</span><span>Code sent to your email</span></div>
                    </div>
                </div>

                {/* Right Side - Form */}
                <div className="auth-form-container">
                    <div className="auth-card">
                        {/* Progress Steps */}
                        <div className="fp-steps">
                            <div className={`fp-step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
                                <div className="fp-step-number">{step > 1 ? '✓' : '1'}</div>
                                <span className="fp-step-label">Email</span>
                            </div>
                            <div className="fp-step-line" />
                            <div className={`fp-step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
                                <div className="fp-step-number">{step > 2 ? '✓' : '2'}</div>
                                <span className="fp-step-label">Verify</span>
                            </div>
                            <div className="fp-step-line" />
                            <div className={`fp-step ${step >= 3 ? 'active' : ''}`}>
                                <div className="fp-step-number">3</div>
                                <span className="fp-step-label">Reset</span>
                            </div>
                        </div>

                        {/* Error / Success */}
                        {error && (
                            <div className="error-message"><span className="error-icon">⚠️</span> {error}</div>
                        )}
                        {success && (
                            <div className="success-message"><span className="success-icon">✅</span> {success}</div>
                        )}

                        {/* Step 1: Email */}
                        {step === 1 && (
                            <form onSubmit={handleSendOtp} className="auth-form">
                                <div className="auth-header">
                                    <h2 className="auth-title">Forgot Password?</h2>
                                    <p className="auth-subtitle">Enter your email address and we'll send you a verification code.</p>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="fp-email" className="form-label">Email Address</label>
                                    <input id="fp-email" type="email" className="form-input" placeholder="Enter your email" value={email} onChange={e => setEmail(e.target.value)} required autoFocus />
                                </div>
                                <button type="submit" className="btn-submit" disabled={loading}>
                                    {loading && <span className="loading-spinner" />}
                                    {loading ? 'Sending...' : 'Send Verification Code'}
                                </button>
                            </form>
                        )}

                        {/* Step 2: OTP */}
                        {step === 2 && (
                            <form onSubmit={handleVerifyOtp} className="auth-form">
                                <div className="auth-header">
                                    <h2 className="auth-title">Enter Verification Code</h2>
                                    <p className="auth-subtitle">We sent a 6-digit code to <strong>{email}</strong></p>
                                </div>
                                <div className="otp-container" onPaste={handleOtpPaste}>
                                    {otp.map((digit, idx) => (
                                        <input key={idx} ref={el => otpRefs.current[idx] = el} type="text" inputMode="numeric" maxLength={1} className={`otp-input ${digit ? 'filled' : ''}`} value={digit} onChange={e => handleOtpChange(idx, e.target.value)} onKeyDown={e => handleOtpKeyDown(idx, e)} autoFocus={idx === 0} />
                                    ))}
                                </div>
                                <button type="submit" className="btn-submit" disabled={loading || otp.join('').length !== 6}>
                                    {loading && <span className="loading-spinner" />}
                                    {loading ? 'Verifying...' : 'Verify Code'}
                                </button>
                                <div className="resend-row">
                                    <span className="resend-text">Didn't receive the code?</span>
                                    <button type="button" className="resend-btn" disabled={countdown > 0 || loading} onClick={handleResend}>
                                        {countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* Step 3: New Password */}
                        {step === 3 && (
                            <form onSubmit={handleResetPassword} className="auth-form">
                                <div className="auth-header">
                                    <h2 className="auth-title">Set New Password</h2>
                                    <p className="auth-subtitle">Choose a strong password with at least 6 characters.</p>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="fp-password" className="form-label">New Password</label>
                                    <div className="password-wrapper">
                                        <input id="fp-password" type={showPassword ? 'text' : 'password'} className="form-input password-input" placeholder="Enter new password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={6} autoFocus />
                                        <button type="button" className="password-toggle" onClick={() => setShowPassword(v => !v)} tabIndex={-1}>
                                            {showPassword ? (
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                                            ) : (
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                                            )}
                                        </button>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="fp-confirm" className="form-label">Confirm Password</label>
                                    <input id="fp-confirm" type={showPassword ? 'text' : 'password'} className="form-input" placeholder="Confirm new password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required minLength={6} />
                                </div>
                                {newPassword && confirmPassword && newPassword !== confirmPassword && (
                                    <div className="password-mismatch">Passwords do not match</div>
                                )}
                                <button type="submit" className="btn-submit" disabled={loading || !newPassword || !confirmPassword || newPassword !== confirmPassword}>
                                    {loading && <span className="loading-spinner" />}
                                    {loading ? 'Resetting...' : 'Reset Password'}
                                </button>
                            </form>
                        )}

                        <div className="auth-footer">
                            <p>Remember your password? <Link to="/login" className="auth-link">Sign in</Link></p>
                            <Link to="/" className="back-link">← Back to Home</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
