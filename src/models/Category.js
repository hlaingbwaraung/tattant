/**
 * Category model  –  Sequelize definition for the `categories` table.
 *
 * Each category has bilingual names (EN / MY), an emoji icon,
 * a URL-safe slug, and a display_order for sorting.
 */
const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/database')

const Category = sequelize.define('Category', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name_en: {
    type: DataTypes.STRING,
    allowNull: false
  },
  name_my: {
    type: DataTypes.STRING,
    allowNull: false
  },
  icon: {
    type: DataTypes.STRING,
    allowNull: true
  },
  slug: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  display_order: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'categories',
  underscored: true,
  timestamps: true
})

module.exports = Category
