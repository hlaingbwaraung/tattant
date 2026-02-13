/**
 * Coupon controller  –  CRUD for discount coupons.
 *
 * Public:      getBusinessCoupons
 * Admin/Owner: getAllCoupons, getOwnerCoupons,
 *              createCoupon, updateCoupon, deleteCoupon
 */
const { Coupon, Business } = require('../models')
const { Op } = require('sequelize')

// Get coupons for a business (public)
exports.getBusinessCoupons = async (req, res) => {
  try {
    const { businessId } = req.params

    const coupons = await Coupon.findAll({
      where: {
        business_id: businessId,
        is_active: true,
        [Op.or]: [
          { end_date: null },
          { end_date: { [Op.gte]: new Date() } }
        ]
      },
      order: [['created_at', 'DESC']]
    })

    res.json({ success: true, data: coupons })
  } catch (error) {
    console.error('Get business coupons error:', error)
    res.status(500).json({ message: 'Server error fetching coupons' })
  }
}

// Get all coupons (admin)
exports.getAllCoupons = async (req, res) => {
  try {
    if (!req.user.is_admin) {
      return res.status(403).json({ message: 'Access denied. Admin only.' })
    }

    const coupons = await Coupon.findAll({
      include: [{ model: Business, as: 'business', attributes: ['id', 'name'] }],
      order: [['created_at', 'DESC']]
    })

    res.json({ success: true, data: coupons })
  } catch (error) {
    console.error('Get all coupons error:', error)
    res.status(500).json({ message: 'Server error fetching coupons' })
  }
}

// Create coupon (admin or shop owner)
exports.createCoupon = async (req, res) => {
  try {
    const { business_id, code, title, description, discount_type, discount_value, min_purchase, max_uses, start_date, end_date, points_cost } = req.body

    if (!business_id || !code || !title) {
      return res.status(400).json({ message: 'Missing required fields: business_id, code, title' })
    }

    // Verify the business exists
    const business = await Business.findByPk(business_id)
    if (!business) {
      return res.status(404).json({ message: 'Business not found' })
    }

    // Check authorization: must be admin or the business owner
    if (!req.user.is_admin && business.owner_id !== req.user.id) {
      return res.status(403).json({ message: 'Access denied. You can only create coupons for your own business.' })
    }

    const coupon = await Coupon.create({
      business_id,
      code: code.toUpperCase(),
      title,
      description: description || null,
      discount_type: discount_type || 'percentage',
      discount_value: discount_value || 0,
      min_purchase: min_purchase || null,
      max_uses: max_uses || null,
      start_date: start_date || null,
      end_date: end_date || null,
      is_active: true,
      points_cost: points_cost || null
    })

    res.status(201).json({ success: true, message: 'Coupon created successfully', data: coupon })
  } catch (error) {
    console.error('Create coupon error:', error)
    res.status(500).json({ message: 'Server error creating coupon' })
  }
}

// Update coupon (admin or shop owner)
exports.updateCoupon = async (req, res) => {
  try {
    const { id } = req.params
    const coupon = await Coupon.findByPk(id, {
      include: [{ model: Business, as: 'business' }]
    })

    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' })
    }

    // Check authorization
    if (!req.user.is_admin && coupon.business.owner_id !== req.user.id) {
      return res.status(403).json({ message: 'Access denied.' })
    }

    if (req.body.code) req.body.code = req.body.code.toUpperCase()
    await coupon.update(req.body)

    res.json({ success: true, message: 'Coupon updated successfully', data: coupon })
  } catch (error) {
    console.error('Update coupon error:', error)
    res.status(500).json({ message: 'Server error updating coupon' })
  }
}

// Delete coupon (admin or shop owner)
exports.deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params
    const coupon = await Coupon.findByPk(id, {
      include: [{ model: Business, as: 'business' }]
    })

    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' })
    }

    // Check authorization
    if (!req.user.is_admin && coupon.business.owner_id !== req.user.id) {
      return res.status(403).json({ message: 'Access denied.' })
    }

    await coupon.destroy()

    res.json({ success: true, message: 'Coupon deleted successfully' })
  } catch (error) {
    console.error('Delete coupon error:', error)
    res.status(500).json({ message: 'Server error deleting coupon' })
  }
}

// Get coupons for shop owner's businesses
exports.getOwnerCoupons = async (req, res) => {
  try {
    const businesses = await Business.findAll({
      where: { owner_id: req.user.id },
      attributes: ['id']
    })

    const businessIds = businesses.map(b => b.id)

    const coupons = await Coupon.findAll({
      where: { business_id: { [Op.in]: businessIds } },
      include: [{ model: Business, as: 'business', attributes: ['id', 'name'] }],
      order: [['created_at', 'DESC']]
    })

    res.json({ success: true, data: coupons })
  } catch (error) {
    console.error('Get owner coupons error:', error)
    res.status(500).json({ message: 'Server error fetching coupons' })
  }
}
