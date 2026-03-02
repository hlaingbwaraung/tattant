/**
 * Booking routes – /api/bookings (all routes require JWT)
 *
 *   GET    /                   – List bookings (filter by business, month, status)
 *   GET    /my-bookings        – Get current user's bookings (customer perspective)
 *   GET    /stats/overview     – Overview stats (total customers, revenue, etc.)
 *   GET    /stats/monthly      – Monthly breakdown (customers + revenue per month)
 *   GET    /:id                – Get single booking
 *   POST   /                   – Create booking
 *   PUT    /:id                – Update booking
 *   DELETE /:id                – Delete booking
 */
const express = require('express')
const router = express.Router()
const bookingController = require('../controllers/bookingController')
const { authenticate, requirePremierShopOwner } = require('../middleware/auth')

// All booking routes require authentication
router.use(authenticate)

// Customer-only route: view own bookings (any authenticated user)
router.get('/my-bookings', bookingController.getUserBookings)

// All remaining booking management routes require Premier Shop Owner status
router.get('/stats/overview', requirePremierShopOwner, bookingController.getBookingStats)
router.get('/stats/monthly', requirePremierShopOwner, bookingController.getMonthlyStats)

// CRUD (Premier Shop Owner only)
router.get('/', requirePremierShopOwner, bookingController.getBookings)
router.get('/:id', requirePremierShopOwner, bookingController.getBookingById)
router.post('/', requirePremierShopOwner, bookingController.createBooking)
router.put('/:id', requirePremierShopOwner, bookingController.updateBooking)
router.delete('/:id', requirePremierShopOwner, bookingController.deleteBooking)

module.exports = router
