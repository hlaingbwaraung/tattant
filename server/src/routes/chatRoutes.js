/**
 * Chat Routes – AI-Powered Chat Assistant
 */

const express = require('express')
const router = express.Router()
const chatController = require('../controllers/chatController')

// POST /api/chat – Send a message to the AI assistant
router.post('/', chatController.sendMessage)

module.exports = router
