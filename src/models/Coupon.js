/**
 * Coupon model  –  Sequelize definition for the `coupons` table.
 *
 * Coupons are tied to a business. Discount types: percentage | fixed | freebie.
 * Optional fields: min_purchase, max_uses, start/end dates, points_cost
 * (for the points shop).
 */
const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/database')

const Coupon = sequelize.define('Coupon', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  business_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'businesses',
      key: 'id'
    }
  },
  code: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  discount_type: {
    type: DataTypes.ENUM('percentage', 'fixed', 'freebie'),
    allowNull: false,
    defaultValue: 'percentage'
  },
  discount_value: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  },
  min_purchase: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  max_uses: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  used_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false
  },
  start_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  end_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false
  },
  points_cost: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: null
  }
}, {
  tableName: 'coupons',
  underscored: true,
  timestamps: true
})

module.exports = Coupon
