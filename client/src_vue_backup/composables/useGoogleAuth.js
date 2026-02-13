/**
 * useGoogleAuth Composable
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

import { ref, onMounted } from 'vue'

/* ---------- Constants ---------- */
const GOOGLE_CLIENT_ID  = import.meta.env.VITE_GOOGLE_CLIENT_ID
const GSI_SCRIPT_URL    = 'https://accounts.google.com/gsi/client'
const LOADING_TIMEOUT   = 30_000  // reset loading flag after 30 s

/* ---------- Shared (module-level) state ---------- */
const isGoogleLoaded    = ref(false)
const isGoogleAvailable = ref(!!GOOGLE_CLIENT_ID && GOOGLE_CLIENT_ID !== 'your-google-client-id-here')

let googleInitPromise = null   // singleton promise for script load
let isInitialized     = false  // whether google.accounts.id.initialize has been called
let credentialCallback = null  // set by each composable consumer

/* ---------- Internal helpers ---------- */

/**
 * Inject the Google Identity Services <script> tag into <head>
 * (if not already present). Returns a promise that resolves on load.
 */
function loadGoogleScript() {
  return new Promise((resolve, reject) => {
    // Already loaded by a previous call
    if (window.google?.accounts) { resolve(); return }

    // Script tag already in the DOM but still loading
    const existing = document.querySelector(`script[src="${GSI_SCRIPT_URL}"]`)
    if (existing) {
      existing.addEventListener('load',  resolve)
      existing.addEventListener('error', reject)
      return
    }

    // Create a new <script>
    const script  = document.createElement('script')
    script.src    = GSI_SCRIPT_URL
    script.async  = true
    script.defer  = true
    script.onload  = resolve
    script.onerror = reject
    document.head.appendChild(script)
  })
}

/**
 * Load the SDK script (once) and flip the `isGoogleLoaded` flag.
 */
async function initGoogle() {
  if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID === 'your-google-client-id-here') {
    console.warn('Google Client ID not configured. Set VITE_GOOGLE_CLIENT_ID in .env')
    isGoogleAvailable.value = false
    return
  }

  if (!googleInitPromise) {
    googleInitPromise = loadGoogleScript()
      .then(() => { isGoogleLoaded.value = true })
      .catch((err) => {
        console.error('Failed to load Google Sign-In SDK:', err)
        isGoogleLoaded.value = false
      })
  }
  return googleInitPromise
}

/**
 * Call `google.accounts.id.initialize()` exactly once.
 */
function ensureInitialized() {
  if (!isInitialized && window.google?.accounts) {
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: (response) => credentialCallback?.(response),
      auto_select: false,
      cancel_on_tap_outside: true,
      use_fedcm_for_prompt: true
    })
    isInitialized = true
  }
}

/* ---------- Composable ---------- */

/**
 * @param {(credential: string) => Promise<void>} onSuccess
 *   Called with the Google credential string after a successful sign-in
 * @param {(msg: string) => void} [onError]
 *   Called when something goes wrong
 */
export function useGoogleAuth(onSuccess, onError) {
  const googleLoading = ref(false)

  // Load the SDK as soon as the consuming component mounts
  onMounted(async () => {
    await initGoogle()
    ensureInitialized()
  })

  // Wire up the credential callback for this consumer
  credentialCallback = async (response) => {
    if (!response.credential) {
      onError?.('No credential received from Google. Please try again.')
      googleLoading.value = false
      return
    }

    googleLoading.value = true
    try {
      await onSuccess(response.credential)
    } catch (err) {
      onError?.(err?.response?.data?.message || 'Google sign-in failed. Please try again.')
    } finally {
      googleLoading.value = false
    }
  }

  /**
   * Programmatically opens the Google sign-in dialog by rendering
   * a hidden button and clicking it (required by the GSI SDK).
   */
  const triggerGoogleSignIn = () => {
    if (!isGoogleLoaded.value || !window.google?.accounts) {
      onError?.('Google Sign-In is not available. Please try again later.')
      return
    }

    ensureInitialized()
    googleLoading.value = true

    // Create an invisible container for the Google-rendered button
    const hiddenContainer = document.createElement('div')
    hiddenContainer.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0;pointer-events:none;'
    document.body.appendChild(hiddenContainer)

    window.google.accounts.id.renderButton(hiddenContainer, {
      type: 'standard',
      size: 'large',
      text: 'signin_with'
    })

    // Wait for the iframe to render, then simulate a click
    setTimeout(() => {
      const clickTarget =
        hiddenContainer.querySelector('div[role="button"]') ||
        hiddenContainer.querySelector('iframe') ||
        hiddenContainer.firstElementChild
      clickTarget?.click()

      // Clean up the hidden container
      setTimeout(() => {
        if (document.body.contains(hiddenContainer)) {
          document.body.removeChild(hiddenContainer)
        }
        // Safety: reset loading state if nothing happens
        setTimeout(() => { googleLoading.value = false }, LOADING_TIMEOUT)
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

