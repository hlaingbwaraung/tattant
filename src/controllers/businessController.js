/**
 * Business controller  –  CRUD for businesses / shops.
 *
 * Public: getAllBusinesses (filter by category slug / search), getBusinessById
 * Admin:  getBusinessStats, createBusiness, updateBusiness,
 *         deleteBusiness, toggleBusinessActive
 */
const { Business, Category, Coupon } = require('../models')
const { Op } = require('sequelize')

// Get all businesses with optional filters
exports.getAllBusinesses = async (req, res) => {
  try {
    const { category, search, limit = 50, all } = req.query

    const whereClause = {}
    
    // Filter by category slug
    if (category) {
      const categoryRecord = await Category.findOne({ where: { slug: category } })
      if (categoryRecord) {
        whereClause.category_id = categoryRecord.id
      }
    }

    // Search filter
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description_en: { [Op.iLike]: `%${search}%` } }
      ]
    }

    const queryOptions = {
      where: whereClause,
      include: [
        { model: Category, as: 'category' },
        { model: Coupon, as: 'coupons', where: { is_active: true }, required: false }
      ],
      order: [['created_at', 'DESC']]
    }

    // Only apply limit if 'all' is not requested (for admin listing)
    if (!all) {
      queryOptions.limit = parseInt(limit)
    }

    const businesses = await Business.findAll(queryOptions)

    res.json({
      count: businesses.length,
      businesses
    })
  } catch (error) {
    console.error('Get businesses error:', error)
    res.status(500).json({ message: 'Server error fetching businesses' })
  }
}

// Get single business by ID
exports.getBusinessById = async (req, res) => {
  try {
    const { id } = req.params

    const business = await Business.findByPk(id, {
      include: [
        { model: Category, as: 'category' },
        { model: Coupon, as: 'coupons', where: { is_active: true }, required: false }
      ]
    })

    if (!business) {
      return res.status(404).json({ message: 'Business not found' })
    }

    res.json(business)
  } catch (error) {
    console.error('Get business error:', error)
    res.status(500).json({ message: 'Server error fetching business' })
  }
}

// Get business stats (admin)
exports.getBusinessStats = async (req, res) => {
  try {
    if (!req.user.is_admin) {
      return res.status(403).json({ message: 'Access denied. Admin only.' })
    }

    const totalBusinesses = await Business.count()
    const activeBusinesses = await Business.count({ where: { is_active: true } })
    const inactiveBusinesses = await Business.count({ where: { is_active: false } })

    // Businesses by category
    const categories = await Category.findAll({
      include: [{ model: Business, as: 'businesses', attributes: ['id'] }],
      order: [['display_order', 'ASC']]
    })

    const businessesByCategory = categories.map(c => ({
      category: c.name_en,
      icon: c.icon,
      count: c.businesses ? c.businesses.length : 0
    }))

    res.json({
      success: true,
      data: {
        totalBusinesses,
        activeBusinesses,
        inactiveBusinesses,
        businessesByCategory
      }
    })
  } catch (error) {
    console.error('Get business stats error:', error)
    res.status(500).json({ message: 'Server error fetching business stats' })
  }
}

// Create business (admin)
exports.createBusiness = async (req, res) => {
  try {
    if (!req.user.is_admin) {
      return res.status(403).json({ message: 'Access denied. Admin only.' })
    }

    const {
      category_id, name, description_en, description_my,
      address, latitude, longitude, phone, website, opening_hours,
      price_range, languages_supported, tags, photos, is_active
    } = req.body

    if (!name || !category_id) {
      return res.status(400).json({ message: 'Missing required fields: name, category_id' })
    }

    // Verify category exists
    const categoryExists = await Category.findByPk(category_id)
    if (!categoryExists) {
      return res.status(400).json({ message: 'Invalid category_id. Category not found.' })
    }

    const business = await Business.create({
      category_id,
      name,
      description_en: description_en || null,
      description_my: description_my || null,
      address: address || null,
      latitude: latitude || null,
      longitude: longitude || null,
      phone: phone || null,
      website: website || null,
      opening_hours: opening_hours || null,
      price_range: price_range || null,
      languages_supported: languages_supported || [],
      tags: tags || [],
      photos: photos || [],
      is_active: is_active !== undefined ? is_active : true
    })

    const createdBusiness = await Business.findByPk(business.id, {
      include: [{ model: Category, as: 'category' }]
    })

    res.status(201).json({
      success: true,
      message: 'Business created successfully',
      data: createdBusiness
    })
  } catch (error) {
    console.error('Create business error:', error)
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ message: error.errors.map(e => e.message).join(', ') })
    }
    res.status(500).json({ message: 'Server error creating business' })
  }
}

// Update business (admin)
exports.updateBusiness = async (req, res) => {
  try {
    if (!req.user.is_admin) {
      return res.status(403).json({ message: 'Access denied. Admin only.' })
    }

    const { id } = req.params
    const business = await Business.findByPk(id)

    if (!business) {
      return res.status(404).json({ message: 'Business not found' })
    }

    // Verify new category if changing
    if (req.body.category_id && req.body.category_id !== business.category_id) {
      const categoryExists = await Category.findByPk(req.body.category_id)
      if (!categoryExists) {
        return res.status(400).json({ message: 'Invalid category_id. Category not found.' })
      }
    }

    await business.update(req.body)

    const updatedBusiness = await Business.findByPk(id, {
      include: [{ model: Category, as: 'category' }]
    })

    res.json({
      success: true,
      message: 'Business updated successfully',
      data: updatedBusiness
    })
  } catch (error) {
    console.error('Update business error:', error)
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ message: error.errors.map(e => e.message).join(', ') })
    }
    res.status(500).json({ message: 'Server error updating business' })
  }
}

// Delete business (admin)
exports.deleteBusiness = async (req, res) => {
  try {
    if (!req.user.is_admin) {
      return res.status(403).json({ message: 'Access denied. Admin only.' })
    }

    const { id } = req.params
    const business = await Business.findByPk(id)

    if (!business) {
      return res.status(404).json({ message: 'Business not found' })
    }

    await business.destroy()

    res.json({
      success: true,
      message: 'Business deleted successfully'
    })
  } catch (error) {
    console.error('Delete business error:', error)
    res.status(500).json({ message: 'Server error deleting business' })
  }
}

// Toggle business active status (admin)
exports.toggleBusinessActive = async (req, res) => {
  try {
    if (!req.user.is_admin) {
      return res.status(403).json({ message: 'Access denied. Admin only.' })
    }

    const { id } = req.params
    const business = await Business.findByPk(id)

    if (!business) {
      return res.status(404).json({ message: 'Business not found' })
    }

    await business.update({ is_active: !business.is_active })

    res.json({
      success: true,
      message: `Business ${business.is_active ? 'activated' : 'deactivated'} successfully`,
      data: business
    })
  } catch (error) {
    console.error('Toggle business active error:', error)
    res.status(500).json({ message: 'Server error toggling business status' })
  }
}
