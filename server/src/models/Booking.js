/**
 * Booking model – Sequelize definition for the `bookings` table.
 *
 * Represents a customer booking/reservation for a business.
 * Fields: customer info, date/time, service, revenue, status.
 * Belongs to a Business (via business_id).
 */
const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/database')

const Booking = sequelize.define('Booking', {
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
  user_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  customer_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  customer_email: {
    type: DataTypes.STRING,
    allowNull: true
  },
  customer_phone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  booking_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  booking_time: {
    type: DataTypes.STRING,
    allowNull: true
  },
  end_time: {
    type: DataTypes.STRING,
    allowNull: true
  },
  service: {
    type: DataTypes.STRING,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  party_size: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 1
  },
  revenue: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0
  },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'completed', 'cancelled', 'no-show'),
    allowNull: false,
    defaultValue: 'confirmed'
  }
}, {
  tableName: 'bookings',
  underscored: true,
  timestamps: true
})

module.exports = Booking
