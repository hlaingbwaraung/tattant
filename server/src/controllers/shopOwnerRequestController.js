/**
 * Shop Owner Request controller – handles shop owner registration requests.
 *
 * Public (auth required):
 *   submitRequest  – user submits a shop owner application
 *   getMyRequest   – user checks own request status
 *
 * Admin only:
 *   getAllRequests  – list all requests (with filters)
 *   approveRequest – approve and create business + set is_shop_owner
 *   rejectRequest  – reject with note
 */
const { ShopOwnerRequest, User, Business, Category } = require('../models')
const { Op } = require('sequelize')

// Submit a shop owner request (any authenticated user)
exports.submitRequest = async (req, res) => {
  try {
    const userId = req.user.id

    // Check if user already has a pending request
    const existing = await ShopOwnerRequest.findOne({
      where: { user_id: userId, status: 'pending' }
    })
    if (existing) {
      return res.status(400).json({ message: 'You already have a pending shop owner request.' })
    }

    // Check if user is already a shop owner
    const user = await User.findByPk(userId)
    if (user.is_shop_owner) {
      return res.status(400).json({ message: 'You are already a shop owner.' })
    }

    const { shop_name, shop_description, shop_phone, shop_address, shop_category, message } = req.body

    if (!shop_name) {
      return res.status(400).json({ message: 'Shop name is required.' })
    }

    const request = await ShopOwnerRequest.create({
      user_id: userId,
      shop_name,
      shop_description,
      shop_phone,
      shop_address,
      shop_category,
      message
    })

    res.status(201).json({
      message: 'Shop owner request submitted successfully. An admin will review your application.',
      request: {
        id: request.id,
        shop_name: request.shop_name,
        status: request.status,
        created_at: request.created_at
      }
    })
  } catch (error) {
    console.error('Submit shop owner request error:', error)
    res.status(500).json({ message: 'Server error submitting request.' })
  }
}

// Get current user's request status
exports.getMyRequest = async (req, res) => {
  try {
    const requests = await ShopOwnerRequest.findAll({
      where: { user_id: req.user.id },
      order: [['created_at', 'DESC']]
    })

    res.json({ requests })
  } catch (error) {
    console.error('Get my request error:', error)
    res.status(500).json({ message: 'Server error fetching request.' })
  }
}

// Get all requests (admin only)
exports.getAllRequests = async (req, res) => {
  try {
    if (!req.user.is_admin) {
      return res.status(403).json({ message: 'Access denied. Admin only.' })
    }

    const { status } = req.query
    const where = {}
    if (status) where.status = status

    const requests = await ShopOwnerRequest.findAll({
      where,
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email', 'is_shop_owner', 'created_at'] }
      ],
      order: [['created_at', 'DESC']]
    })

    const counts = {
      total: await ShopOwnerRequest.count(),
      pending: await ShopOwnerRequest.count({ where: { status: 'pending' } }),
      approved: await ShopOwnerRequest.count({ where: { status: 'approved' } }),
      rejected: await ShopOwnerRequest.count({ where: { status: 'rejected' } })
    }

    res.json({ requests, counts })
  } catch (error) {
    console.error('Get all requests error:', error)
    res.status(500).json({ message: 'Server error fetching requests.' })
  }
}

// Approve a shop owner request (admin only)
exports.approveRequest = async (req, res) => {
  try {
    if (!req.user.is_admin) {
      return res.status(403).json({ message: 'Access denied. Admin only.' })
    }

    const { requestId } = req.params
    const { admin_note, category_id } = req.body || {}

    const request = await ShopOwnerRequest.findByPk(requestId, {
      include: [{ model: User, as: 'user' }]
    })

    if (!request) {
      return res.status(404).json({ message: 'Request not found.' })
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: `Request already ${request.status}.` })
    }

    // 1. Set the user as a shop owner
    const user = await User.findByPk(request.user_id)
    user.is_shop_owner = true
    await user.save()

    // 2. Create a business for them
    let businessCategoryId = category_id
    if (!businessCategoryId) {
      // Try to find a matching category
      if (request.shop_category) {
        const cat = await Category.findOne({
          where: {
            [Op.or]: [
              { name_en: { [Op.iLike]: `%${request.shop_category}%` } },
              { slug: { [Op.iLike]: `%${request.shop_category}%` } }
            ]
          }
        })
        if (cat) businessCategoryId = cat.id
      }
      // Fallback to first category
      if (!businessCategoryId) {
        const firstCat = await Category.findOne({ order: [['display_order', 'ASC']] })
        if (firstCat) businessCategoryId = firstCat.id
      }
    }

    const business = await Business.create({
      name: request.shop_name,
      description_en: request.shop_description || '',
      address: request.shop_address || '',
      phone: request.shop_phone || '',
      category_id: businessCategoryId,
      owner_id: request.user_id,
      is_active: true
    })

    // 3. Update the request status
    request.status = 'approved'
    request.admin_note = admin_note || null
    request.reviewed_by = req.user.id
    request.reviewed_at = new Date()
    await request.save()

    res.json({
      message: `Shop owner request approved. Business "${business.name}" created and assigned to ${user.email}.`,
      request: {
        id: request.id,
        status: request.status,
        reviewed_at: request.reviewed_at
      },
      business: {
        id: business.id,
        name: business.name
      }
    })
  } catch (error) {
    console.error('Approve request error:', error)
    res.status(500).json({ message: 'Server error approving request.' })
  }
}

// Reject a shop owner request (admin only)
exports.rejectRequest = async (req, res) => {
  try {
    if (!req.user.is_admin) {
      return res.status(403).json({ message: 'Access denied. Admin only.' })
    }

    const { requestId } = req.params
    const { admin_note } = req.body || {}

    const request = await ShopOwnerRequest.findByPk(requestId)
    if (!request) {
      return res.status(404).json({ message: 'Request not found.' })
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: `Request already ${request.status}.` })
    }

    request.status = 'rejected'
    request.admin_note = admin_note || 'Your request has been rejected.'
    request.reviewed_by = req.user.id
    request.reviewed_at = new Date()
    await request.save()

    res.json({
      message: 'Shop owner request rejected.',
      request: {
        id: request.id,
        status: request.status,
        admin_note: request.admin_note,
        reviewed_at: request.reviewed_at
      }
    })
  } catch (error) {
    console.error('Reject request error:', error)
    res.status(500).json({ message: 'Server error rejecting request.' })
  }
}
