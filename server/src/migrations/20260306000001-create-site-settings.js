'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('site_settings', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      key: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      value: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: {}
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()')
      }
    })

    // Seed default feature flags
    await queryInterface.bulkInsert('site_settings', [{
      id: Sequelize.literal('gen_random_uuid()'),
      key: 'feature_jobs',
      value: JSON.stringify({ enabled: false }),
      created_at: new Date(),
      updated_at: new Date()
    }])
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('site_settings')
  }
}
