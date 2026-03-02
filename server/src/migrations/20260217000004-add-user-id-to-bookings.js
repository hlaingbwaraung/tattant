/**
 * Migration: Add user_id to bookings table
 *
 * Tracks which user made the booking (for customer booking history).
 * Nullable because existing bookings don't have this field.
 */
'use strict'

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('bookings', 'user_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: { model: 'users', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    })

    // Index for fast user booking lookups
    await queryInterface.addIndex('bookings', ['user_id'])
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('bookings', ['user_id'])
    await queryInterface.removeColumn('bookings', 'user_id')
  }
}
