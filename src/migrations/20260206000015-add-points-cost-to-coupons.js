'use strict'

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('coupons', 'points_cost', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: null
    })
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('coupons', 'points_cost')
  }
}
