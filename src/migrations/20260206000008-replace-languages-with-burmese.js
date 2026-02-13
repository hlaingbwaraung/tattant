'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Categories: remove jp/cn/kr columns, add my column
    await queryInterface.addColumn('categories', 'name_my', {
      type: Sequelize.STRING,
      allowNull: true
    })

    // Copy name_en as placeholder for name_my
    await queryInterface.sequelize.query(
      `UPDATE categories SET name_my = name_en`
    )

    // Make name_my NOT NULL
    await queryInterface.changeColumn('categories', 'name_my', {
      type: Sequelize.STRING,
      allowNull: false
    })

    // Remove old language columns
    await queryInterface.removeColumn('categories', 'name_jp')
    await queryInterface.removeColumn('categories', 'name_cn')
    await queryInterface.removeColumn('categories', 'name_kr')

    // Businesses: remove jp/cn/kr description columns, add my column
    await queryInterface.addColumn('businesses', 'description_my', {
      type: Sequelize.TEXT,
      allowNull: true
    })

    // Copy description_en as placeholder for description_my
    await queryInterface.sequelize.query(
      `UPDATE businesses SET description_my = description_en`
    )

    // Remove old language columns
    await queryInterface.removeColumn('businesses', 'description_jp')
    await queryInterface.removeColumn('businesses', 'description_cn')
    await queryInterface.removeColumn('businesses', 'description_kr')
  },

  down: async (queryInterface, Sequelize) => {
    // Re-add old columns for categories
    await queryInterface.addColumn('categories', 'name_jp', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: ''
    })
    await queryInterface.addColumn('categories', 'name_cn', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: ''
    })
    await queryInterface.addColumn('categories', 'name_kr', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: ''
    })
    await queryInterface.removeColumn('categories', 'name_my')

    // Re-add old columns for businesses
    await queryInterface.addColumn('businesses', 'description_jp', {
      type: Sequelize.TEXT,
      allowNull: true
    })
    await queryInterface.addColumn('businesses', 'description_cn', {
      type: Sequelize.TEXT,
      allowNull: true
    })
    await queryInterface.addColumn('businesses', 'description_kr', {
      type: Sequelize.TEXT,
      allowNull: true
    })
    await queryInterface.removeColumn('businesses', 'description_my')
  }
}
