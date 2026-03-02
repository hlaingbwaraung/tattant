/**
 * MenuItem controller – CRUD operations for business menu items.
 *
 * Shop owner scoped: all queries verify business.owner_id === req.user.id
 *
 * Exports: getMenuItems, createMenuItem, updateMenuItem, deleteMenuItem
 *          getPublicMenu (no auth required)
 */
const { MenuItem, Business } = require('../models')

// Helper: verify business ownership
const verifyOwnership = async (businessId, userId) => {
  const business = await Business.findByPk(businessId)
  if (!business) return { error: 'Business not found', status: 404 }
  if (business.owner_id !== userId) return { error: 'Access denied. Not your business.', status: 403 }
  return { business }
}

// Get menu items for a business (shop owner)
exports.getMenuItems = async (req, res) => {
  try {
    const { businessId } = req.params

    const check = await verifyOwnership(businessId, req.user.id)
    if (check.error) return res.status(check.status).json({ message: check.error })

    const items = await MenuItem.findAll({
      where: { business_id: businessId },
      order: [['category', 'ASC'], ['display_order', 'ASC'], ['name', 'ASC']]
    })

    res.json({ items })
  } catch (error) {
    console.error('Get menu items error:', error)
    res.status(500).json({ message: 'Server error fetching menu items.' })
  }
}

// Get public menu for a business (no auth)
exports.getPublicMenu = async (req, res) => {
  try {
    const { businessId } = req.params

    const items = await MenuItem.findAll({
      where: { business_id: businessId, is_available: true },
      order: [['category', 'ASC'], ['display_order', 'ASC'], ['name', 'ASC']],
      attributes: ['id', 'name', 'name_my', 'description', 'price', 'category', 'photo', 'is_available']
    })

    res.json({ items })
  } catch (error) {
    console.error('Get public menu error:', error)
    res.status(500).json({ message: 'Server error fetching menu.' })
  }
}

// Create a menu item
exports.createMenuItem = async (req, res) => {
  try {
    const { businessId } = req.params

    const check = await verifyOwnership(businessId, req.user.id)
    if (check.error) return res.status(check.status).json({ message: check.error })

    const { name, name_my, description, price, category, photo, is_available, display_order } = req.body

    if (!name) return res.status(400).json({ message: 'Item name is required.' })
    if (price === undefined || price === null) return res.status(400).json({ message: 'Price is required.' })

    const item = await MenuItem.create({
      business_id: businessId,
      name,
      name_my: name_my || null,
      description: description || null,
      price,
      category: category || null,
      photo: photo || null,
      is_available: is_available !== false,
      display_order: display_order || 0
    })

    res.status(201).json({
      message: 'Menu item created successfully.',
      item
    })
  } catch (error) {
    console.error('Create menu item error:', error)
    res.status(500).json({ message: 'Server error creating menu item.' })
  }
}

// Update a menu item
exports.updateMenuItem = async (req, res) => {
  try {
    const { businessId, itemId } = req.params

    const check = await verifyOwnership(businessId, req.user.id)
    if (check.error) return res.status(check.status).json({ message: check.error })

    const item = await MenuItem.findOne({
      where: { id: itemId, business_id: businessId }
    })

    if (!item) return res.status(404).json({ message: 'Menu item not found.' })

    const allowedFields = ['name', 'name_my', 'description', 'price', 'category', 'photo', 'is_available', 'display_order']
    const updateData = {}
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) updateData[field] = req.body[field]
    }

    await item.update(updateData)

    res.json({
      message: 'Menu item updated successfully.',
      item
    })
  } catch (error) {
    console.error('Update menu item error:', error)
    res.status(500).json({ message: 'Server error updating menu item.' })
  }
}

// Delete a menu item
exports.deleteMenuItem = async (req, res) => {
  try {
    const { businessId, itemId } = req.params

    const check = await verifyOwnership(businessId, req.user.id)
    if (check.error) return res.status(check.status).json({ message: check.error })

    const item = await MenuItem.findOne({
      where: { id: itemId, business_id: businessId }
    })

    if (!item) return res.status(404).json({ message: 'Menu item not found.' })

    await item.destroy()

    res.json({ message: 'Menu item deleted successfully.' })
  } catch (error) {
    console.error('Delete menu item error:', error)
    res.status(500).json({ message: 'Server error deleting menu item.' })
  }
}
