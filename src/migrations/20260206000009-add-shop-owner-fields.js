'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Add is_shop_owner to users
    await queryInterface.addColumn('users', 'is_shop_owner', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false
    });

    // Add owner_id to businesses
    await queryInterface.addColumn('businesses', 'owner_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('users', 'is_shop_owner');
    await queryInterface.removeColumn('businesses', 'owner_id');
  }
};
