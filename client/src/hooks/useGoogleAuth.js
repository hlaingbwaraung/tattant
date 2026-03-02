/**
 * useGoogleAuth Hook
 *
 * Production-reliable Google Sign-In using the transparent overlay pattern.
 *
 * WHY: id.prompt() (One Tap) is suppressed by Google on production after the
 * first dismissal, and the common fallback of programmatically clicking a hidden
 * iframe fails due to cross-origin restrictions in all modern browsers.
 *
 * HOW: We instead call google.accounts.id.renderButton() into a container ref
 * that the consuming page overlays (opacity:0, position:absolute) on top of the
 * styled button. The user's real click hits Google's iframe directly — no JS
 * tricks required, works everywhere including production.
 *
 * Usage:
 *   const { isGoogleAvailable, isGoogleLoaded, googleLoading, setupGoogleButton }
 *     = useGoogleAuth(onCredentialReceived, onError)
 *
 *   // In the page:
 *   const googleBtnRef = useRef(null)
 *   useEffect(() => { if (isGoogleLoaded) setupGoogleButton(googleBtnRef.current) },
 *             [isGoogleLoaded, setupGoogleButton])
 *
 *   // JSX — transparent overlay on top of styled button:
 *   <div style={{ position:'relative', overflow:'hidden' }}>
 *     <button className="btn-google" style={{ pointerEvents:'none' }}>...</button>
 *     <div ref={googleBtnRef} style={{ position:'absolute', inset:0, opacity:0 }} />
 *   </div>
 */

import { useState, useEffect, useRef, useCallback } from 'react'

/* ---------- Constants ---------- */
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID
const GSI_SCRIPT_URL = 'https://accounts.google.com/gsi/client'

/* ---------- Shared script-load promise (insert <script> only once) ---------- */
let scriptLoadPromise = null

function loadGoogleScript() {
    if (!scriptLoadPromise) {
        scriptLoadPromise = new Promise((resolve, reject) => {
            if (window.google?.accounts) { resolve(); return }

            const existing = document.querySelector(`script[src="${GSI_SCRIPT_URL}"]`)
            if (existing) {
                existing.addEventListener('load', resolve)
                existing.addEventListener('error', () => { scriptLoadPromise = null; reject() })
                return
            }

            const script = document.createElement('script')
            script.src = GSI_SCRIPT_URL
            script.async = true
            script.defer = true
            script.onload = resolve
            script.onerror = () => { scriptLoadPromise = null; reject() }
            document.head.appendChild(script)
        })
    }
    return scriptLoadPromise
}

/* ---------- Hook ---------- */

export function useGoogleAuth(onSuccess, onError) {
    const [googleLoading, setGoogleLoading] = useState(false)
    const [isGoogleLoaded, setIsGoogleLoaded] = useState(false)
    const callbackRef = useRef(null)

    const isGoogleAvailable =
        !!GOOGLE_CLIENT_ID && GOOGLE_CLIENT_ID !== 'your-google-client-id-here'

    // Always keep callback ref current — avoids stale closure bugs
    callbackRef.current = async (response) => {
        if (!response?.credential) {
            onError?.('No credential received from Google. Please try again.')
            setGoogleLoading(false)
            return
        }
        setGoogleLoading(true)
        try {
            await onSuccess(response.credential)
        } catch (err) {
            onError?.(err?.response?.data?.message || 'Google sign-in failed. Please try again.')
        } finally {
            setGoogleLoading(false)
        }
    }

    // Load the Google Identity Services SDK once per session
    useEffect(() => {
        if (!isGoogleAvailable) return
        loadGoogleScript()
            .then(() => setIsGoogleLoaded(true))
            .catch(() => console.warn('[GoogleAuth] Failed to load Google Identity Services SDK.'))
    }, [isGoogleAvailable])

    /**
     * Render Google's real Sign-In button into `container`.
     *
     * The container should be positioned absolutely (opacity:0) on top of
     * your styled button so that the user's click hits Google's iframe directly.
     * Call this from a useEffect once `isGoogleLoaded` is true.
     */
    const setupGoogleButton = useCallback((container) => {
        if (!container || !isGoogleAvailable || !window.google?.accounts) return

        window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: (response) => callbackRef.current?.(response),
            auto_select: false,
            cancel_on_tap_outside: true,
        })

        window.google.accounts.id.renderButton(container, {
            type: 'standard',
            theme: 'outline',
            size: 'large',
            // Match the width of the parent (our styled button)
            width: container.parentElement?.offsetWidth || 400,
            logo_alignment: 'left',
        })
    }, [isGoogleAvailable])

    return { googleLoading, isGoogleAvailable, isGoogleLoaded, setupGoogleButton }
}
