/**
 * Points controller  –  points-shop logic.
 *
 * Exports: getMyPoints, getPointsShop, redeemCoupon,
 *          getMyCoupons, useCoupon
 *
 * Users earn points from quizzes; spend them to redeem coupons.
 */
const { User, Coupon, UserCoupon, Business } = require('../models')
const { Op } = require('sequelize')

// GET /api/points/me — get current user's points balance
exports.getMyPoints = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'name', 'points']
    })

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    res.json({ success: true, points: user.points })
  } catch (error) {
    console.error('Get points error:', error)
    res.status(500).json({ message: 'Server error fetching points' })
  }
}

// GET /api/points/shop — get coupons available for point redemption
exports.getPointsShop = async (req, res) => {
  try {
    const coupons = await Coupon.findAll({
      where: {
        is_active: true,
        points_cost: { [Op.not]: null, [Op.gt]: 0 },
        [Op.or]: [
          { end_date: null },
          { end_date: { [Op.gte]: new Date() } }
        ]
      },
      include: [{ model: Business, as: 'business', attributes: ['id', 'name', 'description'] }],
      order: [['points_cost', 'ASC']]
    })

    // Get user's points
    const user = await User.findByPk(req.user.id, { attributes: ['points'] })

    res.json({
      success: true,
      data: coupons,
      userPoints: user?.points || 0
    })
  } catch (error) {
    console.error('Get points shop error:', error)
    res.status(500).json({ message: 'Server error fetching points shop' })
  }
}

// POST /api/points/redeem — redeem points for a coupon
exports.redeemCoupon = async (req, res) => {
  try {
    const { coupon_id } = req.body
    const userId = req.user.id

    if (!coupon_id) {
      return res.status(400).json({ message: 'coupon_id is required' })
    }

    // Find the coupon
    const coupon = await Coupon.findByPk(coupon_id, {
      include: [{ model: Business, as: 'business', attributes: ['id', 'name'] }]
    })

    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' })
    }

    if (!coupon.is_active) {
      return res.status(400).json({ message: 'This coupon is no longer active' })
    }

    if (!coupon.points_cost || coupon.points_cost <= 0) {
      return res.status(400).json({ message: 'This coupon is not available for point redemption' })
    }

    // Check if coupon has expired
    if (coupon.end_date && new Date(coupon.end_date) < new Date()) {
      return res.status(400).json({ message: 'This coupon has expired' })
    }

    // Check max uses
    if (coupon.max_uses && coupon.used_count >= coupon.max_uses) {
      return res.status(400).json({ message: 'This coupon has reached its maximum redemptions' })
    }

    // Get user and check points
    const user = await User.findByPk(userId)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    if (user.points < coupon.points_cost) {
      return res.status(400).json({
        message: 'Not enough points',
        required: coupon.points_cost,
        current: user.points
      })
    }

    // Deduct points and create user coupon
    user.points -= coupon.points_cost
    await user.save()

    coupon.used_count = (coupon.used_count || 0) + 1
    await coupon.save()

    const userCoupon = await UserCoupon.create({
      user_id: userId,
      coupon_id: coupon.id,
      points_spent: coupon.points_cost
    })

    res.status(201).json({
      success: true,
      message: 'Coupon redeemed successfully!',
      data: {
        id: userCoupon.id,
        coupon: {
          id: coupon.id,
          code: coupon.code,
          title: coupon.title,
          description: coupon.description,
          discount_type: coupon.discount_type,
          discount_value: coupon.discount_value,
          business: coupon.business
        },
        points_spent: coupon.points_cost,
        remaining_points: user.points
      }
    })
  } catch (error) {
    console.error('Redeem coupon error:', error)
    res.status(500).json({ message: 'Server error redeeming coupon' })
  }
}

// GET /api/points/my-coupons — get user's redeemed coupons
exports.getMyCoupons = async (req, res) => {
  try {
    const userCoupons = await UserCoupon.findAll({
      where: { user_id: req.user.id },
      include: [{
        model: Coupon,
        as: 'coupon',
        include: [{ model: Business, as: 'business', attributes: ['id', 'name'] }]
      }],
      order: [['created_at', 'DESC']]
    })

    res.json({ success: true, data: userCoupons })
  } catch (error) {
    console.error('Get my coupons error:', error)
    res.status(500).json({ message: 'Server error fetching redeemed coupons' })
  }
}

// POST /api/points/use-coupon/:id — mark a redeemed coupon as used
exports.useCoupon = async (req, res) => {
  try {
    const { id } = req.params

    const userCoupon = await UserCoupon.findOne({
      where: { id, user_id: req.user.id }
    })

    if (!userCoupon) {
      return res.status(404).json({ message: 'Redeemed coupon not found' })
    }

    if (userCoupon.is_used) {
      return res.status(400).json({ message: 'This coupon has already been used' })
    }

    userCoupon.is_used = true
    userCoupon.used_at = new Date()
    await userCoupon.save()

    res.json({ success: true, message: 'Coupon marked as used' })
  } catch (error) {
    console.error('Use coupon error:', error)
    res.status(500).json({ message: 'Server error using coupon' })
  }
}
