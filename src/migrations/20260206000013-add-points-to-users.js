'use strict'

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'points', {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      allowNull: false
    })
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('users', 'points')
  }
}
