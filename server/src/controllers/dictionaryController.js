/**
 * Dictionary Controller
 *
 * Proxies search requests to the Jisho.org Japanese dictionary API
 * so the browser doesn't hit CORS restrictions.
 */

/** Maximum number of results returned per search */
const MAX_RESULTS = 10

/** Timeout (ms) for the upstream Jisho API request */
const UPSTREAM_TIMEOUT_MS = 8000

/**
 * GET /api/dictionary/search?q=<keyword>
 *
 * @query {string} q – The Japanese or English word to look up
 * @returns {{ success: boolean, data: object[] }}
 */
exports.search = async (req, res) => {
  const query = (req.query.q || '').toString().trim()

  if (!query) {
    return res.status(400).json({ message: 'Query is required' })
  }

  const url = `https://jisho.org/api/v1/search/words?keyword=${encodeURIComponent(query)}`

  try {
    // Abort if the upstream doesn't respond in time
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS)

    const response = await fetch(url, {
      headers: { 'User-Agent': 'TattantDictionaryProxy/1.0 (+https://github.com/hlaingbwaraung)' },
      signal: controller.signal
    })

    clearTimeout(timeout)

    if (!response.ok) {
      throw new Error(`Upstream responded with status ${response.status}`)
    }

    const payload = await response.json()
    const results = Array.isArray(payload?.data)
      ? payload.data.slice(0, MAX_RESULTS)
      : []

    return res.json({ success: true, data: results })
  } catch (error) {
    console.error('Dictionary lookup failed:', error)

    // Distinguish timeout from other failures
    if (error.name === 'AbortError') {
      return res.status(504).json({ message: 'Dictionary lookup timed out' })
    }
    return res.status(502).json({ message: 'Dictionary lookup failed' })
  }
}
