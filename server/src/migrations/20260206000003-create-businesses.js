'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('businesses', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      category_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'categories',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description_en: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      description_jp: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      description_cn: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      description_kr: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      address: {
        type: Sequelize.STRING,
        allowNull: true
      },
      latitude: {
        type: Sequelize.DECIMAL(10, 8),
        allowNull: true
      },
      longitude: {
        type: Sequelize.DECIMAL(11, 8),
        allowNull: true
      },
      phone: {
        type: Sequelize.STRING,
        allowNull: true
      },
      website: {
        type: Sequelize.STRING,
        allowNull: true
      },
      opening_hours: {
        type: Sequelize.JSONB,
        allowNull: true
      },
      price_range: {
        type: Sequelize.STRING,
        allowNull: true
      },
      languages_supported: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        defaultValue: []
      },
      tags: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        defaultValue: []
      },
      photos: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        defaultValue: []
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      }
    })

    await queryInterface.addIndex('businesses', ['category_id'])
    await queryInterface.addIndex('businesses', ['latitude', 'longitude'])
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('businesses')
  }
}
