'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('coupons', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
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
      code: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      discount_type: {
        type: Sequelize.ENUM('percentage', 'fixed', 'freebie'),
        allowNull: false,
        defaultValue: 'percentage'
      },
      discount_value: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },
      min_purchase: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      max_uses: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      used_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      start_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      end_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false
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
    });

    await queryInterface.addIndex('coupons', ['business_id']);
    await queryInterface.addIndex('coupons', ['code']);
    await queryInterface.addIndex('coupons', ['is_active']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('coupons');
  }
};
