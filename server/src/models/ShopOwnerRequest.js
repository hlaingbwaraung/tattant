/**
 * ShopOwnerRequest model – Sequelize definition for the `shop_owner_requests` table.
 *
 * Tracks shop owner registration requests from users awaiting admin approval.
 */
const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/database')

const ShopOwnerRequest = sequelize.define('ShopOwnerRequest', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'users', key: 'id' }
  },
  shop_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  shop_description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  shop_phone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  shop_address: {
    type: DataTypes.STRING,
    allowNull: true
  },
  shop_category: {
    type: DataTypes.STRING,
    allowNull: true
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending',
    allowNull: false
  },
  admin_note: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  reviewed_by: {
    type: DataTypes.UUID,
    allowNull: true
  },
  reviewed_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'shop_owner_requests',
  underscored: true,
  timestamps: true
})

module.exports = ShopOwnerRequest
