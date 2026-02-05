const express = require('express')
const router = express.Router()
const authController = require('../controllers/authController')
const { authenticate } = require('../middleware/auth')

// Public routes
router.post('/register', authController.register)
router.post('/login', authController.login)

// Protected routes
router.get('/me', authenticate, authController.getCurrentUser)
router.put('/profile', authenticate, authController.updateProfile)
router.put('/password', authenticate, authController.updatePassword)
router.delete('/account', authenticate, authController.deleteAccount)

module.exports = router
