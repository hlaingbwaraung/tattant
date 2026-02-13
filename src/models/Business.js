/**
 * Business model  –  Sequelize definition for the `businesses` table.
 *
 * Represents a shop / restaurant / service listed on the platform.
 * Fields include bilingual descriptions (EN / MY), geolocation,
 * opening hours (JSONB), price range, photos array, and owner reference.
 */
const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/database')

const Business = sequelize.define('Business', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  category_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'categories',
      key: 'id'
    }
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description_en: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  description_my: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  address: {
    type: DataTypes.STRING,
    allowNull: true
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: true
  },
  longitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: true
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  website: {
    type: DataTypes.STRING,
    allowNull: true
  },
  opening_hours: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  price_range: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isIn: [['¥', '¥¥', '¥¥¥', '¥¥¥¥']]
    }
  },
  languages_supported: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  tags: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  photos: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  owner_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'businesses',
  underscored: true,
  timestamps: true,
  indexes: [
    {
      fields: ['category_id']
    },
    {
      fields: ['latitude', 'longitude']
    }
  ]
})

module.exports = Business
