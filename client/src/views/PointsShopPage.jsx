/**
 * PointsShopPage – Browse & redeem coupons with earned points, view redeemed coupons.
 */
import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import AppHeader from '../components/layout/AppHeader'
import useAuthStore from '../store/useAuthStore'
import api from '../services/api'
import './PointsShopPage.css'

export default function PointsShopPage() {
    const { t } = useTranslation()
    const { user, setUser, token } = useAuthStore()
    const isAuthenticated = !!token

    const [activeTab, setActiveTab] = useState('shop')
    const [userPoints, setUserPoints] = useState(user?.points || 0)
    const [coupons, setCoupons] = useState([])
    const [shopLoading, setShopLoading] = useState(false)
    const [redeeming, setRedeeming] = useState(false)
    const [redeemingId, setRedeemingId] = useState(null)
    const [myCoupons, setMyCoupons] = useState([])
    const [myCouponsLoading, setMyCouponsLoading] = useState(false)
    const [showSuccess, setShowSuccess] = useState(false)
    const [redeemedCoupon, setRedeemedCoupon] = useState(null)

    const formatDate = (dateStr) => !dateStr ? '' : new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

    const loadShop = async () => {
        setShopLoading(true)
        try {
            const res = await api.get('/points/shop')
            setCoupons(res.data.data || [])
            setUserPoints(res.data.userPoints || 0)
        } catch (err) { console.error('Failed to load shop:', err) }
        finally { setShopLoading(false) }
    }

    const loadMyCoupons = async () => {
        setMyCouponsLoading(true)
        try {
            const res = await api.get('/points/my-coupons')
            setMyCoupons(res.data.data || [])
        } catch (err) { console.error('Failed to load my coupons:', err) }
        finally { setMyCouponsLoading(false) }
    }

    const redeemCoupon = async (coupon) => {
        if (redeeming) return
        setRedeeming(true); setRedeemingId(coupon.id)
        try {
            const res = await api.post('/points/redeem', { coupon_id: coupon.id })
            setRedeemedCoupon(res.data.data)
            setUserPoints(res.data.data.remaining_points)
            if (user) {
                const updated = { ...user, points: res.data.data.remaining_points }
                setUser(updated)
                localStorage.setItem('user', JSON.stringify(updated))
            }
            setShowSuccess(true)
            await loadShop()
        } catch (err) {
            console.error('Redeem error:', err)
            alert(err.response?.data?.message || 'Failed to redeem coupon')
        } finally { setRedeeming(false); setRedeemingId(null) }
    }

    const markUsed = async (uc) => {
        try {
            await api.post(`/points/use-coupon/${uc.id}`)
            setMyCoupons(prev => prev.map(c => c.id === uc.id ? { ...c, is_used: true, used_at: new Date().toISOString() } : c))
        } catch (err) {
            console.error('Mark used error:', err)
            alert(err.response?.data?.message || 'Failed to mark coupon as used')
        }
    }

    useEffect(() => { if (isAuthenticated) loadShop() }, [isAuthenticated])

    const discountLabel = (coupon) => {
        if (coupon.discount_type === 'percentage') return `${coupon.discount_value}% OFF`
        if (coupon.discount_type === 'fixed') return `$${coupon.discount_value} OFF`
        return `🎁 ${t('pointsShop.freebie')}`
    }

    return (
        <div className="points-shop-page">
            <AppHeader />
            <section className="shop-hero">
                <div className="shop-hero-content">
                    <span className="shop-badge">🪙 {t('pointsShop.badge')}</span>
                    <h1 className="shop-title">{t('pointsShop.title')} <span className="text-gold">{t('pointsShop.titleHighlight')}</span></h1>
                    <p className="shop-subtitle">{t('pointsShop.subtitle')}</p>
                </div>
            </section>

            <section className="shop-main">
                <div className="shop-container">
                    {isAuthenticated && (
                        <div className="balance-card">
                            <div className="balance-left">
                                <span className="balance-icon">🪙</span>
                                <div className="balance-info"><span className="balance-label">{t('pointsShop.yourPoints')}</span><span className="balance-amount">{userPoints}</span></div>
                            </div>
                            <Link to="/learn-japanese" className="earn-more-btn">🎌 {t('pointsShop.earnMore')}</Link>
                        </div>
                    )}

                    {!isAuthenticated && (
                        <div className="login-prompt"><p>{t('pointsShop.loginRequired')}</p><Link to="/login" className="btn-login">{t('nav.login')}</Link></div>
                    )}

                    {isAuthenticated && (
                        <div className="tab-bar">
                            <button className={`tab-btn ${activeTab === 'shop' ? 'active' : ''}`} onClick={() => setActiveTab('shop')}>🛍️ {t('pointsShop.shopTab')}</button>
                            <button className={`tab-btn ${activeTab === 'my-coupons' ? 'active' : ''}`} onClick={() => { setActiveTab('my-coupons'); loadMyCoupons() }}>🎟️ {t('pointsShop.myCouponsTab')}</button>
                        </div>
                    )}

                    {isAuthenticated && activeTab === 'shop' && (
                        <div className="shop-panel">
                            {shopLoading ? (
                                <div className="loading"><div className="loading-spinner"></div><span>{t('common.loading')}</span></div>
                            ) : coupons.length === 0 ? (
                                <div className="empty-state"><span className="empty-icon">🛍️</span><h3>{t('pointsShop.noCoupons')}</h3><p>{t('pointsShop.noCouponsDesc')}</p></div>
                            ) : (
                                <div className="coupons-grid">
                                    {coupons.map(coupon => (
                                        <div key={coupon.id} className={`coupon-card ${userPoints >= coupon.points_cost ? 'can-afford' : ''}`}>
                                            <div className="coupon-header">
                                                <span className="coupon-shop">{coupon.business?.name || 'Shop'}</span>
                                                <span className="coupon-discount">{discountLabel(coupon)}</span>
                                            </div>
                                            <h3 className="coupon-title">{coupon.title}</h3>
                                            {coupon.description && <p className="coupon-desc">{coupon.description}</p>}
                                            <div className="coupon-footer">
                                                <div className="coupon-cost"><span className="cost-icon">🪙</span><span className="cost-amount">{coupon.points_cost}</span><span className="cost-label">{t('pointsShop.points')}</span></div>
                                                <button className="btn-redeem" disabled={userPoints < coupon.points_cost || redeeming} onClick={() => redeemCoupon(coupon)}>
                                                    {redeeming && redeemingId === coupon.id ? t('pointsShop.redeeming') : t('pointsShop.redeem')}
                                                </button>
                                            </div>
                                            {coupon.end_date && <div className="coupon-expiry">{t('pointsShop.expires')}: {formatDate(coupon.end_date)}</div>}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {isAuthenticated && activeTab === 'my-coupons' && (
                        <div className="my-coupons-panel">
                            {myCouponsLoading ? (
                                <div className="loading"><div className="loading-spinner"></div><span>{t('common.loading')}</span></div>
                            ) : myCoupons.length === 0 ? (
                                <div className="empty-state"><span className="empty-icon">🎟️</span><h3>{t('pointsShop.noRedeemed')}</h3><p>{t('pointsShop.noRedeemedDesc')}</p><button className="btn-primary" onClick={() => setActiveTab('shop')}>{t('pointsShop.browseShop')}</button></div>
                            ) : (
                                <div className="my-coupons-list">
                                    {myCoupons.map(uc => (
                                        <div key={uc.id} className={`my-coupon-card ${uc.is_used ? 'is-used' : ''}`}>
                                            <div className="my-coupon-left"><div className="my-coupon-discount">
                                                {uc.coupon?.discount_type === 'percentage' ? `${uc.coupon.discount_value}%` : uc.coupon?.discount_type === 'fixed' ? `$${uc.coupon.discount_value}` : '🎁'}
                                            </div></div>
                                            <div className="my-coupon-info">
                                                <h4>{uc.coupon?.title || 'Coupon'}</h4>
                                                <p className="my-coupon-shop">{uc.coupon?.business?.name || 'Shop'}</p>
                                                <p className="my-coupon-code">{t('pointsShop.code')}: <strong>{uc.coupon?.code}</strong></p>
                                                <p className="my-coupon-date">{t('pointsShop.redeemed')}: {formatDate(uc.redeemed_at)}</p>
                                            </div>
                                            <div className="my-coupon-actions">
                                                {uc.is_used ? <span className="used-badge">✓ {t('pointsShop.used')}</span> : <button className="btn-use" onClick={() => markUsed(uc)}>{t('pointsShop.markUsed')}</button>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {showSuccess && (
                        <div className="modal-overlay" onClick={() => setShowSuccess(false)}>
                            <div className="modal-card success-modal" onClick={e => e.stopPropagation()}>
                                <div className="success-icon">🎉</div>
                                <h2>{t('pointsShop.redeemSuccess')}</h2>
                                <p>{t('pointsShop.redeemSuccessDesc')}</p>
                                {redeemedCoupon && (
                                    <div className="redeemed-coupon-info">
                                        <p className="rc-title">{redeemedCoupon.coupon?.title}</p>
                                        <p className="rc-code">{t('pointsShop.code')}: <strong>{redeemedCoupon.coupon?.code}</strong></p>
                                        <p className="rc-shop">{redeemedCoupon.coupon?.business?.name}</p>
                                    </div>
                                )}
                                <button className="btn-primary" onClick={() => { setShowSuccess(false); setActiveTab('my-coupons'); loadMyCoupons() }}>{t('pointsShop.viewMyCoupons')}</button>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            <footer className="shop-footer"><p>{t('footer.copyright')}</p></footer>
        </div>
    )
}
