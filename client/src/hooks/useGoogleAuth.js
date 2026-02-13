/**
 * useGoogleAuth Hook
 *
 * Handles the Google Sign-In flow:
 *  1. Lazy-loads the Google Identity Services SDK
 *  2. Initialises the client with the app's GOOGLE_CLIENT_ID
 *  3. Exposes `triggerGoogleSignIn()` to programmatically open
 *     the Google sign-in popup
 *
 * Usage:
 *   const { triggerGoogleSignIn, googleLoading, isGoogleAvailable } =
 *     useGoogleAuth(onCredentialReceived, onError)
 */

import { useState, useEffect, useRef } from 'react'

/* ---------- Constants ---------- */
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID
const GSI_SCRIPT_URL = 'https://accounts.google.com/gsi/client'
const LOADING_TIMEOUT = 30_000

/* ---------- Shared (module-level) state ---------- */
let googleInitPromise = null
let isInitialized = false
let isGoogleLoadedGlobal = false

/* ---------- Internal helpers ---------- */

function loadGoogleScript() {
    return new Promise((resolve, reject) => {
        if (window.google?.accounts) { resolve(); return }

        const existing = document.querySelector(`script[src="${GSI_SCRIPT_URL}"]`)
        if (existing) {
            existing.addEventListener('load', resolve)
            existing.addEventListener('error', reject)
            return
        }

        const script = document.createElement('script')
        script.src = GSI_SCRIPT_URL
        script.async = true
        script.defer = true
        script.onload = resolve
        script.onerror = reject
        document.head.appendChild(script)
    })
}

async function initGoogle() {
    if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID === 'your-google-client-id-here') {
        console.warn('Google Client ID not configured. Set VITE_GOOGLE_CLIENT_ID in .env')
        return false
    }

    if (!googleInitPromise) {
        googleInitPromise = loadGoogleScript()
            .then(() => { isGoogleLoadedGlobal = true; return true })
            .catch((err) => {
                console.error('Failed to load Google Sign-In SDK:', err)
                isGoogleLoadedGlobal = false
                return false
            })
    }
    return googleInitPromise
}

/* ---------- Hook ---------- */

export function useGoogleAuth(onSuccess, onError) {
    const [googleLoading, setGoogleLoading] = useState(false)
    const [isGoogleAvailable] = useState(
        !!GOOGLE_CLIENT_ID && GOOGLE_CLIENT_ID !== 'your-google-client-id-here'
    )
    const [isGoogleLoaded, setIsGoogleLoaded] = useState(isGoogleLoadedGlobal)
    const callbackRef = useRef(null)

    // Keep callback ref current
    callbackRef.current = async (response) => {
        if (!response.credential) {
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

    useEffect(() => {
        const init = async () => {
            await initGoogle()
            setIsGoogleLoaded(isGoogleLoadedGlobal)

            if (!isInitialized && window.google?.accounts) {
                window.google.accounts.id.initialize({
                    client_id: GOOGLE_CLIENT_ID,
                    callback: (response) => callbackRef.current?.(response),
                    auto_select: false,
                    cancel_on_tap_outside: true,
                    use_fedcm_for_prompt: true
                })
                isInitialized = true
            }
        }
        init()
    }, [])

    const triggerGoogleSignIn = () => {
        if (!isGoogleLoadedGlobal || !window.google?.accounts) {
            onError?.('Google Sign-In is not available. Please try again later.')
            return
        }

        if (!isInitialized && window.google?.accounts) {
            window.google.accounts.id.initialize({
                client_id: GOOGLE_CLIENT_ID,
                callback: (response) => callbackRef.current?.(response),
                auto_select: false,
                cancel_on_tap_outside: true,
                use_fedcm_for_prompt: true
            })
            isInitialized = true
        }

        setGoogleLoading(true)

        const hiddenContainer = document.createElement('div')
        hiddenContainer.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0;pointer-events:none;'
        document.body.appendChild(hiddenContainer)

        window.google.accounts.id.renderButton(hiddenContainer, {
            type: 'standard',
            size: 'large',
            text: 'signin_with'
        })

        setTimeout(() => {
            const clickTarget =
                hiddenContainer.querySelector('div[role="button"]') ||
                hiddenContainer.querySelector('iframe') ||
                hiddenContainer.firstElementChild
            clickTarget?.click()

            setTimeout(() => {
                if (document.body.contains(hiddenContainer)) {
                    document.body.removeChild(hiddenContainer)
                }
                setTimeout(() => { setGoogleLoading(false) }, LOADING_TIMEOUT)
            }, 500)
        }, 300)
    }

    return {
        googleLoading,
        isGoogleAvailable,
        isGoogleLoaded,
        triggerGoogleSignIn
    }
}
