/**
 * PremiumPage – Displays pricing plans with simulated payment flow.
 */
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import AppHeader from '../components/layout/AppHeader'
import useAuthStore from '../store/useAuthStore'
import api from '../services/api'
import './PremiumPage.css'

export default function PremiumPage() {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const { user, setUser, token } = useAuthStore()
    const isAuthenticated = !!token

    const [selectedPlan, setSelectedPlan] = useState(null)
    const [purchasing, setPurchasing] = useState(false)
    const [showPaymentModal, setShowPaymentModal] = useState(false)
    const [showSuccessModal, setShowSuccessModal] = useState(false)
    const [processingPayment, setProcessingPayment] = useState(false)
    const [paymentMethod, setPaymentMethod] = useState('card')
    const [cardForm, setCardForm] = useState({ number: '', expiry: '', cvc: '' })

    const selectPlan = (plan) => {
        if (!isAuthenticated) { navigate('/login?redirect=/premium'); return }
        setSelectedPlan(plan)
        setShowPaymentModal(true)
    }

    const closePayment = () => { setShowPaymentModal(false); setProcessingPayment(false) }

    const processPayment = async () => {
        setProcessingPayment(true)
        await new Promise(resolve => setTimeout(resolve, 2000))
        try {
            await api.post('/auth/activate-premium', { plan: selectedPlan })
            const updatedUser = { ...user, is_premium: true, premium_type: selectedPlan }
            setUser(updatedUser)
            localStorage.setItem('user', JSON.stringify(updatedUser))
            setShowPaymentModal(false)
            setShowSuccessModal(true)
            setTimeout(() => navigate('/learn-japanese'), 3000)
        } catch (err) {
            console.error('Payment error:', err)
            alert('Payment failed. Please try again.')
        } finally { setProcessingPayment(false) }
    }

    return (
        <div className="premium-page">
            <AppHeader />
            <section className="premium-hero">
                <div className="hero-content">
                    <span className="premium-badge">⭐ {t('premium.badge')}</span>
                    <h1 className="premium-title">{t('premium.title')} <span className="text-gold">{t('premium.titleHighlight')}</span></h1>
                    <p className="premium-subtitle">{t('premium.subtitle')}</p>
                </div>
            </section>

            <section className="pricing-section">
                <div className="pricing-container">
                    {user?.is_premium ? (
                        <div className="already-premium">
                            <div className="premium-active-card">
                                <div className="active-icon">🎌</div>
                                <h2>{t('premium.alreadyPremium')}</h2>
                                <p>{t('premium.enjoyFeatures')}</p>
                                <div className="plan-badge-active">{user.premium_type === 'monthly' ? t('premium.monthlyPlan') : t('premium.lifetimePlan')}</div>
                                <Link to="/learn-japanese" className="btn-primary-lg">{t('premium.goToLearning')} →</Link>
                            </div>
                        </div>
                    ) : (
                        <div className="pricing-grid">
                            {/* Monthly */}
                            <div className="pricing-card">
                                <div className="plan-header"><span className="plan-icon">📅</span><h3>{t('premium.monthlyPlan')}</h3><p className="plan-desc">{t('premium.monthlyDesc')}</p></div>
                                <div className="plan-price"><span className="price-currency">$</span><span className="price-amount">4.99</span><span className="price-period">/{t('premium.month')}</span></div>
                                <ul className="plan-features">
                                    <li><span className="check">✓</span> {t('premium.feature1')}</li>
                                    <li><span className="check">✓</span> {t('premium.feature2')}</li>
                                    <li><span className="check">✓</span> {t('premium.feature3')}</li>
                                    <li><span className="check">✓</span> {t('premium.feature4')}</li>
                                    <li className="muted"><span className="x">✗</span> {t('premium.feature5')}</li>
                                </ul>
                                <button className="btn-plan monthly" onClick={() => selectPlan('monthly')} disabled={purchasing}>
                                    {purchasing && selectedPlan === 'monthly' ? t('premium.processing') : t('premium.getMonthly')}
                                </button>
                            </div>
                            {/* Lifetime */}
                            <div className="pricing-card featured">
                                <div className="popular-tag">🔥 {t('premium.mostPopular')}</div>
                                <div className="plan-header"><span className="plan-icon">♾️</span><h3>{t('premium.lifetimePlan')}</h3><p className="plan-desc">{t('premium.lifetimeDesc')}</p></div>
                                <div className="plan-price"><span className="price-currency">$</span><span className="price-amount">29.99</span><span className="price-period">{t('premium.oneTime')}</span></div>
                                <ul className="plan-features">
                                    <li><span className="check">✓</span> {t('premium.feature1')}</li>
                                    <li><span className="check">✓</span> {t('premium.feature2')}</li>
                                    <li><span className="check">✓</span> {t('premium.feature3')}</li>
                                    <li><span className="check">✓</span> {t('premium.feature4')}</li>
                                    <li><span className="check gold">✓</span> {t('premium.feature5')}</li>
                                </ul>
                                <button className="btn-plan lifetime" onClick={() => selectPlan('lifetime')} disabled={purchasing}>
                                    {purchasing && selectedPlan === 'lifetime' ? t('premium.processing') : t('premium.getLifetime')}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Payment Modal */}
                    {showPaymentModal && (
                        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && closePayment()}>
                            <div className="payment-modal">
                                <button className="modal-close" onClick={closePayment}>×</button>
                                <div className="modal-header">
                                    <h2>{t('premium.completePayment')}</h2>
                                    <p>{selectedPlan === 'monthly' ? t('premium.monthlyPlan') + ' — $4.99/mo' : t('premium.lifetimePlan') + ' — $29.99'}</p>
                                </div>
                                <div className="payment-methods">
                                    <h3>{t('premium.paymentMethod')}</h3>
                                    <div className="method-options">
                                        <button className={`method-btn ${paymentMethod === 'card' ? 'active' : ''}`} onClick={() => setPaymentMethod('card')}>
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>
                                            {t('premium.creditCard')}
                                        </button>
                                        <button className={`method-btn ${paymentMethod === 'kbzpay' ? 'active' : ''}`} onClick={() => setPaymentMethod('kbzpay')}><span className="method-emoji">🏦</span>KBZ Pay</button>
                                        <button className={`method-btn ${paymentMethod === 'wavepay' ? 'active' : ''}`} onClick={() => setPaymentMethod('wavepay')}><span className="method-emoji">📱</span>Wave Pay</button>
                                    </div>
                                </div>
                                <div className="payment-form">
                                    {paymentMethod === 'card' ? (
                                        <div className="card-form">
                                            <div className="form-group"><label>{t('premium.cardNumber')}</label><input type="text" value={cardForm.number} onChange={e => setCardForm(p => ({ ...p, number: e.target.value }))} placeholder="4242 4242 4242 4242" maxLength="19" /></div>
                                            <div className="form-row">
                                                <div className="form-group"><label>{t('premium.expiry')}</label><input type="text" value={cardForm.expiry} onChange={e => setCardForm(p => ({ ...p, expiry: e.target.value }))} placeholder="MM/YY" maxLength="5" /></div>
                                                <div className="form-group"><label>{t('premium.cvc')}</label><input type="text" value={cardForm.cvc} onChange={e => setCardForm(p => ({ ...p, cvc: e.target.value }))} placeholder="123" maxLength="3" /></div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="mobile-pay-info"><div className="qr-placeholder"><span className="qr-icon">📲</span><p>{t('premium.scanQR')}</p><p className="qr-hint">{t('premium.demoNote')}</p></div></div>
                                    )}
                                    <button className="btn-pay" onClick={processPayment} disabled={processingPayment}>
                                        {processingPayment && <span className="loading-spinner"></span>}
                                        {processingPayment ? t('premium.processing') : t('premium.payNow') + (selectedPlan === 'monthly' ? ' $4.99' : ' $29.99')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Success Modal */}
                    {showSuccessModal && (
                        <div className="modal-overlay">
                            <div className="success-modal">
                                <div className="success-icon">🎉</div>
                                <h2>{t('premium.welcomePremium')}</h2>
                                <p>{t('premium.successMessage')}</p>
                                <Link to="/learn-japanese" className="btn-primary-lg">{t('premium.startLearning')}</Link>
                            </div>
                        </div>
                    )}

                    {!isAuthenticated && (
                        <div className="login-prompt"><p>{t('premium.loginRequired')}</p><Link to="/login" className="btn-primary-lg">{t('nav.login')}</Link></div>
                    )}
                </div>
            </section>

            <footer className="premium-footer"><p>{t('footer.copyright')}</p></footer>
        </div>
    )
}
