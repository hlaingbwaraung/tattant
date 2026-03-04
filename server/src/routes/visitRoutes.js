/**
 * Visit Routes
 *
 *   POST /api/visits/track   – Record a page visit (public, optional auth)
 *   GET  /api/visits/stats   – Get visit statistics (admin only)
 */
const express = require('express')
const router = express.Router()
const visitController = require('../controllers/visitController')
const { authenticate, requireAdmin, optionalAuth } = require('../middleware/auth')

// Track a visit (works for anonymous + authenticated users)
router.post('/track', optionalAuth, visitController.recordVisit)

// Get visit stats (admin only)
router.get('/stats', authenticate, requireAdmin, visitController.getVisitStats)

module.exports = router
