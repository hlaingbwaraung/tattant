'use strict'

/**
 * Migration: Add user_id to bookings table
 *
 * The Booking model defines user_id but the original migration omitted it.
 * This migration adds the column so public bookings can store the
 * authenticated user who made the reservation.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      await queryInterface.addColumn('bookings', 'user_id', {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      })
    } catch (err) {
      // Column may already exist — skip
      if (!err.message.includes('already exists') && !err.message.includes('duplicate column')) {
        throw err
      }
    }

    try {
      await queryInterface.addIndex('bookings', ['user_id'])
    } catch (err) {
      // Index may already exist — skip
    }
  },

  async down(queryInterface) {
    const tableDescription = await queryInterface.describeTable('bookings')
    if (tableDescription.user_id) {
      await queryInterface.removeColumn('bookings', 'user_id')
    }
  }
}
