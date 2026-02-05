const express = require('express')
const router = express.Router()
const adminController = require('../controllers/adminController')
const { authenticate } = require('../middleware/auth')

// All admin routes require authentication
router.use(authenticate)

// Get all users
router.get('/users', adminController.getAllUsers)

// Get user statistics
router.get('/stats', adminController.getUserStats)

// Toggle user admin status
router.patch('/users/:userId/admin', adminController.toggleAdminStatus)

// Delete user
router.delete('/users/:userId', adminController.deleteUser)

module.exports = router
