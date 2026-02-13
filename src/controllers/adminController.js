/**
 * Admin controller  –  user management for site administrators.
 *
 * Exports: getAllUsers, getUserStats, toggleAdminStatus,
 *          togglePremiumStatus, deleteUser
 *
 * Every handler checks `req.user.is_admin` before proceeding.
 */
const { User } = require('../models')
const bcrypt = require('bcryptjs')

// Get all users (admin only)
exports.getAllUsers = async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.is_admin) {
      return res.status(403).json({ message: 'Access denied. Admin only.' })
    }

    const users = await User.findAll({
      attributes: ['id', 'email', 'name', 'preferred_language', 'email_verified', 'is_admin', 'is_premium', 'premium_type', 'premium_expires_at', 'google_id', 'birthdate', 'created_at', 'updated_at'],
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
