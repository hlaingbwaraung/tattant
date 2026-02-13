'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('users', 'is_admin', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false
    })

    // Make the existing admin@tattant.com user an admin
    await queryInterface.sequelize.query(
      "UPDATE users SET is_admin = true WHERE email = 'admin@tattant.com'"
    )
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('users', 'is_admin')
  }
}
