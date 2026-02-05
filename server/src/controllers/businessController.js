const { Business, Category } = require('../models')
const { Op } = require('sequelize')

// Get all businesses with optional filters
exports.getAllBusinesses = async (req, res) => {
  try {
    const { category, search, limit = 50 } = req.query

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

    const businesses = await Business.findAll({
      where: whereClause,
      include: [{ model: Category, as: 'category' }],
      limit: parseInt(limit),
      order: [['created_at', 'DESC']]
    })

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
      include: [{ model: Category, as: 'category' }]
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
