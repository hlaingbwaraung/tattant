/**
 * SiteSetting Model
 *
 * Key-value store for site-wide settings (feature flags, toggles, etc.)
 * Each row has a unique key and a JSON value.
 */

const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/database')

const SiteSetting = sequelize.define('SiteSetting', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  key: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  value: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {}
  }
}, {
  tableName: 'site_settings',
  underscored: true,
  timestamps: true
})

module.exports = SiteSetting
