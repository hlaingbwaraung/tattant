/**
 * Express Application Entry Point
 *
 * Sets up middleware (security, CORS, rate-limiting),
 * registers all API route modules, and starts the HTTP server.
 */

const path = require('path')
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const compression = require('compression')
const rateLimit = require('express-rate-limit')
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') })

const { testConnection } = require('./config/database')

const app = express()
const PORT = process.env.PORT || 5000

// Trust nginx reverse proxy (required for express-rate-limit behind proxy)
app.set('trust proxy', 1)

/* ========================================
 *  1. Performance: Compression
 * ======================================== */
app.use(compression({
  level: 6,                          // Good balance of speed vs compression
  threshold: 1024,                   // Only compress responses > 1KB
  filter: (req, res) => {
    if (req.headers['x-no-compression']) return false
    return compression.filter(req, res)
  }
}))

/* ========================================
 *  2. Security & Parsing Middleware
 * ======================================== */
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' }
}))                                               // HTTP security headers
app.use(express.json({ limit: '25mb' }))          // Parse JSON request bodies (25mb for photo uploads)
app.use(express.urlencoded({ extended: true, limit: '25mb' }))   // Parse URL-encoded bodies

/* ========================================
 *  2. CORS – allowed front-end origins
 * ======================================== */
const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'http://127.0.0.1:5175',
  'https://tattant.com',
  'https://www.tattant.com',
  process.env.FRONTEND_URL
].filter(Boolean)

app.use(cors({ origin: ALLOWED_ORIGINS, credentials: true }))

/* ========================================
 *  3. Rate Limiting
 * ======================================== */

// General API limiter – relaxed in dev, strict in prod
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'development' ? 1000 : 100,
  message: 'Too many requests from this IP, please try again later.'
})

// Stricter limiter for login / register (5 in prod, 100 in dev)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'development' ? 100 : 20,
  message: 'Too many authentication attempts, please try again later.'
})

app.use('/api/', apiLimiter)
app.use('/api/auth/login', authLimiter)
app.use('/api/auth/register', authLimiter)

/* ========================================
 *  4. Health Check
 * ======================================== */
app.get('/health', (_req, res) => {
  res.json({ status: 'OK', message: 'Server is running' })
})

/* ========================================
 *  4b. Cache Headers for Public GET Endpoints
 * ======================================== */
const cachePublicGET = (duration = 300) => (req, res, next) => {
  if (req.method === 'GET') {
    res.set('Cache-Control', `public, max-age=${duration}, stale-while-revalidate=${duration * 2}`)
  }
  next()
}

// Cache categories & businesses lists for 5 minutes
app.use('/api/categories', cachePublicGET(300))
app.use('/api/businesses', cachePublicGET(120))
app.use('/api/blogs', cachePublicGET(300))
app.use('/api/settings', cachePublicGET(600))

/* ========================================
 *  5. API Routes
 * ======================================== */
app.use('/api/auth', require('./routes/authRoutes'))
app.use('/api/categories', require('./routes/categoryRoutes'))
app.use('/api/businesses', require('./routes/businessRoutes'))
app.use('/api/favorites', require('./routes/favoriteRoutes'))
app.use('/api/admin', require('./routes/adminRoutes'))
app.use('/api/blogs', require('./routes/blogRoutes'))
app.use('/api/coupons', require('./routes/couponRoutes'))
app.use('/api/shop-owner', require('./routes/shopOwnerRoutes'))
app.use('/api/shop-owner-requests', require('./routes/shopOwnerRequestRoutes'))
app.use('/api/quiz', require('./routes/quizRoutes'))
app.use('/api/points', require('./routes/pointsRoutes'))
app.use('/api/dictionary', require('./routes/dictionaryRoutes'))
app.use('/api/bookings', require('./routes/bookingRoutes'))
app.use('/api/chat', require('./routes/chatRoutes'))
app.use('/api/contact', require('./routes/contactRoutes'))
app.use('/api/visits', require('./routes/visitRoutes'))
app.use('/api/settings', require('./routes/settingsRoutes'))
app.use('/api/ai-search', require('./routes/aiSearchRoutes'))

/* ========================================
 *  6. Error Handling
 * ======================================== */

// Global error handler – catches errors thrown in route handlers
app.use((err, _req, res, _next) => {
  console.error(err.stack)
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error',
    data: null
  })
})

// 404 – no route matched
app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'Route not found', data: null })
})

/* ========================================
 *  7. Bootstrap
 * ======================================== */
const startServer = async () => {
  try {
    await testConnection()
    app.listen(PORT, () => {
      console.log(`✓ Server running on port ${PORT}`)
      console.log(`✓ Environment: ${process.env.NODE_ENV}`)
      console.log(`✓ Frontend URL: ${process.env.FRONTEND_URL}`)
    })
  } catch (error) {
    console.error('✗ Failed to start server:', error)
    process.exit(1)
  }
}

startServer()

module.exports = app
