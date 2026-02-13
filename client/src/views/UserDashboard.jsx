/**
 * UserDashboard – Personalised welcome with stats and quick actions.
 */
import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import AppHeader from '../components/layout/AppHeader'
import { getSavedBusinesses } from '../services/favoriteService'
import './UserDashboard.css'

export default function UserDashboard() {
    const [userName, setUserName] = useState('')
    const [savedBusinessesCount, setSavedBusinessesCount] = useState(0)
    const [daysActive] = useState(1)

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user') || '{}')
        setUserName(user.name || 'Guest')
        const fetchSaved = async () => {
            try {
                const response = await getSavedBusinesses()
                setSavedBusinessesCount(response.data.length)
            } catch (err) { console.error('Error fetching saved businesses:', err) }
        }
        fetchSaved()
    }, [])

    const stats = [
        { icon: '❤️', value: savedBusinessesCount, label: 'Saved Places' },
        { icon: '📍', value: 0, label: 'Places Visited' },
        { icon: '⭐', value: 0, label: 'Reviews Written' },
        { icon: '🎯', value: daysActive, label: 'Days Active' },
    ]

    const actions = [
        { to: '/categories', icon: '🔍', title: 'Explore Categories', desc: 'Browse curated Japan experiences' },
        { to: '/favorites', icon: '❤️', title: 'View Favorites', desc: 'Access your saved places' },
        { to: '/profile/settings', icon: '⚙️', title: 'Account Settings', desc: 'Manage your preferences' },
        { to: '/about-japan', icon: '📚', title: 'Travel Guides', desc: 'Learn about Japan' },
    ]

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
                        {stats.map((s, i) => (
                            <div key={i} className="stat-card">
                                <div className="stat-icon-wrapper"><span className="stat-icon">{s.icon}</span></div>
                                <div className="stat-content">
                                    <div className="stat-number">{s.value}</div>
                                    <div className="stat-label">{s.label}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <section className="section">
                        <div className="section-header">
                            <h2 className="section-title">Quick Actions</h2>
                            <p className="section-subtitle">Jump to your most used features</p>
                        </div>
                        <div className="actions-grid">
                            {actions.map(a => (
                                <Link key={a.to} to={a.to} className="action-card">
                                    <div className="action-icon">{a.icon}</div>
                                    <div className="action-content">
                                        <h3 className="action-title">{a.title}</h3>
                                        <p className="action-description">{a.desc}</p>
                                    </div>
                                    <span className="action-arrow">→</span>
                                </Link>
                            ))}
                        </div>
                    </section>

                    <section className="section">
                        <div className="section-header"><h2 className="section-title">Recent Activity</h2></div>
                        <div className="activity-card">
                            <div className="activity-empty">
                                <span className="activity-empty-icon">📋</span>
                                <p className="activity-empty-text">No recent activity yet</p>
                                <p className="activity-empty-hint">Start exploring Japan to see your activity here</p>
                                <Link to="/categories" className="btn-primary">Start Exploring</Link>
                            </div>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    )
}
