'use strict'

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('site_visits', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      visitor_type: {
        type: Sequelize.ENUM('anonymous', 'user', 'shop_owner'),
        allowNull: false,
        defaultValue: 'anonymous'
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'users', key: 'id' },
        onDelete: 'SET NULL'
      },
      path: {
        type: Sequelize.STRING,
        allowNull: true
      },
      ip_address: {
        type: Sequelize.STRING,
        allowNull: true
      },
      user_agent: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW')
      }
    })

    await queryInterface.addIndex('site_visits', ['visitor_type'])
    await queryInterface.addIndex('site_visits', ['created_at'])
    await queryInterface.addIndex('site_visits', ['user_id'])
  },

  async down(queryInterface) {
    await queryInterface.dropTable('site_visits')
  }
}
