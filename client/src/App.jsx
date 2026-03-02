/**
 * App.jsx – Root Component
 *
 * - Initialises the theme store so dark/light mode is applied on first load.
 * - Renders whichever route matches the current URL.
 */

import React from 'react'
import useThemeStore from './store/useThemeStore'
import AppRoutes from './router'
import ChatBot from './components/ui/ChatBot'

export default function App() {
    // Trigger theme initialization (the store applies dark/light class on creation)
    useThemeStore()

    return (
        <div id="app">
            <AppRoutes />
            <ChatBot />
        </div>
    )
}
