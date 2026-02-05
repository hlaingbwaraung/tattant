const express = require('express')
const router = express.Router()
const businessController = require('../controllers/businessController')

// Get all businesses (with optional filters)
router.get('/', businessController.getAllBusinesses)

// Get single business by ID
router.get('/:id', businessController.getBusinessById)

module.exports = router
