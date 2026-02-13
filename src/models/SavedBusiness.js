/**
 * SavedBusiness model  –  Sequelize definition for the `saved_businesses` table.
 *
 * Join table linking users to their bookmarked businesses.
 * Composite unique index on (user_id, business_id).
 */
const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/database')

const SavedBusiness = sequelize.define('SavedBusiness', {
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
  business_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'businesses',
      key: 'id'
    }
  }
}, {
  tableName: 'saved_businesses',
  underscored: true,
  timestamps: true,
  updatedAt: false,
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'business_id']
    },
    {
      fields: ['user_id']
    },
    {
      fields: ['business_id']
    }
  ]
})

module.exports = SavedBusiness
