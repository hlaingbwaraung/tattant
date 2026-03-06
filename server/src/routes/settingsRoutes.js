/**
 * Settings routes  –  /api/settings
 *
 *   GET    /                     – Get all settings (public)
 *   GET    /:key                 – Get single setting (public)
 *   PUT    /:key                 – Update a setting (admin, requires JWT)
 */
const express = require('express')
const router = express.Router()
const settingsController = require('../controllers/settingsController')
const { authenticate } = require('../middleware/auth')

// Public – anyone can read settings (needed by navbar)
router.get('/', settingsController.getAllSettings)
router.get('/:key', settingsController.getSetting)

// Admin only – update
router.put('/:key', authenticate, settingsController.updateSetting)

module.exports = router
