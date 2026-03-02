/**
 * Shop-owner routes  –  /api/shop-owner  (all routes require JWT)
 *
 *   GET  /stats                  – Dashboard statistics
 *   GET  /businesses             – Owner’s businesses
 *   PUT  /businesses/:id         – Update own business
 *   GET  /coupons                – Owner’s coupons
 *   POST /coupons                – Create coupon
 *   PUT  /coupons/:id            – Update coupon
 *   DELETE /coupons/:id          – Delete coupon
 *   GET  /businesses/:businessId/menu   – Get menu items
 *   POST /businesses/:businessId/menu   – Create menu item
 *   PUT  /businesses/:businessId/menu/:itemId  – Update menu item
 *   DELETE /businesses/:businessId/menu/:itemId – Delete menu item
 */
const express = require('express')
const router = express.Router()
const shopOwnerController = require('../controllers/shopOwnerController')
const couponController = require('../controllers/couponController')
const menuItemController = require('../controllers/menuItemController')
const { authenticate } = require('../middleware/auth')

// All shop owner routes require authentication
router.use(authenticate)

// Dashboard stats
router.get('/stats', shopOwnerController.getDashboardStats)

// My businesses
router.get('/businesses', shopOwnerController.getMyBusinesses)
router.put('/businesses/:id', shopOwnerController.updateMyBusiness)

// My coupons
router.get('/coupons', couponController.getOwnerCoupons)
router.post('/coupons', couponController.createCoupon)
router.put('/coupons/:id', couponController.updateCoupon)
router.delete('/coupons/:id', couponController.deleteCoupon)

// Menu items
router.get('/businesses/:businessId/menu', menuItemController.getMenuItems)
router.post('/businesses/:businessId/menu', menuItemController.createMenuItem)
router.put('/businesses/:businessId/menu/:itemId', menuItemController.updateMenuItem)
router.delete('/businesses/:businessId/menu/:itemId', menuItemController.deleteMenuItem)

module.exports = router
