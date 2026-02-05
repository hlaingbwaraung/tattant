const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
require('dotenv').config()

const { sequelize, testConnection } = require('./config/database')

const app = express()
const PORT = process.env.PORT || 5000

// Security middleware
app.use(helmet())

// CORS configuration
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true
}))

// Body parsing middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
})

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'development' ? 100 : 5, // More lenient in development
  message: 'Too many authentication attempts, please try again later.'
})

app.use('/api/', limiter)
app.use('/api/auth/login', authLimiter)
app.use('/api/auth/register', authLimiter)

// Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' })
})

// API routes
app.use('/api/auth', require('./routes/authRoutes'))
app.use('/api/categories', require('./routes/categoryRoutes'))
app.use('/api/businesses', require('./routes/businessRoutes'))
app.use('/api/favorites', require('./routes/favoriteRoutes'))
app.use('/api/admin', require('./routes/adminRoutes'))
// app.use('/api/favorites', require('./routes/favoriteRoutes'))

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error',
    data: null
  })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    data: null
  })
})

// Start server
const startServer = async () => {
  try {
    await testConnection()

    app.listen(PORT, () => {
      console.log(`✓ Server is running on port ${PORT}`)
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
