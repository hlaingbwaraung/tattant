/**
 * UserDashboard – Personalised welcome with stats and quick actions.
 */
import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import AppHeader from '../components/layout/AppHeader'
import { getSavedBusinesses } from '../services/favoriteService'
import { getMyBookings } from '../services/bookingService'
import './UserDashboard.css'

export default function UserDashboard() {
    const [userName, setUserName] = useState('')
    const [savedBusinessesCount, setSavedBusinessesCount] = useState(0)
    const [bookings, setBookings] = useState([])
    const [loadingBookings, setLoadingBookings] = useState(true)
    const [daysActive] = useState(1)

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user') || '{}')
        setUserName(user.name || 'Guest')
        const fetchSaved = async () => {
            try {
                const response = await getSavedBusinesses()
                const data = response.data?.data || response.data || []
                setSavedBusinessesCount(Array.isArray(data) ? data.length : 0)
            } catch (err) { console.error('Error fetching saved businesses:', err) }
        }
        const fetchBookings = async () => {
            try {
                setLoadingBookings(true)
                const response = await getMyBookings()
                const data = response.data?.data || response.data || []
                setBookings(Array.isArray(data) ? data : [])
            } catch (err) {
                console.error('Error fetching bookings:', err)
                setBookings([])
            } finally {
                setLoadingBookings(false)
            }
        }
        fetchSaved()
        fetchBookings()
    }, [])

    const statActions = [
        { to: '/favorites', icon: '❤️', value: savedBusinessesCount, label: 'Saved Places', desc: 'Access your saved places' },
        { to: '/categories', icon: '📍', value: bookings.length, label: 'My Bookings', desc: 'View your booking history' },
        { to: '/profile/settings', icon: '⚙️', value: 0, label: 'Account Settings', desc: 'Manage your preferences' },
        { to: '/about-japan', icon: '📚', value: daysActive, label: 'Travel Guides', desc: 'Learn about Japan' },
    ]

    const getStatusBadge = (status) => {
        const badges = {
            pending: 'Pending',
            confirmed: 'Confirmed',
            completed: 'Completed',
            cancelled: 'Cancelled',
            'no-show': 'No Show'
        }
        return badges[status] || status.charAt(0).toUpperCase() + status.slice(1)
    }

    const formatDate = (dateStr) => {
        const date = new Date(dateStr)
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    }

    return (
        <div className="dashboard-page">
            <AppHeader />
            <main className="dashboard-main">
                <div className="dashboard-container">
                    <div className="welcome-section">
                        <div className="welcome-content">
                            <span className="welcome-badge">Dashboard</span>
                            <h1 className="welcome-title">Welcome back, <span className="text-gold">{userName}</span></h1>
                            <p className="welcome-subtitle">Here's what's happening with your Japan exploration journey</p>
                        </div>
                        <div className="welcome-avatar">
                            <span className="avatar-initial">{userName?.charAt(0)?.toUpperCase() || 'U'}</span>
                        </div>
                    </div>

                    <div className="stats-grid">
                        {statActions.map((s, i) => (
                            <Link key={i} to={s.to} className="stat-action-card">
                                <div className="stat-icon-wrapper"><span className="stat-icon">{s.icon}</span></div>
                                <div className="stat-content">
                                    <div className="stat-number">{s.value}</div>
                                    <div className="stat-label">{s.label}</div>
                                    <div className="stat-desc">{s.desc}</div>
                                </div>
                                <span className="action-arrow">→</span>
                            </Link>
                        ))}
                    </div>

                    <section className="section">
                        <div className="section-header">
                            <h2 className="section-title">My Bookings</h2>
                        </div>
                        <div className="bookings-list">
                            {loadingBookings ? (
                                <div className="loading-state">
                                    <div className="loading-spinner"></div>
                                    <p>Loading bookings...</p>
                                </div>
                            ) : bookings.length === 0 ? (
                                <div className="empty-state">
                                    <span className="empty-icon">📅</span>
                                    <p className="empty-text">No bookings yet</p>
                                    <p className="empty-hint">Book your first experience at a Japanese business</p>
                                    <Link to="/categories" className="btn-primary">Browse Places</Link>
                                </div>
                            ) : (
                                bookings.slice(0, 5).map((booking) => (
                                    <div key={booking.id} className="booking-item">
                                        <div className="booking-main">
                                            <div className="booking-business">
                                                <h3 className="business-name">{booking.business?.name || 'Business'}</h3>
                                                {booking.business?.address && (
                                                    <p className="business-address">📍 {booking.business.address}</p>
                                                )}
                                            </div>
                                            <div className="booking-details">
                                                <div className="detail-item">
                                                    <span className="detail-icon">📅</span>
                                                    <span className="detail-text">{formatDate(booking.booking_date)}</span>
                                                </div>
                                                {booking.booking_time && (
                                                    <div className="detail-item">
                                                        <span className="detail-icon">🕐</span>
                                                        <span className="detail-text">{booking.booking_time}</span>
                                                    </div>
                                                )}
                                                {booking.party_size && (
                                                    <div className="detail-item">
                                                        <span className="detail-icon">👥</span>
                                                        <span className="detail-text">{booking.party_size} {booking.party_size === 1 ? 'person' : 'people'}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="booking-status">
                                            <span className={`status-badge status-${booking.status}`}>
                                                {getStatusBadge(booking.status)}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                            {bookings.length > 5 && (
                                <div className="view-all-container">
                                    <p className="view-all-hint">Showing 5 of {bookings.length} bookings</p>
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </main>
        </div>
    )
}
