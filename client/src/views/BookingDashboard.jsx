/**
 * BookingDashboard – Shop Owner Booking Management
 *
 * Features:
 * - Calendar view with bookings by date
 * - CRUD operations for bookings (add, edit, delete)
 * - Monthly statistics (total customers, total revenue)
 * - Overview stats cards
 * - Responsive modern dashboard UI
 */
import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import AppHeader from '../components/layout/AppHeader'
import useAuthStore from '../store/useAuthStore'
import {
    getBookings, createBooking, updateBooking, deleteBooking,
    getBookingStats, getMonthlyStats
} from '../services/bookingService'
import { getMyBusinesses } from '../services/shopOwnerService'
import './BookingDashboard.css'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const STATUS_COLORS = {
    pending: '#f59e0b',
    confirmed: '#3b82f6',
    completed: '#10b981',
    cancelled: '#ef4444',
    'no-show': '#6b7280'
}
const STATUS_LABELS = {
    pending: '⏳ Pending',
    confirmed: '✓ Confirmed',
    completed: '✅ Completed',
    cancelled: '✗ Cancelled',
    'no-show': '👻 No-show'
}

const emptyBooking = {
    business_id: '', customer_name: '', customer_phone: '',
    booking_date: '', booking_time: '',
    notes: '', party_size: 1, status: 'confirmed'
}

export default function BookingDashboard() {
    const navigate = useNavigate()
    const { user } = useAuthStore()

    // Premier check: booking management is a Premier Shop Owner benefit
    const isPremier = user?.is_shop_owner && user?.premium_type === 'premier'

    // Calendar state
    const now = new Date()
    const [currentMonth, setCurrentMonth] = useState(now.getMonth())
    const [currentYear, setCurrentYear] = useState(now.getFullYear())
    const [selectedDate, setSelectedDate] = useState(null)

    // Data state
    const [businesses, setBusinesses] = useState([])
    const [bookings, setBookings] = useState([])
    const [stats, setStats] = useState(null)
    const [monthlyStats, setMonthlyStats] = useState([])
    const [loading, setLoading] = useState(true)
    const [statsYear, setStatsYear] = useState(now.getFullYear())

    // UI state
    const [activeTab, setActiveTab] = useState('calendar')
    const [showModal, setShowModal] = useState(false)
    const [editingBooking, setEditingBooking] = useState({ ...emptyBooking })
    const [saving, setSaving] = useState(false)
    const [filterBusiness, setFilterBusiness] = useState('')
    const [filterStatus, setFilterStatus] = useState('')
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null)

    // Load businesses
    const loadBusinesses = useCallback(async () => {
        try {
            const res = await getMyBusinesses()
            setBusinesses(res.data.data || res.data || [])
        } catch (err) { console.error('Error loading businesses:', err) }
    }, [])

    // Load bookings for current month
    const loadBookings = useCallback(async () => {
        try {
            setLoading(true)
            const params = {
                month: currentMonth + 1,
                year: currentYear
            }
            if (filterBusiness) params.business_id = filterBusiness
            if (filterStatus) params.status = filterStatus
            const res = await getBookings(params)
            setBookings(res.data.data || [])
        } catch (err) { console.error('Error loading bookings:', err) }
        finally { setLoading(false) }
    }, [currentMonth, currentYear, filterBusiness, filterStatus])

    // Load stats
    const loadStats = useCallback(async () => {
        try {
            const res = await getBookingStats()
            setStats(res.data.data)
        } catch (err) { console.error('Error loading stats:', err) }
    }, [])

    // Load monthly stats
    const loadMonthlyStats = useCallback(async () => {
        try {
            const res = await getMonthlyStats(statsYear)
            setMonthlyStats(res.data.data || [])
        } catch (err) { console.error('Error loading monthly stats:', err) }
    }, [statsYear])

    useEffect(() => {
        loadBusinesses()
        loadStats()
    }, [loadBusinesses, loadStats])

    useEffect(() => { loadBookings() }, [loadBookings])
    useEffect(() => { loadMonthlyStats() }, [loadMonthlyStats])

    // Calendar helpers
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay()
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`

    // Group bookings by date
    const bookingsByDate = useMemo(() => {
        const map = {}
        bookings.forEach(b => {
            if (!map[b.booking_date]) map[b.booking_date] = []
            map[b.booking_date].push(b)
        })
        return map
    }, [bookings])

    // Selected date bookings
    const selectedBookings = useMemo(() => {
        if (!selectedDate) return []
        return bookingsByDate[selectedDate] || []
    }, [selectedDate, bookingsByDate])

    // Navigate months
    const prevMonth = () => {
        if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1) }
        else setCurrentMonth(m => m - 1)
    }
    const nextMonth = () => {
        if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1) }
        else setCurrentMonth(m => m + 1)
    }
    const goToToday = () => {
        setCurrentMonth(now.getMonth())
        setCurrentYear(now.getFullYear())
        setSelectedDate(todayStr)
    }

    // Booking CRUD
    const openNewBooking = (date = null) => {
        const bookingDate = date || todayStr
        setEditingBooking({
            ...emptyBooking,
            booking_date: bookingDate,
            business_id: businesses[0]?.id || ''
        })
        setShowModal(true)
    }

    const openEditBooking = (booking) => {
        setEditingBooking({
            ...booking,
            booking_date: booking.booking_date?.split('T')[0] || '',
            revenue: booking.revenue || 0,
            party_size: booking.party_size || 1
        })
        setShowModal(true)
    }

    const handleSave = async (e) => {
        e.preventDefault()
        setSaving(true)
        try {
            const data = { ...editingBooking }
            if (!data.customer_phone) delete data.customer_phone
            if (!data.booking_time) delete data.booking_time
            if (!data.notes) delete data.notes

            if (data.id) {
                await updateBooking(data.id, data)
            } else {
                await createBooking(data)
            }
            setShowModal(false)
            await Promise.all([loadBookings(), loadStats(), loadMonthlyStats()])
        } catch (err) {
            alert('Failed to save booking: ' + (err.response?.data?.message || err.message))
        } finally { setSaving(false) }
    }

    const handleDelete = async (id) => {
        try {
            await deleteBooking(id)
            setShowDeleteConfirm(null)
            await Promise.all([loadBookings(), loadStats(), loadMonthlyStats()])
        } catch (err) {
            alert('Failed to delete booking: ' + (err.response?.data?.message || err.message))
        }
    }

    const handleStatusChange = async (booking, newStatus) => {
        try {
            await updateBooking(booking.id, { status: newStatus })
            await Promise.all([loadBookings(), loadStats()])
        } catch (err) {
            alert('Failed to update status')
        }
    }

    const updateField = (field) => (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked
            : e.target.type === 'number' ? Number(e.target.value)
            : e.target.value
        setEditingBooking(prev => ({ ...prev, [field]: value }))
    }

    const goBack = () => window.history.length > 1 ? navigate(-1) : navigate('/')

    // Monthly stats chart calculations
    const maxRevenue = Math.max(...monthlyStats.map(m => m.revenue), 1)
    const maxCustomers = Math.max(...monthlyStats.map(m => m.customers), 1)

    // Format currency
    const formatCurrency = (val) => '¥' + Number(val || 0).toLocaleString()

    // If not a premier shop owner, show upgrade wall
    if (user?.is_shop_owner && !isPremier) {
        return (
            <div className="booking-dashboard">
                <AppHeader />
                <div className="booking-container">
                    <div className="container">
                        <div style={{ textAlign: 'center', padding: '80px 20px', maxWidth: 520, margin: '0 auto' }}>
                            <div style={{ fontSize: 72, marginBottom: 16 }}>⭐</div>
                            <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8, color: '#1e293b' }}>Premier Shop Owner Feature</h1>
                            <p style={{ fontSize: 16, color: '#64748b', marginBottom: 8 }}>The Booking Management System is exclusively available to <strong>Premier Shop Owners</strong>.</p>
                            <div style={{ background: 'linear-gradient(135deg, #fef3c7, #fde68a)', border: '2px solid #f59e0b', borderRadius: 16, padding: '24px 28px', margin: '24px 0', textAlign: 'left' }}>
                                <h3 style={{ color: '#92400e', marginBottom: 12, fontSize: 16 }}>✨ Premier Benefits include:</h3>
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: '#78350f', fontSize: 14, lineHeight: 2 }}>
                                    <li>📅 Full Booking Dashboard with calendar view</li>
                                    <li>📊 Revenue & customer analytics</li>
                                    <li>✅ Accept / manage customer reservations</li>
                                    <li>📧 Customer contact management</li>
                                    <li>🏅 Premier badge on your business listing</li>
                                </ul>
                            </div>
                            <p style={{ color: '#94a3b8', fontSize: 14 }}>Contact an administrator to upgrade your account to Premier.</p>
                            <button onClick={() => navigate(-1)} style={{ marginTop: 16, padding: '10px 24px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>← Go Back</button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="booking-dashboard">
            <AppHeader />
            <div className="booking-container">
                <div className="container">
                    {/* Header */}
                    <div className="page-header">
                        <div className="header-content">
                            <h1>📅 Booking Dashboard</h1>
                            <p style={{ display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
                                <span className="subtitle">Manage your bookings, track customers & revenue</span>
                                <span style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, letterSpacing: 1 }}>⭐ PREMIER</span>
                            </p>
                        </div>
                        <button className="btn btn-primary btn-add" onClick={() => openNewBooking()}>
                            + New Booking
                        </button>
                    </div>

                    {/* Stats Cards */}
                    {stats && (
                        <div className="stats-grid">
                            {[
                                { icon: '📅', value: stats.totalBookings, label: 'Total Bookings', color: '#3b82f6' },
                                { icon: '👥', value: stats.totalCustomers, label: 'Total Customers', color: '#8b5cf6' },
                                { icon: '💰', value: formatCurrency(stats.totalRevenue), label: 'Total Revenue', color: '#10b981' },
                                { icon: '📌', value: stats.todayBookings, label: 'Today', color: '#f59e0b' },
                                { icon: '⏳', value: stats.pendingBookings, label: 'Pending', color: '#ef4444' },
                                { icon: '✅', value: stats.completedBookings, label: 'Completed', color: '#06b6d4' }
                            ].map((s, i) => (
                                <div key={i} className="stat-card" style={{ '--accent': s.color }}>
                                    <div className="stat-icon">{s.icon}</div>
                                    <div className="stat-info">
                                        <div className="stat-number">{s.value}</div>
                                        <div className="stat-label">{s.label}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Tab Navigation */}
                    <div className="tab-nav">
                        <button className={`tab-btn ${activeTab === 'calendar' ? 'active' : ''}`} onClick={() => setActiveTab('calendar')}>
                            📅 Calendar
                        </button>
                        <button className={`tab-btn ${activeTab === 'list' ? 'active' : ''}`} onClick={() => setActiveTab('list')}>
                            📋 All Bookings
                        </button>
                        <button className={`tab-btn ${activeTab === 'statistics' ? 'active' : ''}`} onClick={() => setActiveTab('statistics')}>
                            📊 Statistics
                        </button>
                    </div>

                    {/* Filters */}
                    <div className="filters-bar">
                        <select value={filterBusiness} onChange={e => setFilterBusiness(e.target.value)} className="filter-select">
                            <option value="">All Businesses</option>
                            {businesses.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                        </select>
                        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="filter-select">
                            <option value="">All Statuses</option>
                            <option value="pending">⏳ Pending</option>
                            <option value="confirmed">✓ Confirmed</option>
                            <option value="completed">✅ Completed</option>
                            <option value="cancelled">✗ Cancelled</option>
                            <option value="no-show">👻 No-show</option>
                        </select>
                    </div>

                    {/* ===== CALENDAR TAB ===== */}
                    {activeTab === 'calendar' && (
                        <div className="calendar-section">
                            <div className="calendar-layout">
                                {/* Calendar Grid */}
                                <div className="calendar-panel">
                                    <div className="calendar-header">
                                        <button className="cal-nav-btn" onClick={prevMonth}>‹</button>
                                        <h2 className="cal-title">{MONTHS[currentMonth]} {currentYear}</h2>
                                        <button className="cal-nav-btn" onClick={nextMonth}>›</button>
                                        <button className="cal-today-btn" onClick={goToToday}>Today</button>
                                    </div>

                                    <div className="calendar-grid">
                                        {DAYS.map(d => (
                                            <div key={d} className="cal-day-header">{d}</div>
                                        ))}
                                        {/* Empty cells before first day */}
                                        {Array.from({ length: firstDayOfMonth }, (_, i) => (
                                            <div key={`empty-${i}`} className="cal-day empty"></div>
                                        ))}
                                        {/* Day cells */}
                                        {Array.from({ length: daysInMonth }, (_, i) => {
                                            const day = i + 1
                                            const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                                            const dayBookings = bookingsByDate[dateStr] || []
                                            const isToday = dateStr === todayStr
                                            const isSelected = dateStr === selectedDate
                                            const hasBookings = dayBookings.length > 0

                                            return (
                                                <div
                                                    key={day}
                                                    className={`cal-day ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''} ${hasBookings ? 'has-bookings' : ''}`}
                                                    onClick={() => setSelectedDate(dateStr)}
                                                >
                                                    <span className="day-number">{day}</span>
                                                    {hasBookings && (
                                                        <div className="day-indicators">
                                                            {dayBookings.slice(0, 3).map((b, idx) => (
                                                                <span key={idx} className="booking-dot" style={{ backgroundColor: STATUS_COLORS[b.status] }}></span>
                                                            ))}
                                                            {dayBookings.length > 3 && <span className="more-count">+{dayBookings.length - 3}</span>}
                                                        </div>
                                                    )}
                                                    {hasBookings && (
                                                        <div className="day-count">{dayBookings.length}</div>
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>

                                    {/* Legend */}
                                    <div className="calendar-legend">
                                        {Object.entries(STATUS_COLORS).map(([status, color]) => (
                                            <span key={status} className="legend-item">
                                                <span className="legend-dot" style={{ backgroundColor: color }}></span>
                                                {status}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Day Detail Panel */}
                                <div className="day-detail-panel">
                                    {selectedDate ? (
                                        <>
                                            <div className="detail-header">
                                                <h3>{new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h3>
                                                <button className="btn btn-sm btn-primary" onClick={() => openNewBooking(selectedDate)}>
                                                    + Add
                                                </button>
                                            </div>
                                            {selectedBookings.length === 0 ? (
                                                <div className="no-bookings">
                                                    <span className="empty-icon">📭</span>
                                                    <p>No bookings for this date</p>
                                                    <button className="btn btn-outline btn-sm" onClick={() => openNewBooking(selectedDate)}>
                                                        Create Booking
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="booking-list-day">
                                                    {selectedBookings.map(booking => (
                                                        <div key={booking.id} className="booking-card-mini">
                                                            <div className="booking-card-top">
                                                                <div className="booking-time-badge">
                                                                    {booking.booking_time || 'All day'}
                                                                    {booking.end_time && ` - ${booking.end_time}`}
                                                                </div>
                                                                <span className="status-dot" style={{ backgroundColor: STATUS_COLORS[booking.status] }} title={booking.status}></span>
                                                            </div>
                                                            <div className="booking-card-body">
                                                                <div className="customer-name">{booking.customer_name}</div>
                                                                {booking.service && <div className="booking-service">🔧 {booking.service}</div>}
                                                                {booking.business && <div className="booking-biz">🏪 {booking.business.name}</div>}
                                                                <div className="booking-meta-row">
                                                                    {booking.party_size > 1 && <span>👥 {booking.party_size}</span>}
                                                                    {booking.revenue > 0 && <span>💰 {formatCurrency(booking.revenue)}</span>}
                                                                </div>
                                                            </div>
                                                            <div className="booking-card-actions">
                                                                <button className="btn-icon-sm" title="Edit" onClick={() => openEditBooking(booking)}>✏️</button>
                                                                <select
                                                                    className="status-select-sm"
                                                                    value={booking.status}
                                                                    onChange={e => handleStatusChange(booking, e.target.value)}
                                                                >
                                                                    <option value="pending">⏳ Pending</option>
                                                                    <option value="confirmed">✓ Confirmed</option>
                                                                    <option value="completed">✅ Completed</option>
                                                                    <option value="cancelled">✗ Cancelled</option>
                                                                    <option value="no-show">👻 No-show</option>
                                                                </select>
                                                                <button className="btn-icon-sm danger" title="Delete" onClick={() => setShowDeleteConfirm(booking)}>🗑️</button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div className="no-bookings">
                                            <span className="empty-icon">👈</span>
                                            <p>Select a date to view bookings</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ===== ALL BOOKINGS TAB ===== */}
                    {activeTab === 'list' && (
                        <div className="bookings-list-section">
                            {loading ? (
                                <div className="loading-container"><div className="loading-spinner"></div><p>Loading bookings...</p></div>
                            ) : bookings.length === 0 ? (
                                <div className="empty-state">
                                    <div className="empty-icon">📅</div>
                                    <h3>No bookings found</h3>
                                    <p>Create your first booking to get started.</p>
                                    <button className="btn btn-primary" onClick={() => openNewBooking()}>+ Create Booking</button>
                                </div>
                            ) : (
                                <div className="bookings-table-wrapper">
                                    <table className="data-table">
                                        <thead>
                                            <tr>
                                                <th>Date & Time</th>
                                                <th>Customer</th>
                                                <th>Business</th>
                                                <th>Service</th>
                                                <th>Party</th>
                                                <th>Revenue</th>
                                                <th>Status</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {bookings.map(booking => (
                                                <tr key={booking.id} className={`status-row-${booking.status}`}>
                                                    <td>
                                                        <div className="date-cell">
                                                            <span className="booking-date">{new Date(booking.booking_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                                            {booking.booking_time && <span className="booking-time-sm">{booking.booking_time}{booking.end_time && ` - ${booking.end_time}`}</span>}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className="customer-cell">
                                                            <span className="customer-name">{booking.customer_name}</span>
                                                            {booking.customer_phone && <span className="customer-contact">📞 {booking.customer_phone}</span>}
                                                        </div>
                                                    </td>
                                                    <td>{booking.business?.name || 'N/A'}</td>
                                                    <td>{booking.service || '-'}</td>
                                                    <td>{booking.party_size || 1}</td>
                                                    <td className="revenue-cell">{formatCurrency(booking.revenue)}</td>
                                                    <td>
                                                        <select
                                                            className="status-select"
                                                            value={booking.status}
                                                            onChange={e => handleStatusChange(booking, e.target.value)}
                                                            style={{ color: STATUS_COLORS[booking.status] }}
                                                        >
                                                            <option value="pending">⏳ Pending</option>
                                                            <option value="confirmed">✓ Confirmed</option>
                                                            <option value="completed">✅ Completed</option>
                                                            <option value="cancelled">✗ Cancelled</option>
                                                            <option value="no-show">👻 No-show</option>
                                                        </select>
                                                    </td>
                                                    <td className="actions-cell">
                                                        <button className="btn-icon" title="Edit" onClick={() => openEditBooking(booking)}>✏️</button>
                                                        <button className="btn-icon danger" title="Delete" onClick={() => setShowDeleteConfirm(booking)}>🗑️</button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ===== STATISTICS TAB ===== */}
                    {activeTab === 'statistics' && (
                        <div className="statistics-section">
                            <div className="stats-header">
                                <h2>📊 Monthly Statistics</h2>
                                <div className="year-selector">
                                    <button className="cal-nav-btn" onClick={() => setStatsYear(y => y - 1)}>‹</button>
                                    <span className="year-label">{statsYear}</span>
                                    <button className="cal-nav-btn" onClick={() => setStatsYear(y => y + 1)}>›</button>
                                </div>
                            </div>

                            {/* Revenue Chart */}
                            <div className="chart-card">
                                <h3>💰 Monthly Revenue</h3>
                                <div className="bar-chart">
                                    {monthlyStats.map((m, i) => (
                                        <div key={i} className="bar-col">
                                            <div className="bar-value">{m.revenue > 0 ? formatCurrency(m.revenue) : ''}</div>
                                            <div className="bar-wrapper">
                                                <div
                                                    className="bar revenue-bar"
                                                    style={{ height: `${(m.revenue / maxRevenue) * 100}%` }}
                                                ></div>
                                            </div>
                                            <div className="bar-label">{MONTHS[i]}</div>
                                        </div>
                                    ))}
                                </div>
                                <div className="chart-summary">
                                    <div className="summary-item">
                                        <span className="summary-label">Year Total</span>
                                        <span className="summary-value revenue">{formatCurrency(monthlyStats.reduce((s, m) => s + m.revenue, 0))}</span>
                                    </div>
                                    <div className="summary-item">
                                        <span className="summary-label">Monthly Avg</span>
                                        <span className="summary-value">{formatCurrency(monthlyStats.reduce((s, m) => s + m.revenue, 0) / 12)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Customers Chart */}
                            <div className="chart-card">
                                <h3>👥 Monthly Customers</h3>
                                <div className="bar-chart">
                                    {monthlyStats.map((m, i) => (
                                        <div key={i} className="bar-col">
                                            <div className="bar-value">{m.customers > 0 ? m.customers : ''}</div>
                                            <div className="bar-wrapper">
                                                <div
                                                    className="bar customers-bar"
                                                    style={{ height: `${(m.customers / maxCustomers) * 100}%` }}
                                                ></div>
                                            </div>
                                            <div className="bar-label">{MONTHS[i]}</div>
                                        </div>
                                    ))}
                                </div>
                                <div className="chart-summary">
                                    <div className="summary-item">
                                        <span className="summary-label">Year Total</span>
                                        <span className="summary-value customers">{monthlyStats.reduce((s, m) => s + m.customers, 0)}</span>
                                    </div>
                                    <div className="summary-item">
                                        <span className="summary-label">Monthly Avg</span>
                                        <span className="summary-value">{Math.round(monthlyStats.reduce((s, m) => s + m.customers, 0) / 12)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Bookings Chart */}
                            <div className="chart-card">
                                <h3>📅 Monthly Bookings</h3>
                                <div className="bar-chart">
                                    {monthlyStats.map((m, i) => {
                                        const maxBookings = Math.max(...monthlyStats.map(x => x.bookings), 1)
                                        return (
                                            <div key={i} className="bar-col">
                                                <div className="bar-value">{m.bookings > 0 ? m.bookings : ''}</div>
                                                <div className="bar-wrapper">
                                                    <div
                                                        className="bar bookings-bar"
                                                        style={{ height: `${(m.bookings / maxBookings) * 100}%` }}
                                                    ></div>
                                                </div>
                                                <div className="bar-label">{MONTHS[i]}</div>
                                            </div>
                                        )
                                    })}
                                </div>
                                <div className="chart-summary">
                                    <div className="summary-item">
                                        <span className="summary-label">Year Total</span>
                                        <span className="summary-value bookings">{monthlyStats.reduce((s, m) => s + m.bookings, 0)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Monthly Data Table */}
                            <div className="chart-card">
                                <h3>📋 Monthly Breakdown</h3>
                                <div className="bookings-table-wrapper">
                                    <table className="data-table stats-table">
                                        <thead>
                                            <tr>
                                                <th>Month</th>
                                                <th>Bookings</th>
                                                <th>Customers</th>
                                                <th>Revenue</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {monthlyStats.map((m, i) => (
                                                <tr key={i} className={m.bookings > 0 ? '' : 'empty-row'}>
                                                    <td><strong>{MONTHS[i]} {statsYear}</strong></td>
                                                    <td>{m.bookings}</td>
                                                    <td>{m.customers}</td>
                                                    <td className="revenue-cell">{formatCurrency(m.revenue)}</td>
                                                </tr>
                                            ))}
                                            <tr className="total-row">
                                                <td><strong>Total</strong></td>
                                                <td><strong>{monthlyStats.reduce((s, m) => s + m.bookings, 0)}</strong></td>
                                                <td><strong>{monthlyStats.reduce((s, m) => s + m.customers, 0)}</strong></td>
                                                <td className="revenue-cell"><strong>{formatCurrency(monthlyStats.reduce((s, m) => s + m.revenue, 0))}</strong></td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    <button className="page-back-btn" onClick={goBack} type="button">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M5 12L12 19M5 12L12 5" /></svg>
                        Back
                    </button>
                </div>
            </div>

            {/* ===== BOOKING MODAL ===== */}
            {showModal && (
                <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
                    <div className="modal-content booking-modal">
                        <div className="modal-header">
                            <h2>{editingBooking.id ? '✏️ Edit Booking' : '➕ New Booking'}</h2>
                            <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
                        </div>
                        <form onSubmit={handleSave} className="modal-form">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Business *</label>
                                    <select value={editingBooking.business_id} onChange={updateField('business_id')} required>
                                        <option value="">Select business</option>
                                        {businesses.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Status</label>
                                    <select value={editingBooking.status} onChange={updateField('status')}>
                                        <option value="pending">⏳ Pending</option>
                                        <option value="confirmed">✓ Confirmed</option>
                                        <option value="completed">✅ Completed</option>
                                        <option value="cancelled">✗ Cancelled</option>
                                        <option value="no-show">👻 No-show</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-section-title">👤 Customer</div>
                            <div className="form-group">
                                <label>Name *</label>
                                <input value={editingBooking.customer_name} onChange={updateField('customer_name')} type="text" required placeholder="Full name" />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Phone</label>
                                    <input value={editingBooking.customer_phone} onChange={updateField('customer_phone')} type="text" placeholder="+81 XXX-XXXX" />
                                </div>
                                <div className="form-group">
                                    <label>People</label>
                                    <input value={editingBooking.party_size} onChange={updateField('party_size')} type="number" min="1" />
                                </div>
                            </div>

                            <div className="form-section-title">📅 Date & Time</div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Date *</label>
                                    <input value={editingBooking.booking_date} onChange={updateField('booking_date')} type="date" required />
                                </div>
                                <div className="form-group">
                                    <label>Time</label>
                                    <input value={editingBooking.booking_time} onChange={updateField('booking_time')} type="time" />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>💬 Message</label>
                                <textarea value={editingBooking.notes} onChange={updateField('notes')} rows="3" placeholder="Special requests or notes..."></textarea>
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={saving}>
                                    {saving ? 'Saving...' : editingBooking.id ? 'Update Booking' : 'Create Booking'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ===== DELETE CONFIRMATION ===== */}
            {showDeleteConfirm && (
                <div className="modal-overlay" onClick={() => setShowDeleteConfirm(null)}>
                    <div className="modal-content delete-modal" onClick={e => e.stopPropagation()}>
                        <h3>🗑️ Delete Booking</h3>
                        <p>Are you sure you want to delete the booking for <strong>{showDeleteConfirm.customer_name}</strong> on <strong>{showDeleteConfirm.booking_date}</strong>?</p>
                        <p className="warning">This action cannot be undone.</p>
                        <div className="modal-actions">
                            <button className="btn btn-outline" onClick={() => setShowDeleteConfirm(null)}>Cancel</button>
                            <button className="btn btn-danger" onClick={() => handleDelete(showDeleteConfirm.id)}>Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
