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
  name_jp: {
    type: DataTypes.STRING,
    allowNull: false
  },
  name_cn: {
    type: DataTypes.STRING,
    allowNull: false
  },
  name_kr: {
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
