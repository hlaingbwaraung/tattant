const { Category } = require('../models')

// Get all categories
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      order: [['name_en', 'ASC']]
    })

    res.json({
      count: categories.length,
      categories
    })
  } catch (error) {
    console.error('Get categories error:', error)
    res.status(500).json({ message: 'Server error fetching categories' })
  }
}

// Get category by slug
exports.getCategoryBySlug = async (req, res) => {
  try {
    const { slug } = req.params

    const category = await Category.findOne({
      where: { slug }
    })

    if (!category) {
      return res.status(404).json({ message: 'Category not found' })
    }

    res.json(category)
  } catch (error) {
    console.error('Get category error:', error)
    res.status(500).json({ message: 'Server error fetching category' })
  }
}
