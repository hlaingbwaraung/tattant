/**
 * Admin controller  –  user management for site administrators.
 *
 * Exports: getAllUsers, getUserStats, toggleAdminStatus,
 *          togglePremiumStatus, deleteUser
 *
 * Every handler checks `req.user.is_admin` before proceeding.
 */
const { User, Business } = require('../models')
const bcrypt = require('bcryptjs')

// Get all users (admin only)
exports.getAllUsers = async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.is_admin) {
      return res.status(403).json({ message: 'Access denied. Admin only.' })
    }

    const users = await User.findAll({
      attributes: ['id', 'email', 'name', 'preferred_language', 'email_verified', 'is_admin', 'is_shop_owner', 'is_premium', 'premium_type', 'premium_expires_at', 'google_id', 'birthdate', 'created_at', 'updated_at'],
      include: [{ model: Business, as: 'ownedBusinesses', attributes: ['id', 'name'], required: false }],
      order: [['created_at', 'DESC']]
    })

    res.json({
      total: users.length,
      users
    })
  } catch (error) {
    console.error('Get all users error:', error)
    res.status(500).json({ message: 'Server error while fetching users' })
  }
}

// Get user statistics (admin only)
exports.getUserStats = async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.is_admin) {
      return res.status(403).json({ message: 'Access denied. Admin only.' })
    }

    const totalUsers = await User.count()
    const verifiedUsers = await User.count({ where: { email_verified: true } })
    const googleUsers = await User.count({ where: { google_id: { [require('sequelize').Op.not]: null } } })
    const adminUsers = await User.count({ where: { is_admin: true } })
    const premiumUsers = await User.count({ where: { is_premium: true } })

    // Get new users in last 7 days
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const newUsers = await User.count({
      where: {
        created_at: {
          [require('sequelize').Op.gte]: sevenDaysAgo
        }
      }
    })

    res.json({
      totalUsers,
      verifiedUsers,
      googleUsers,
      adminUsers,
      premiumUsers,
      newUsersLast7Days: newUsers
    })
  } catch (error) {
    console.error('Get user stats error:', error)
    res.status(500).json({ message: 'Server error while fetching statistics' })
  }
}

// Update user admin status (admin only, requires admin password confirmation)
exports.toggleAdminStatus = async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.is_admin) {
      return res.status(403).json({ message: 'Access denied. Admin only.' })
    }

    const { userId } = req.params
    const { is_admin, admin_password } = req.body

    // Require admin password confirmation
    if (!admin_password) {
      return res.status(400).json({ message: 'Admin password is required to change admin status' })
    }

    // Verify the requesting admin's password
    const adminUser = await User.findByPk(req.user.id)
    const isPasswordValid = await bcrypt.compare(admin_password, adminUser.password_hash)
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Incorrect admin password' })
    }

    // Prevent user from removing their own admin status
    if (userId === req.user.id && !is_admin) {
      return res.status(400).json({ message: 'Cannot remove your own admin status' })
    }

    const user = await User.findByPk(userId)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    user.is_admin = is_admin
    await user.save()

    res.json({
      message: 'User admin status updated successfully',
      user: {
        id: user.id,
        email: user.email,
        is_admin: user.is_admin
      }
    })
  } catch (error) {
    console.error('Toggle admin status error:', error)
    res.status(500).json({ message: 'Server error while updating admin status' })
  }
}

// Delete user (admin only)
exports.deleteUser = async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.is_admin) {
      return res.status(403).json({ message: 'Access denied. Admin only.' })
    }

    const { userId } = req.params

    // Prevent user from deleting themselves
    if (userId === req.user.id) {
      return res.status(400).json({ message: 'Cannot delete your own account from admin panel' })
    }

    const user = await User.findByPk(userId)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    await user.destroy()

    res.json({ message: 'User deleted successfully' })
  } catch (error) {
    console.error('Delete user error:', error)
    res.status(500).json({ message: 'Server error while deleting user' })
  }
}

// Toggle user premium status (admin only)
exports.togglePremiumStatus = async (req, res) => {
  try {
    if (!req.user.is_admin) {
      return res.status(403).json({ message: 'Access denied. Admin only.' })
    }

    const { userId } = req.params
    const { is_premium, premium_type } = req.body

    const user = await User.findByPk(userId)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    user.is_premium = is_premium

    if (is_premium) {
      user.premium_type = premium_type || 'lifetime'
      if (premium_type === 'monthly') {
        const expires = new Date()
        expires.setMonth(expires.getMonth() + 1)
        user.premium_expires_at = expires
      } else {
        user.premium_expires_at = null
      }
    } else {
      user.premium_type = null
      user.premium_expires_at = null
    }

    await user.save()

    res.json({
      message: `Premium ${is_premium ? 'enabled' : 'disabled'} for user`,
      user: {
        id: user.id,
        email: user.email,
        is_premium: user.is_premium,
        premium_type: user.premium_type,
        premium_expires_at: user.premium_expires_at
      }
    })
  } catch (error) {
    console.error('Toggle premium status error:', error)
    res.status(500).json({ message: 'Server error while updating premium status' })
  }
}

// Reset user password (admin only)
exports.resetUserPassword = async (req, res) => {
  try {
    if (!req.user.is_admin) {
      return res.status(403).json({ message: 'Access denied. Admin only.' })
    }

    const { userId } = req.params
    const { new_password } = req.body

    if (!new_password || new_password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' })
    }

    const user = await User.findByPk(userId)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    const salt = await bcrypt.genSalt(10)
    user.password_hash = await bcrypt.hash(new_password, salt)
    await user.save()

    res.json({
      message: `Password reset successfully for ${user.email}`,
      user: { id: user.id, email: user.email }
    })
  } catch (error) {
    console.error('Reset user password error:', error)
    res.status(500).json({ message: 'Server error while resetting password' })
  }
}

// Toggle shop owner status (admin only)
exports.toggleShopOwner = async (req, res) => {
  try {
    if (!req.user.is_admin) {
      return res.status(403).json({ message: 'Access denied. Admin only.' })
    }

    const { userId } = req.params
    const { is_shop_owner } = req.body

    const user = await User.findByPk(userId)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    user.is_shop_owner = is_shop_owner
    await user.save()

    res.json({
      message: `Shop owner ${is_shop_owner ? 'enabled' : 'disabled'} for user`,
      user: {
        id: user.id,
        email: user.email,
        is_shop_owner: user.is_shop_owner
      }
    })
  } catch (error) {
    console.error('Toggle shop owner error:', error)
    res.status(500).json({ message: 'Server error while updating shop owner status' })
  }
}

// Create shop owner account (admin only)
exports.createShopOwner = async (req, res) => {
  try {
    if (!req.user.is_admin) {
      return res.status(403).json({ message: 'Access denied. Admin only.' })
    }

    const { email, password, name } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' })
    }

    // Check if email already exists
    const existing = await User.findOne({ where: { email } })
    if (existing) {
      return res.status(400).json({ message: 'Email already registered' })
    }

    const salt = await bcrypt.genSalt(10)
    const password_hash = await bcrypt.hash(password, salt)

    const user = await User.create({
      email,
      password_hash,
      name: name || email.split('@')[0],
      is_shop_owner: true,
      email_verified: true,
      preferred_language: 'en'
    })

    res.status(201).json({
      message: 'Shop owner account created successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        is_shop_owner: user.is_shop_owner
      }
    })
  } catch (error) {
    console.error('Create shop owner error:', error)
    res.status(500).json({ message: 'Server error while creating shop owner' })
  }
}

// Assign business to shop owner (admin only)
exports.assignBusiness = async (req, res) => {
  try {
    if (!req.user.is_admin) {
      return res.status(403).json({ message: 'Access denied. Admin only.' })
    }

    const { userId } = req.params
    const { business_id } = req.body

    const { Business } = require('../models')

    const user = await User.findByPk(userId)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    const business = await Business.findByPk(business_id)
    if (!business) {
      return res.status(404).json({ message: 'Business not found' })
    }

    business.owner_id = userId
    await business.save()

    // Make sure the user is marked as a shop owner
    if (!user.is_shop_owner) {
      user.is_shop_owner = true
      await user.save()
    }

    res.json({
      message: `Business "${business.name}" assigned to ${user.email}`,
      business: { id: business.id, name: business.name, owner_id: business.owner_id }
    })
  } catch (error) {
    console.error('Assign business error:', error)
    res.status(500).json({ message: 'Server error while assigning business' })
  }
}

/**
 * Toggle Premier Shop Owner status (admin only).
 *
 * Premier owners get access to the full booking management system.
 * Sets: is_shop_owner=true, is_premium=true, premium_type='premier'
 * Revoke: is_premium=false, premium_type=null (keeps is_shop_owner)
 */
exports.togglePremierOwner = async (req, res) => {
  try {
    if (!req.user.is_admin) {
      return res.status(403).json({ message: 'Access denied. Admin only.' })
    }

    const { userId } = req.params
    const { is_premier } = req.body

    const user = await User.findByPk(userId)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    if (is_premier) {
      user.is_shop_owner = true
      user.is_premium = true
      user.premium_type = 'premier'
      user.premium_expires_at = null  // never expires by default
    } else {
      user.is_premium = false
      user.premium_type = null
      user.premium_expires_at = null
    }

    await user.save()

    res.json({
      message: `Premier Shop Owner ${is_premier ? 'granted' : 'revoked'} for ${user.email}`,
      user: {
        id: user.id,
        email: user.email,
        is_shop_owner: user.is_shop_owner,
        is_premium: user.is_premium,
        premium_type: user.premium_type
      }
    })
  } catch (error) {
    console.error('Toggle premier owner error:', error)
    res.status(500).json({ message: 'Server error while updating premier status' })
  }
}
