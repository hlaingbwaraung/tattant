/**
 * MenuItem model – Sequelize definition for the `menu_items` table.
 *
 * Represents a menu item (food, service, product) belonging to a business.
 */
const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/database')

const MenuItem = sequelize.define('MenuItem', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  business_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'businesses', key: 'id' }
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  name_my: {
    type: DataTypes.STRING,
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  },
  category: {
    type: DataTypes.STRING,
    allowNull: true
  },
  photo: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  is_available: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false
  },
  display_order: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false
  }
}, {
  tableName: 'menu_items',
  underscored: true,
  timestamps: true
})

module.exports = MenuItem
