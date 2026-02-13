/**
 * Favorite routes  –  /api/favorites  (all routes require JWT)
 *
 *   POST /save                 – Save a business to favourites
 *   DELETE /:businessId        – Remove from favourites
 *   GET  /                     – List all saved businesses
 *   GET  /check/:businessId    – Check if a business is saved
 */
const express = require('express')
const router = express.Router()
const favoriteController = require('../controllers/favoriteController')
const { authenticate } = require('../middleware/auth')

// All favorite routes require authentication
router.use(authenticate)

// Save a business to favorites
router.post('/save', favoriteController.saveBusiness)

// Remove a business from favorites
router.delete('/:businessId', favoriteController.unsaveBusiness)

// Get all saved businesses for current user
router.get('/', favoriteController.getSavedBusinesses)

// Check if a business is saved
router.get('/check/:businessId', favoriteController.checkIfSaved)

module.exports = router
