/**
 * Booking Controller – CRUD operations for bookings.
 *
 * Shop owners can manage bookings for their own businesses.
 * Admin can view all bookings.
 *
 * Exports:
 *   getBookings, getBookingById, createBooking, updateBooking,
 *   deleteBooking, getBookingStats, getMonthlyStats
 */
const { Op } = require('sequelize')
const { Booking, Business } = require('../models')

/**
 * Verify that the business belongs to the requesting shop owner.
 * Returns the business if authorized, or sends a 403 response.
 */
async function verifyBusinessOwnership(businessId, userId, res) {
  const business = await Business.findByPk(businessId)
  if (!business) {
    res.status(404).json({ success: false, message: 'Business not found' })
    return null
  }
  if (business.owner_id !== userId) {
    res.status(403).json({ success: false, message: 'Access denied. This is not your business.' })
    return null
  }
  return business
}

/**
 * GET /api/bookings?business_id=&month=&year=&status=
 * Get bookings for a shop owner's businesses.
 */
exports.getBookings = async (req, res) => {
  try {
    const { business_id, month, year, status, date } = req.query

    // Get all business IDs owned by this user
    const ownedBusinesses = await Business.findAll({
      where: { owner_id: req.user.id },
      attributes: ['id']
    })
    const ownedIds = ownedBusinesses.map(b => b.id)

    if (ownedIds.length === 0) {
      return res.json({ success: true, data: [] })
    }

    // Build filter
    const where = { business_id: { [Op.in]: ownedIds } }

    if (business_id && ownedIds.includes(business_id)) {
      where.business_id = business_id
    }

    if (date) {
      where.booking_date = date
    } else if (month && year) {
      const startDate = `${year}-${String(month).padStart(2, '0')}-01`
      const endMonth = parseInt(month) === 12 ? 1 : parseInt(month) + 1
      const endYear = parseInt(month) === 12 ? parseInt(year) + 1 : parseInt(year)
      const endDate = `${endYear}-${String(endMonth).padStart(2, '0')}-01`
      where.booking_date = { [Op.gte]: startDate, [Op.lt]: endDate }
    }

    if (status) {
      where.status = status
    }

    const bookings = await Booking.findAll({
      where,
      include: [{ model: Business, as: 'business', attributes: ['id', 'name'] }],
      order: [['booking_date', 'ASC'], ['booking_time', 'ASC']]
    })

    res.json({ success: true, data: bookings })
  } catch (error) {
    console.error('Get bookings error:', error)
    res.status(500).json({ success: false, message: 'Server error fetching bookings' })
  }
}

/**
 * GET /api/bookings/:id
 */
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id, {
      include: [{ model: Business, as: 'business', attributes: ['id', 'name', 'owner_id'] }]
    })

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' })
    }

    // Verify ownership
    if (booking.business.owner_id !== req.user.id && !req.user.is_admin) {
      return res.status(403).json({ success: false, message: 'Access denied' })
    }

    res.json({ success: true, data: booking })
  } catch (error) {
    console.error('Get booking error:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
}

/**
 * POST /api/bookings
 */
exports.createBooking = async (req, res) => {
  try {
    const {
      business_id, customer_name, customer_email, customer_phone,
      booking_date, booking_time, end_time, service, notes,
      party_size, revenue, status
    } = req.body

    if (!business_id || !customer_name || !booking_date) {
      return res.status(400).json({
        success: false,
        message: 'business_id, customer_name, and booking_date are required'
      })
    }

    // Verify the business belongs to this shop owner
    const business = await verifyBusinessOwnership(business_id, req.user.id, res)
    if (!business) return

    const booking = await Booking.create({
      business_id,
      customer_name,
      customer_email: customer_email || null,
      customer_phone: customer_phone || null,
      booking_date,
      booking_time: booking_time || null,
      end_time: end_time || null,
      service: service || null,
      notes: notes || null,
      party_size: party_size || 1,
      revenue: revenue || 0,
      status: status || 'confirmed'
    })

    const created = await Booking.findByPk(booking.id, {
      include: [{ model: Business, as: 'business', attributes: ['id', 'name'] }]
    })

    res.status(201).json({ success: true, data: created })
  } catch (error) {
    console.error('Create booking error:', error)
    res.status(500).json({ success: false, message: 'Server error creating booking' })
  }
}

/**
 * PUT /api/bookings/:id
 */
exports.updateBooking = async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id, {
      include: [{ model: Business, as: 'business', attributes: ['id', 'name', 'owner_id'] }]
    })

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' })
    }

    if (booking.business.owner_id !== req.user.id && !req.user.is_admin) {
      return res.status(403).json({ success: false, message: 'Access denied' })
    }

    const allowedFields = [
      'customer_name', 'customer_email', 'customer_phone',
      'booking_date', 'booking_time', 'end_time', 'service',
      'notes', 'party_size', 'revenue', 'status'
    ]

    const updateData = {}
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field]
      }
    }

    await booking.update(updateData)

    const updated = await Booking.findByPk(booking.id, {
      include: [{ model: Business, as: 'business', attributes: ['id', 'name'] }]
    })

    res.json({ success: true, data: updated })
  } catch (error) {
    console.error('Update booking error:', error)
    res.status(500).json({ success: false, message: 'Server error updating booking' })
  }
}

/**
 * DELETE /api/bookings/:id
 */
exports.deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id, {
      include: [{ model: Business, as: 'business', attributes: ['id', 'owner_id'] }]
    })

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' })
    }

    if (booking.business.owner_id !== req.user.id && !req.user.is_admin) {
      return res.status(403).json({ success: false, message: 'Access denied' })
    }

    await booking.destroy()
    res.json({ success: true, message: 'Booking deleted successfully' })
  } catch (error) {
    console.error('Delete booking error:', error)
    res.status(500).json({ success: false, message: 'Server error deleting booking' })
  }
}

/**
 * POST /api/businesses/:id/book
 * Public booking – any authenticated user can book at a business.
 */
exports.createPublicBooking = async (req, res) => {
  try {
    const { id } = req.params
    const {
      customer_name, customer_email, customer_phone,
      booking_date, booking_time, service, notes, party_size
    } = req.body || {}

    if (!customer_name || !booking_date) {
      return res.status(400).json({
        success: false,
        message: 'Name and booking date are required'
      })
    }

    const business = await Business.findByPk(id)
    if (!business) {
      return res.status(404).json({ success: false, message: 'Business not found' })
    }
    if (!business.is_active) {
      return res.status(400).json({ success: false, message: 'This business is not accepting bookings' })
    }

    // Booking is a Premier Shop Owner feature: only businesses owned by a premier owner accept bookings
    if (business.owner_id) {
      const { User } = require('../models')
      const owner = await User.findByPk(business.owner_id, { attributes: ['premium_type'] })
      if (!owner || owner.premium_type !== 'premier') {
        return res.status(403).json({
          success: false,
          message: 'This business does not accept online bookings.',
          code: 'NOT_PREMIER_BUSINESS'
        })
      }
    } else {
      return res.status(403).json({
        success: false,
        message: 'This business does not accept online bookings.',
        code: 'NOT_PREMIER_BUSINESS'
      })
    }

    const booking = await Booking.create({
      business_id: id,
      user_id: req.user.id,
      customer_name,
      customer_email: customer_email || null,
      customer_phone: customer_phone || null,
      booking_date,
      booking_time: booking_time || null,
      service: service || null,
      notes: notes || null,
      party_size: party_size || 1,
      revenue: 0,
      status: 'pending'
    })

    res.status(201).json({
      success: true,
      message: 'Booking submitted successfully! The shop owner will confirm your reservation.',
      data: {
        id: booking.id,
        business_name: business.name,
        booking_date: booking.booking_date,
        booking_time: booking.booking_time,
        status: booking.status
      }
    })
  } catch (error) {
    console.error('Create public booking error:', error)
    res.status(500).json({ success: false, message: 'Server error creating booking' })
  }
}

/**
 * GET /api/bookings/stats/overview
 * Monthly stats: total customers, total revenue, booking counts by status.
 */
exports.getBookingStats = async (req, res) => {
  try {
    const { sequelize } = require('../config/database')

    // Get all business IDs owned by this user
    const ownedBusinesses = await Business.findAll({
      where: { owner_id: req.user.id },
      attributes: ['id']
    })
    const ownedIds = ownedBusinesses.map(b => b.id)

    if (ownedIds.length === 0) {
      return res.json({
        success: true,
        data: {
          totalBookings: 0, totalRevenue: 0, totalCustomers: 0,
          todayBookings: 0, pendingBookings: 0, completedBookings: 0,
          cancelledBookings: 0
        }
      })
    }

    const where = { business_id: { [Op.in]: ownedIds } }
    const today = new Date().toISOString().split('T')[0]

    const [
      totalBookings,
      totalRevenue,
      todayBookings,
      pendingBookings,
      completedBookings,
      confirmedBookings,
      cancelledBookings
    ] = await Promise.all([
      Booking.count({ where }),
      Booking.sum('revenue', { where }) || 0,
      Booking.count({ where: { ...where, booking_date: today } }),
      Booking.count({ where: { ...where, status: 'pending' } }),
      Booking.count({ where: { ...where, status: 'completed' } }),
      Booking.count({ where: { ...where, status: 'confirmed' } }),
      Booking.count({ where: { ...where, status: 'cancelled' } })
    ])

    // Unique customers by name
    const uniqueCustomers = await Booking.count({
      where,
      distinct: true,
      col: 'customer_name'
    })

    res.json({
      success: true,
      data: {
        totalBookings,
        totalRevenue: totalRevenue || 0,
        totalCustomers: uniqueCustomers,
        todayBookings,
        pendingBookings,
        confirmedBookings,
        completedBookings,
        cancelledBookings
      }
    })
  } catch (error) {
    console.error('Get booking stats error:', error)
    res.status(500).json({ success: false, message: 'Server error fetching stats' })
  }
}

/**
 * GET /api/bookings/stats/monthly?year=
 * Monthly breakdown: customers + revenue per month for the given year.
 */
exports.getMonthlyStats = async (req, res) => {
  try {
    const { sequelize } = require('../config/database')
    const year = req.query.year || new Date().getFullYear()

    const ownedBusinesses = await Business.findAll({
      where: { owner_id: req.user.id },
      attributes: ['id']
    })
    const ownedIds = ownedBusinesses.map(b => b.id)

    if (ownedIds.length === 0) {
      return res.json({
        success: true,
        data: Array.from({ length: 12 }, (_, i) => ({
          month: i + 1, customers: 0, revenue: 0, bookings: 0
        }))
      })
    }

    // Raw query for monthly aggregation
    const results = await sequelize.query(`
      SELECT
        EXTRACT(MONTH FROM booking_date) as month,
        COUNT(*) as bookings,
        COUNT(DISTINCT customer_name) as customers,
        COALESCE(SUM(revenue), 0) as revenue
      FROM bookings
      WHERE business_id IN (:businessIds)
        AND EXTRACT(YEAR FROM booking_date) = :year
        AND status NOT IN ('cancelled')
      GROUP BY EXTRACT(MONTH FROM booking_date)
      ORDER BY month
    `, {
      replacements: { businessIds: ownedIds, year: parseInt(year) },
      type: sequelize.QueryTypes.SELECT
    })

    // Fill in all 12 months
    const monthlyData = Array.from({ length: 12 }, (_, i) => {
      const found = results.find(r => parseInt(r.month) === i + 1)
      return {
        month: i + 1,
        bookings: found ? parseInt(found.bookings) : 0,
        customers: found ? parseInt(found.customers) : 0,
        revenue: found ? parseFloat(found.revenue) : 0
      }
    })

    res.json({ success: true, data: monthlyData })
  } catch (error) {
    console.error('Get monthly stats error:', error)
    res.status(500).json({ success: false, message: 'Server error fetching monthly stats' })
  }
}

/**
 * GET /api/bookings/my-bookings
 * Get bookings made by the current user (customer perspective).
 */
exports.getUserBookings = async (req, res) => {
  try {
    const { status } = req.query

    const where = { user_id: req.user.id }

    if (status) {
      where.status = status
    }

    const bookings = await Booking.findAll({
      where,
      include: [{ model: Business, as: 'business', attributes: ['id', 'name', 'address', 'phone'] }],
      order: [['booking_date', 'DESC'], ['booking_time', 'DESC']]
    })

    res.json({ success: true, data: bookings })
  } catch (error) {
    console.error('Get user bookings error:', error)
    res.status(500).json({ success: false, message: 'Server error fetching your bookings' })
  }
}
