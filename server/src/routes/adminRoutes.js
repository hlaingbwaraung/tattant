/**
 * Admin routes  –  /api/admin  (all routes require JWT)
 *
 *   GET    /users                    – List all users
 *   GET    /stats                    – User statistics
 *   PATCH  /users/:userId/admin      – Toggle admin flag
 *   PATCH  /users/:userId/premium    – Toggle premium flag
 *   PATCH  /users/:userId/password   – Reset user password
 *   DELETE /users/:userId            – Delete user
 */
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

// Toggle user premium status
router.patch('/users/:userId/premium', adminController.togglePremiumStatus)

// Reset user password
router.patch('/users/:userId/password', adminController.resetUserPassword)

// Delete user
router.delete('/users/:userId', adminController.deleteUser)

module.exports = router
