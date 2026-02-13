/**
 * ProfileSettings – Account settings with profile update, password change, and account deletion.
 */
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import AppHeader from '../components/layout/AppHeader'
import useAuthStore from '../store/useAuthStore'
import './ProfileSettings.css'

export default function ProfileSettings() {
    const navigate = useNavigate()
    const { user, setUser, logout } = useAuthStore()

    const [profileForm, setProfileForm] = useState({ name: '', email: '' })
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false)
    const [profileMessage, setProfileMessage] = useState('')
    const [profileMessageType, setProfileMessageType] = useState('success')

    const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)
    const [passwordMessage, setPasswordMessage] = useState('')
    const [passwordMessageType, setPasswordMessageType] = useState('success')

    useEffect(() => {
        if (user) {
            setProfileForm({ name: user.name || '', email: user.email || '' })
        }
    }, [user])

    const updateProfile = async (e) => {
        e.preventDefault()
        setProfileMessage('')
        if (!profileForm.name || !profileForm.email) {
            setProfileMessage('Name and email are required'); setProfileMessageType('error'); return
        }
        setIsUpdatingProfile(true)
        try {
            const token = localStorage.getItem('token')
            const response = await api.put('/auth/profile',
                { name: profileForm.name, email: profileForm.email },
                { headers: { Authorization: `Bearer ${token}` } }
            )
            setUser(response.data.user)
            localStorage.setItem('user', JSON.stringify(response.data.user))
            setProfileMessage('Profile updated successfully!'); setProfileMessageType('success')
        } catch (err) {
            setProfileMessage(err.response?.data?.message || 'Failed to update profile'); setProfileMessageType('error')
        } finally { setIsUpdatingProfile(false) }
    }

    const updatePassword = async (e) => {
        e.preventDefault()
        setPasswordMessage('')
        if (!passwordForm.currentPassword || !passwordForm.newPassword) {
            setPasswordMessage('Current and new passwords are required'); setPasswordMessageType('error'); return
        }
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setPasswordMessage('New passwords do not match'); setPasswordMessageType('error'); return
        }
        if (passwordForm.newPassword.length < 6) {
            setPasswordMessage('New password must be at least 6 characters'); setPasswordMessageType('error'); return
        }
        setIsUpdatingPassword(true)
        try {
            const token = localStorage.getItem('token')
            await api.put('/auth/password',
                { currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword },
                { headers: { Authorization: `Bearer ${token}` } }
            )
            setPasswordMessage('Password updated successfully!'); setPasswordMessageType('success')
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
        } catch (err) {
            setPasswordMessage(err.response?.data?.message || 'Failed to update password'); setPasswordMessageType('error')
        } finally { setIsUpdatingPassword(false) }
    }

    const confirmDeleteAccount = () => {
        if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            deleteAccount()
        }
    }

    const deleteAccount = async () => {
        try {
            const token = localStorage.getItem('token')
            await api.delete('/auth/account')
            logout()
            navigate('/')
        } catch (err) { alert(err.response?.data?.message || 'Failed to delete account') }
    }

    return (
        <div className="settings-page">
            <AppHeader />
            <div className="container">
                <div className="page-header"><h1>Account Settings</h1><p className="subtitle">Manage your profile and account preferences</p></div>
                <div className="settings-content">
                    {/* Profile Section */}
                    <section className="settings-section">
                        <div className="section-header">
                            <div className="section-icon">👤</div>
                            <div><h2>Profile Information</h2><p>Update your personal details</p></div>
                        </div>
                        <form onSubmit={updateProfile} className="settings-form">
                            <div className="form-group">
                                <label htmlFor="name">Full Name</label>
                                <input type="text" id="name" value={profileForm.name} onChange={e => setProfileForm(p => ({ ...p, name: e.target.value }))} placeholder="Enter your full name" disabled={isUpdatingProfile} />
                            </div>
                            <div className="form-group">
                                <label htmlFor="email">Email Address</label>
                                <input type="email" id="email" value={profileForm.email} onChange={e => setProfileForm(p => ({ ...p, email: e.target.value }))} placeholder="Enter your email" disabled={isUpdatingProfile} />
                            </div>
                            <div className="form-actions">
                                <button type="submit" className="btn-primary" disabled={isUpdatingProfile}>
                                    {isUpdatingProfile && <span className="spinner"></span>}
                                    {isUpdatingProfile ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                            {profileMessage && <div className={`message ${profileMessageType}`}>{profileMessage}</div>}
                        </form>
                    </section>

                    {/* Password Section */}
                    <section className="settings-section">
                        <div className="section-header">
                            <div className="section-icon">🔐</div>
                            <div><h2>Change Password</h2><p>Update your password to keep your account secure</p></div>
                        </div>
                        <form onSubmit={updatePassword} className="settings-form">
                            <div className="form-group">
                                <label htmlFor="currentPassword">Current Password</label>
                                <input type="password" id="currentPassword" value={passwordForm.currentPassword} onChange={e => setPasswordForm(p => ({ ...p, currentPassword: e.target.value }))} placeholder="Enter current password" disabled={isUpdatingPassword} />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="newPassword">New Password</label>
                                    <input type="password" id="newPassword" value={passwordForm.newPassword} onChange={e => setPasswordForm(p => ({ ...p, newPassword: e.target.value }))} placeholder="Enter new password" disabled={isUpdatingPassword} />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="confirmPassword">Confirm New Password</label>
                                    <input type="password" id="confirmPassword" value={passwordForm.confirmPassword} onChange={e => setPasswordForm(p => ({ ...p, confirmPassword: e.target.value }))} placeholder="Confirm new password" disabled={isUpdatingPassword} />
                                </div>
                            </div>
                            <div className="form-actions">
                                <button type="submit" className="btn-primary" disabled={isUpdatingPassword}>
                                    {isUpdatingPassword && <span className="spinner"></span>}
                                    {isUpdatingPassword ? 'Updating...' : 'Update Password'}
                                </button>
                            </div>
                            {passwordMessage && <div className={`message ${passwordMessageType}`}>{passwordMessage}</div>}
                        </form>
                    </section>

                    {/* Danger Zone */}
                    <section className="settings-section danger-zone">
                        <div className="section-header">
                            <div className="section-icon">⚠️</div>
                            <div><h2>Danger Zone</h2><p>Irreversible and destructive actions</p></div>
                        </div>
                        <div className="danger-content">
                            <div className="danger-item">
                                <div><h4>Delete Account</h4><p>Permanently remove your account and all associated data. This action cannot be undone.</p></div>
                                <button className="btn-danger" onClick={confirmDeleteAccount}>Delete Account</button>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    )
}
