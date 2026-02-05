'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('saved_businesses', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      business_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'businesses',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      }
    })

    await queryInterface.addIndex('saved_businesses', ['user_id', 'business_id'], { unique: true })
    await queryInterface.addIndex('saved_businesses', ['user_id'])
    await queryInterface.addIndex('saved_businesses', ['business_id'])
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('saved_businesses')
  }
}
