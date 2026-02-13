/**
 * Category routes  –  /api/categories
 *
 * Public:
 *   GET  /              – List all categories
 *   GET  /:slug         – Category detail by slug
 *
 * Admin (JWT):
 *   GET  /admin/stats   – Category statistics
 *   POST /              – Create category
 *   PUT  /:id           – Update category
 *   DELETE /:id         – Delete category
 */
const express = require('express')
const router = express.Router()
const categoryController = require('../controllers/categoryController')
const { authenticate } = require('../middleware/auth')

// Admin stats (before /:slug to avoid matching "admin" as slug)
router.get('/admin/stats', authenticate, categoryController.getCategoryStats)

// Public routes
router.get('/', categoryController.getAllCategories)
router.get('/:slug', categoryController.getCategoryBySlug)

// Admin write routes
router.post('/', authenticate, categoryController.createCategory)
router.put('/:id', authenticate, categoryController.updateCategory)
router.delete('/:id', authenticate, categoryController.deleteCategory)

module.exports = router
