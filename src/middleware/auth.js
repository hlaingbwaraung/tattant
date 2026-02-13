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
