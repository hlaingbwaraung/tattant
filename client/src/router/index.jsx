/**
 * React Router Configuration
 *
 * Defines all application routes with lazy-loaded views.
 * Includes ProtectedRoute for auth-protected pages.
 *
 * Base path: /tattant/ (GitHub Pages sub-directory)
 */

import React, { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import useAuthStore from '../store/useAuthStore'

/* ============================
 *  Lazy-loaded Views
 * ============================ */
const HomePage = lazy(() => import('../views/HomePage'))
const ExplorePage = lazy(() => import('../views/ExplorePage'))
const CategoryListPage = lazy(() => import('../views/CategoryListPage'))
const BusinessDetailPage = lazy(() => import('../views/BusinessDetailPage'))
const LoginPage = lazy(() => import('../views/LoginPage'))
const RegisterPage = lazy(() => import('../views/RegisterPage'))
const ForgotPasswordPage = lazy(() => import('../views/ForgotPasswordPage'))
const AboutJapan = lazy(() => import('../views/AboutJapan'))
const ContactPage = lazy(() => import('../views/ContactPage'))
const FAQPage = lazy(() => import('../views/FAQPage'))
const PremiumPage = lazy(() => import('../views/PremiumPage'))
const UserDashboard = lazy(() => import('../views/UserDashboard'))
const AdminDashboard = lazy(() => import('../views/AdminDashboard'))
const ShopOwnerDashboard = lazy(() => import('../views/ShopOwnerDashboard'))
const FavoritesPage = lazy(() => import('../views/FavoritesPage'))
const ProfileSettings = lazy(() => import('../views/ProfileSettings'))
const JLPTQuizPage = lazy(() => import('../views/JLPTQuizPage'))
const PointsShopPage = lazy(() => import('../views/PointsShopPage'))
const SavedBusinesses = lazy(() => import('../views/SavedBusinesses'))

/* ============================
 *  Protected Route Wrapper
 * ============================ */
function ProtectedRoute({ children }) {
    const token = useAuthStore(state => state.token)
    if (!token) {
        return <Navigate to="/login" replace />
    }
    return children
}

/* ============================
 *  Loading Fallback
 * ============================ */
function LoadingFallback() {
    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            background: 'var(--bg-primary)',
            color: 'var(--text-secondary)'
        }}>
            <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🎌</div>
                <div>Loading...</div>
            </div>
        </div>
    )
}

/* ============================
 *  App Routes
 * ============================ */
export default function AppRoutes() {
    return (
        <Suspense fallback={<LoadingFallback />}>
            <Routes>
                {/* --- Public pages --- */}
                <Route path="/" element={<HomePage />} />
                <Route path="/explore" element={<ExplorePage />} />
                <Route path="/categories/:slug" element={<CategoryListPage />} />
                <Route path="/categories" element={<Navigate to="/explore" replace />} />
                <Route path="/businesses/:id" element={<BusinessDetailPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/about-japan" element={<AboutJapan />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/faq" element={<FAQPage />} />
                <Route path="/premium" element={<PremiumPage />} />

                {/* --- Auth-protected pages --- */}
                <Route path="/dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
                <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
                <Route path="/shop-owner" element={<ProtectedRoute><ShopOwnerDashboard /></ProtectedRoute>} />
                <Route path="/favorites" element={<ProtectedRoute><FavoritesPage /></ProtectedRoute>} />
                <Route path="/profile/settings" element={<ProtectedRoute><ProfileSettings /></ProtectedRoute>} />
                <Route path="/learn-japanese" element={<ProtectedRoute><JLPTQuizPage /></ProtectedRoute>} />
                <Route path="/points-shop" element={<ProtectedRoute><PointsShopPage /></ProtectedRoute>} />
                <Route path="/saved" element={<ProtectedRoute><SavedBusinesses /></ProtectedRoute>} />
            </Routes>
        </Suspense>
    )
}
