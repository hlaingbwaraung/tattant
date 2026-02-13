/**
 * Business routes  –  /api/businesses
 *
 * Public:
 *   GET  /                      – List businesses (filter by category)
 *   GET  /:id                   – Single business detail
 *
 * Admin (JWT):
 *   GET  /admin/stats           – Business statistics
 *   POST /                      – Create business
 *   PUT  /:id                   – Update business
 *   DELETE /:id                 – Delete business
 *   PATCH /:id/toggle-active    – Toggle active flag
 */
const express = require('express')
const router = express.Router()
const businessController = require('../controllers/businessController')
const { authenticate } = require('../middleware/auth')

// Admin stats (before /:id to avoid matching "admin" as id)
router.get('/admin/stats', authenticate, businessController.getBusinessStats)

// Public routes
router.get('/', businessController.getAllBusinesses)
router.get('/:id', businessController.getBusinessById)

// Admin write routes
router.post('/', authenticate, businessController.createBusiness)
router.put('/:id', authenticate, businessController.updateBusiness)
router.delete('/:id', authenticate, businessController.deleteBusiness)
router.patch('/:id/toggle-active', authenticate, businessController.toggleBusinessActive)

module.exports = router
