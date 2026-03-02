/**
 * ContactMessage model – Sequelize definition for the `contact_messages` table.
 *
 * Stores contact form submissions from shop owners (or any user) to admin.
 */
const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/database')

const ContactMessage = sequelize.define('ContactMessage', {
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
  subject: {
    type: DataTypes.STRING,
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  category: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'general'
  },
  status: {
    type: DataTypes.ENUM('unread', 'read', 'replied', 'archived'),
    defaultValue: 'unread',
    allowNull: false
  },
  admin_reply: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  replied_by: {
    type: DataTypes.UUID,
    allowNull: true
  },
  replied_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  photos: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  }
}, {
  tableName: 'contact_messages',
  underscored: true,
  timestamps: true
})

module.exports = ContactMessage
