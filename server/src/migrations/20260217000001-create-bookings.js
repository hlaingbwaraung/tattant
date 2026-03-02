/**
 * Migration: Create bookings table
 *
 * Stores booking records for shop owners.
 * Each booking belongs to a business and tracks customer info,
 * date/time, service, revenue, and status.
 */
'use strict'

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('bookings', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      business_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'businesses', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      customer_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      customer_email: {
        type: Sequelize.STRING,
        allowNull: true
      },
      customer_phone: {
        type: Sequelize.STRING,
        allowNull: true
      },
      booking_date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      booking_time: {
        type: Sequelize.STRING,
        allowNull: true
      },
      end_time: {
        type: Sequelize.STRING,
        allowNull: true
      },
      service: {
        type: Sequelize.STRING,
        allowNull: true
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      party_size: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 1
      },
      revenue: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0
      },
      status: {
        type: Sequelize.ENUM('pending', 'confirmed', 'completed', 'cancelled', 'no-show'),
        allowNull: false,
        defaultValue: 'confirmed'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    })

    // Indexes for fast lookups
    await queryInterface.addIndex('bookings', ['business_id'])
    await queryInterface.addIndex('bookings', ['booking_date'])
    await queryInterface.addIndex('bookings', ['status'])
    await queryInterface.addIndex('bookings', ['business_id', 'booking_date'])
  },

  async down(queryInterface) {
    await queryInterface.dropTable('bookings')
  }
}
