'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'is_premium', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false
    });

    await queryInterface.addColumn('users', 'premium_type', {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.addColumn('users', 'premium_expires_at', {
      type: Sequelize.DATE,
      allowNull: true
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('users', 'is_premium');
    await queryInterface.removeColumn('users', 'premium_type');
    await queryInterface.removeColumn('users', 'premium_expires_at');
  }
};
