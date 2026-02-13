/**
 * UserCoupon model  –  Sequelize definition for the `user_coupons` table.
 *
 * Records when a user redeems a coupon with points.
 * Tracks points_spent, redeemed_at, is_used, used_at.
 */
const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/database')

const UserCoupon = sequelize.define('UserCoupon', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  coupon_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'coupons',
      key: 'id'
    }
  },
  points_spent: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  redeemed_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false
  },
  is_used: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false
  },
  used_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'user_coupons',
  underscored: true,
  timestamps: true
})

module.exports = UserCoupon
