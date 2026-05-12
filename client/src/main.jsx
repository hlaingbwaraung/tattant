/**
 * Application Bootstrap
 *
 * Creates the React app and registers:
 *  - BrowserRouter (client-side routing with /tattant/ base)
 *  - i18n          (English / Burmese translations)
 *
 * Then mounts everything to #root in index.html.
 */

import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './i18n'
import './style.css'

const root = createRoot(document.getElementById('root'))

try {
    root.render(
        <React.StrictMode>
            <BrowserRouter>
                <App />
            </BrowserRouter>
        </React.StrictMode>
    )
} catch (err) {
    console.error('App failed to render:', err)
    root.render(
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f8f6f1', color: '#1a1a1a', fontFamily: 'Inter, system-ui, sans-serif' }}>
            <div style={{ textAlign: 'center', padding: '2rem' }}>
                <h2>Something went wrong</h2>
                <p style={{ marginTop: '0.5rem', color: '#555' }}>Please clear your browser data and reload.</p>
                <button onClick={() => { localStorage.clear(); window.location.reload() }} style={{ marginTop: '1rem', padding: '0.75rem 2rem', background: '#b8860b', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                    Clear &amp; Reload
                </button>
            </div>
        </div>
    )
}
