/**
 * App.jsx – Root Component
 *
 * - Initialises the theme store so dark/light mode is applied on first load.
 * - Tracks page visits for analytics.
 * - Renders whichever route matches the current URL.
 */

import React, { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import useThemeStore from './store/useThemeStore'
import AppRoutes from './router'
import ChatBot from './components/ui/ChatBot'
import api from './services/api'

export default function App() {
    // Trigger theme initialization (the store applies dark/light class on creation)
    useThemeStore()

    const location = useLocation()

    // Track page visit on route change
    useEffect(() => {
        api.post('/visits/track', { path: location.pathname }).catch(() => {})
    }, [location.pathname])

    return (
        <div id="app">
            <AppRoutes />
            <ChatBot />
        </div>
    )
}
