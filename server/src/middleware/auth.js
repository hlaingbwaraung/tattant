/**
 * Authentication Middleware
 *
 * Extracts and verifies the JWT from the "Authorization: Bearer <token>" header.
 * On success, populates `req.user` with the decoded token payload
 * (id, email, is_admin, is_shop_owner, is_premium).
 */

const jwt = require('jsonwebtoken')

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production'

/**
 * Middleware: require a valid JWT to proceed.
 * Responds with 401 if the token is missing, invalid, or expired.
 */
exports.authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    const token = authHeader?.split(' ')[1]  // "Bearer <token>"

    if (!token) {
      return res.status(401).json({ message: 'Authentication required' })
    }

    // Verify signature & expiry, then attach payload to request
    req.user = jwt.verify(token, JWT_SECRET)
    next()
  } catch (_error) {
    return res.status(401).json({ message: 'Invalid or expired token' })
  }
}

/**
 * Middleware: require admin privileges.
 * Must be used after `authenticate`.
 */
exports.requireAdmin = (req, res, next) => {
  if (!req.user?.is_admin) {
    return res.status(403).json({ message: 'Access denied. Admin only.' })
  }
  next()
}

/**
 * Middleware: optionally authenticate.
 * If a valid JWT is present, populates req.user. Otherwise continues without error.
 */
exports.optionalAuth = (req, _res, next) => {
  try {
    const authHeader = req.headers.authorization
    const token = authHeader?.split(' ')[1]
    if (token) {
      req.user = jwt.verify(token, JWT_SECRET)
    }
  } catch (_error) {
    // Token invalid or expired – treat as anonymous
    req.user = null
  }
  next()
}

/**
 * Middleware: require shop-owner privileges.
 * Must be used after `authenticate`.
 */
exports.requireShopOwner = (req, res, next) => {
  if (!req.user?.is_shop_owner) {
    return res.status(403).json({ message: 'Access denied. Shop owners only.' })
  }
  next()
}

/**
 * Middleware: require Premier Shop Owner status.
 * Premier = is_shop_owner AND premium_type === 'premier'.
 * Must be used after `authenticate`.
 *
 * Booking management is a Premier-only feature.
 */
exports.requirePremierShopOwner = (req, res, next) => {
  if (!req.user?.is_shop_owner) {
    return res.status(403).json({ message: 'Access denied. Shop owners only.' })
  }
  if (req.user?.premium_type !== 'premier') {
    return res.status(403).json({
      message: 'Premier Shop Owner required.',
      code: 'PREMIER_REQUIRED',
      upgrade_url: '/shop-owner/upgrade'
    })
  }
  next()
}
