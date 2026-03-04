/**
 * SiteVisit model – Sequelize definition for the `site_visits` table.
 *
 * Tracks every page visit with the visitor type: anonymous, user, or shop_owner.
 */
const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/database')

const SiteVisit = sequelize.define('SiteVisit', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  visitor_type: {
    type: DataTypes.ENUM('anonymous', 'user', 'shop_owner'),
    allowNull: false,
    defaultValue: 'anonymous'
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: { model: 'users', key: 'id' }
  },
  path: {
    type: DataTypes.STRING,
    allowNull: true
  },
  ip_address: {
    type: DataTypes.STRING,
    allowNull: true
  },
  user_agent: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'site_visits',
  underscored: true,
  timestamps: true
})

module.exports = SiteVisit
