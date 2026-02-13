/**
 * Blog routes  –  /api/blogs
 *
 * Public:
 *   GET  /                – List published blogs
 *   GET  /:slug           – Single blog by slug
 *
 * Admin (JWT):
 *   GET  /admin/stats     – Blog statistics
 *   POST /                – Create blog
 *   PUT  /:id             – Update blog
 *   DELETE /:id           – Delete blog
 */
const express = require('express')
const router = express.Router()
const blogController = require('../controllers/blogController')
const { authenticate } = require('../middleware/auth')

// Admin routes (require authentication) - MUST be before /:slug to avoid matching "admin" as slug
router.get('/admin/stats', authenticate, blogController.getBlogStats)

// Public routes
router.get('/', blogController.getAllBlogs)
router.get('/:slug', blogController.getBlogBySlug)

// Admin write routes
router.post('/', authenticate, blogController.createBlog)
router.put('/:id', authenticate, blogController.updateBlog)
router.delete('/:id', authenticate, blogController.deleteBlog)

module.exports = router
