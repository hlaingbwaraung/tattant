'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('blogs', 'title_my', {
      type: Sequelize.STRING(255),
      allowNull: true,
      after: 'title'
    });

    await queryInterface.addColumn('blogs', 'excerpt_my', {
      type: Sequelize.TEXT,
      allowNull: true,
      after: 'excerpt'
    });

    await queryInterface.addColumn('blogs', 'content_my', {
      type: Sequelize.TEXT,
      allowNull: true,
      after: 'content'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('blogs', 'title_my');
    await queryInterface.removeColumn('blogs', 'excerpt_my');
    await queryInterface.removeColumn('blogs', 'content_my');
  }
};
