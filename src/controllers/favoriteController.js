/**
 * Favorite controller  –  save / unsave / list / check favourites.
 *
 * All operations require an authenticated user (req.user).
 * Exports: saveBusiness, unsaveBusiness, getSavedBusinesses, checkIfSaved
 */
const { SavedBusiness, Business, Category } = require('../models')

// Save a business to favorites
exports.saveBusiness = async (req, res) => {
  try {
    const userId = req.user.id
    const { businessId } = req.body

    // Check if business exists
    const business = await Business.findByPk(businessId)
    if (!business) {
      return res.status(404).json({ message: 'Business not found' })
    }

    // Check if already saved
    const existing = await SavedBusiness.findOne({
      where: {
        user_id: userId,
        business_id: businessId
      }
    })

    if (existing) {
      return res.status(400).json({ message: 'Business already saved to favorites' })
    }

    // Create saved business
    await SavedBusiness.create({
      user_id: userId,
      business_id: businessId
    })

    res.status(201).json({ message: 'Business saved to favorites successfully' })
  } catch (error) {
    console.error('Save business error:', error)
    res.status(500).json({ message: 'Server error while saving business' })
  }
}

// Remove a business from favorites
exports.unsaveBusiness = async (req, res) => {
  try {
    const userId = req.user.id
    const { businessId } = req.params

    const deleted = await SavedBusiness.destroy({
      where: {
        user_id: userId,
        business_id: businessId
      }
    })

    if (!deleted) {
      return res.status(404).json({ message: 'Saved business not found' })
    }

    res.json({ message: 'Business removed from favorites successfully' })
  } catch (error) {
    console.error('Unsave business error:', error)
    res.status(500).json({ message: 'Server error while removing business' })
  }
}

// Get all saved businesses for the current user
exports.getSavedBusinesses = async (req, res) => {
  try {
    const userId = req.user.id

    const savedBusinesses = await SavedBusiness.findAll({
      where: { user_id: userId },
      include: [
        {
          model: Business,
          as: 'business',
          include: [
            {
              model: Category,
              as: 'category'
            }
          ]
        }
      ],
      order: [['created_at', 'DESC']]
    })

    const businesses = savedBusinesses.map(sb => sb.business)

    res.json(businesses)
  } catch (error) {
    console.error('Get saved businesses error:', error)
    res.status(500).json({ message: 'Server error while fetching saved businesses' })
  }
}

// Check if a business is saved by the current user
exports.checkIfSaved = async (req, res) => {
  try {
    const userId = req.user.id
    const { businessId } = req.params

    const saved = await SavedBusiness.findOne({
      where: {
        user_id: userId,
        business_id: businessId
      }
    })

    res.json({ isSaved: !!saved })
  } catch (error) {
    console.error('Check saved error:', error)
    res.status(500).json({ message: 'Server error while checking saved status' })
  }
}
