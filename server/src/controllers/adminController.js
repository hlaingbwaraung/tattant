const { User } = require('../models')

// Get all users (admin only)
exports.getAllUsers = async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.is_admin) {
      return res.status(403).json({ message: 'Access denied. Admin only.' })
    }

    const users = await User.findAll({
      attributes: ['id', 'email', 'name', 'preferred_language', 'email_verified', 'is_admin', 'google_id', 'birthdate', 'created_at', 'updated_at'],
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
      newUsersLast7Days: newUsers
    })
  } catch (error) {
    console.error('Get user stats error:', error)
    res.status(500).json({ message: 'Server error while fetching statistics' })
  }
}

// Update user admin status (admin only)
exports.toggleAdminStatus = async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.is_admin) {
      return res.status(403).json({ message: 'Access denied. Admin only.' })
    }

    const { userId } = req.params
    const { is_admin } = req.body

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
