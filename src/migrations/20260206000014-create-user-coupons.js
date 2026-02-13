'use strict'

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('user_coupons', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      coupon_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'coupons',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      points_spent: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      redeemed_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        allowNull: false
      },
      is_used: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      used_at: {
        type: Sequelize.DATE,
        allowNull: true
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
  },

  async down(queryInterface) {
    await queryInterface.dropTable('user_coupons')
  }
}
