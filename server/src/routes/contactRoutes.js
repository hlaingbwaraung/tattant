/**
 * Contact Message routes – /api/contact
 *
 * Authenticated:
 *   POST /             – Submit a contact message
 *   GET  /my           – Get current user's messages
 *
 * Admin only:
 *   GET  /all          – List all messages (with filters)
 *   PATCH /:messageId/read   – Mark as read
 *   PATCH /:messageId/reply  – Reply to a message
 *   DELETE /:messageId       – Delete a message
 */
const express = require('express')
const router = express.Router()
const controller = require('../controllers/contactController')
const { authenticate } = require('../middleware/auth')

router.use(authenticate)

// User routes
router.post('/', controller.submitMessage)
router.get('/my', controller.getMyMessages)

// Admin routes
router.get('/all', controller.getAllMessages)
router.patch('/:messageId/read', controller.markAsRead)
router.patch('/:messageId/reply', controller.replyToMessage)
router.delete('/:messageId', controller.deleteMessage)

module.exports = router
