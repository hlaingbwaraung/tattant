/**
 * Category controller  –  CRUD for business categories.
 *
 * Public: getAllCategories, getCategoryBySlug
 * Admin:  getCategoryStats, createCategory, updateCategory, deleteCategory
 */
const { Category, Business } = require('../models')
const { Op } = require('sequelize')

// Get all categories
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      order: [['display_order', 'ASC'], ['name_en', 'ASC']]
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

// Get category stats (admin)
exports.getCategoryStats = async (req, res) => {
  try {
    if (!req.user.is_admin) {
      return res.status(403).json({ message: 'Access denied. Admin only.' })
    }

    const totalCategories = await Category.count()

    // Count businesses per category
    const categories = await Category.findAll({
      include: [{ model: Business, as: 'businesses', attributes: ['id'] }],
      order: [['display_order', 'ASC']]
    })

    const categoriesWithCount = categories.map(c => ({
      id: c.id,
      name_en: c.name_en,
      icon: c.icon,
      slug: c.slug,
      businessCount: c.businesses ? c.businesses.length : 0
    }))

    const totalBusinesses = await Business.count()

    res.json({
      success: true,
      data: {
        totalCategories,
        totalBusinesses,
        categoriesWithCount
      }
    })
  } catch (error) {
    console.error('Get category stats error:', error)
    res.status(500).json({ message: 'Server error fetching category stats' })
  }
}

// Create category (admin)
exports.createCategory = async (req, res) => {
  try {
    if (!req.user.is_admin) {
      return res.status(403).json({ message: 'Access denied. Admin only.' })
    }

    const { name_en, name_my, icon, slug, display_order } = req.body

    if (!name_en || !name_my || !slug) {
      return res.status(400).json({ message: 'Missing required fields: name_en, name_my, slug' })
    }

    // Check for duplicate slug
    const existing = await Category.findOne({ where: { slug } })
    if (existing) {
      return res.status(409).json({ message: 'A category with this slug already exists' })
    }

    const category = await Category.create({
      name_en,
      name_my,
      icon: icon || '📁',
      slug,
      display_order: display_order || 0
    })

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category
    })
  } catch (error) {
    console.error('Create category error:', error)
    res.status(500).json({ message: 'Server error creating category' })
  }
}

// Update category (admin)
exports.updateCategory = async (req, res) => {
  try {
    if (!req.user.is_admin) {
      return res.status(403).json({ message: 'Access denied. Admin only.' })
    }

    const { id } = req.params
    const category = await Category.findByPk(id)

    if (!category) {
      return res.status(404).json({ message: 'Category not found' })
    }

    // Check slug uniqueness if changing
    if (req.body.slug && req.body.slug !== category.slug) {
      const existing = await Category.findOne({ where: { slug: req.body.slug } })
      if (existing) {
        return res.status(409).json({ message: 'A category with this slug already exists' })
      }
    }

    await category.update(req.body)

    res.json({
      success: true,
      message: 'Category updated successfully',
      data: category
    })
  } catch (error) {
    console.error('Update category error:', error)
    res.status(500).json({ message: 'Server error updating category' })
  }
}

// Delete category (admin)
exports.deleteCategory = async (req, res) => {
  try {
    if (!req.user.is_admin) {
      return res.status(403).json({ message: 'Access denied. Admin only.' })
    }

    const { id } = req.params
    const category = await Category.findByPk(id)

    if (!category) {
      return res.status(404).json({ message: 'Category not found' })
    }

    // Check if category has businesses
    const businessCount = await Business.count({ where: { category_id: id } })
    if (businessCount > 0) {
      return res.status(400).json({ 
        message: `Cannot delete category with ${businessCount} active businesses. Remove or reassign them first.` 
      })
    }

    await category.destroy()

    res.json({
      success: true,
      message: 'Category deleted successfully'
    })
  } catch (error) {
    console.error('Delete category error:', error)
    res.status(500).json({ message: 'Server error deleting category' })
  }
}
