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

createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <BrowserRouter basename="/tattant">
            <App />
        </BrowserRouter>
    </React.StrictMode>
)
