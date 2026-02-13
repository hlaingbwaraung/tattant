'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('categories', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      name_en: {
        type: Sequelize.STRING,
        allowNull: false
      },
      name_jp: {
        type: Sequelize.STRING,
        allowNull: false
      },
      name_cn: {
        type: Sequelize.STRING,
        allowNull: false
      },
      name_kr: {
        type: Sequelize.STRING,
        allowNull: false
      },
      icon: {
        type: Sequelize.STRING,
        allowNull: true
      },
      slug: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      display_order: {
        type: Sequelize.INTEGER,
        defaultValue: 0
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

    await queryInterface.addIndex('categories', ['slug'])
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('categories')
  }
}
