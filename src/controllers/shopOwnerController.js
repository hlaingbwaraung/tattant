/**
 * Shop-owner controller  –  dashboard stats and business editing.
 *
 * Exports: getMyBusinesses, updateMyBusiness, getDashboardStats
 * Owner-scoped: all queries filter by owner_id = req.user.id.
 */
const { Business, Category, Coupon } = require('../models')

// Get shop owner's businesses
exports.getMyBusinesses = async (req, res) => {
  try {
    const businesses = await Business.findAll({
      where: { owner_id: req.user.id },
      include: [
        { model: Category, as: 'category' },
        { model: Coupon, as: 'coupons' }
      ],
      order: [['created_at', 'DESC']]
    })

    res.json({ success: true, data: businesses })
  } catch (error) {
    console.error('Get owner businesses error:', error)
    res.status(500).json({ message: 'Server error fetching businesses' })
  }
}

// Update shop owner's own business
exports.updateMyBusiness = async (req, res) => {
  try {
    const { id } = req.params
    const business = await Business.findByPk(id)

    if (!business) {
      return res.status(404).json({ message: 'Business not found' })
    }

    if (business.owner_id !== req.user.id) {
      return res.status(403).json({ message: 'Access denied. This is not your business.' })
    }

    // Shop owners can update limited fields (not category or active status)
    const allowedFields = [
      'name', 'description_en', 'description_my', 'address',
      'latitude', 'longitude', 'phone', 'website',
      'opening_hours', 'price_range', 'languages_supported',
      'tags', 'photos'
    ]

    const updateData = {}
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field]
      }
    }

    await business.update(updateData)

    const updatedBusiness = await Business.findByPk(id, {
      include: [
        { model: Category, as: 'category' },
        { model: Coupon, as: 'coupons' }
      ]
    })

    res.json({
      success: true,
      message: 'Business updated successfully',
      data: updatedBusiness
    })
  } catch (error) {
    console.error('Update owner business error:', error)
    res.status(500).json({ message: 'Server error updating business' })
  }
}

// Get shop owner dashboard stats
exports.getDashboardStats = async (req, res) => {
  try {
    const businesses = await Business.findAll({
      where: { owner_id: req.user.id },
      include: [{ model: Coupon, as: 'coupons' }]
    })

    const totalBusinesses = businesses.length
    const totalCoupons = businesses.reduce((sum, b) => sum + (b.coupons?.length || 0), 0)
    const activeCoupons = businesses.reduce((sum, b) =>
      sum + (b.coupons?.filter(c => c.is_active)?.length || 0), 0)
    const totalCouponUses = businesses.reduce((sum, b) =>
      sum + (b.coupons?.reduce((s, c) => s + c.used_count, 0) || 0), 0)

    res.json({
      success: true,
      data: {
        totalBusinesses,
        totalCoupons,
        activeCoupons,
        totalCouponUses
      }
    })
  } catch (error) {
    console.error('Get owner stats error:', error)
    res.status(500).json({ message: 'Server error fetching stats' })
  }
}
