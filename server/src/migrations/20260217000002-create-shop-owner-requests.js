'use strict'

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('shop_owner_requests', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE'
      },
      shop_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      shop_description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      shop_phone: {
        type: Sequelize.STRING,
        allowNull: true
      },
      shop_address: {
        type: Sequelize.STRING,
        allowNull: true
      },
      shop_category: {
        type: Sequelize.STRING,
        allowNull: true
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('pending', 'approved', 'rejected'),
        defaultValue: 'pending',
        allowNull: false
      },
      admin_note: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      reviewed_by: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'users', key: 'id' }
      },
      reviewed_at: {
        type: Sequelize.DATE,
        allowNull: true
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

    await queryInterface.addIndex('shop_owner_requests', ['user_id'])
    await queryInterface.addIndex('shop_owner_requests', ['status'])
  },

  async down(queryInterface) {
    await queryInterface.dropTable('shop_owner_requests')
  }
}
