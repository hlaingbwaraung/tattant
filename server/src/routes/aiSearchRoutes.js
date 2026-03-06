/**
 * AI Deep Search routes  –  /api/ai-search  (admin only, JWT required)
 *
 *   POST  /search   – Run AI deep search for restaurants
 *   POST  /import   – Import selected results into businesses
 */
const express = require('express')
const router = express.Router()
const aiSearchController = require('../controllers/aiSearchController')
const { authenticate } = require('../middleware/auth')

router.use(authenticate)

router.post('/search', aiSearchController.search)
router.post('/import', aiSearchController.importResults)

module.exports = router
