/**
 * Shop Owner Request routes – /api/shop-owner-requests
 *
 * Public (auth required):
 *   POST /                    – Submit a shop owner request
 *   GET  /my                  – Get current user's requests
 *
 * Admin only:
 *   GET  /                    – List all requests
 *   PATCH /:requestId/approve – Approve request
 *   PATCH /:requestId/reject  – Reject request
 */
const express = require('express')
const router = express.Router()
const controller = require('../controllers/shopOwnerRequestController')
const { authenticate } = require('../middleware/auth')

router.use(authenticate)

// User routes
router.post('/', controller.submitRequest)
router.get('/my', controller.getMyRequest)

// Admin routes
router.get('/all', controller.getAllRequests)
router.patch('/:requestId/approve', controller.approveRequest)
router.patch('/:requestId/reject', controller.rejectRequest)

module.exports = router
