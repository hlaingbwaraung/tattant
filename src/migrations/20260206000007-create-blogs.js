'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('blogs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      slug: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true
      },
      emoji: {
        type: Sequelize.STRING(10),
        allowNull: false,
        defaultValue: '📝'
      },
      photo: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Image URL or base64 data'
      },
      category: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      tag: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      excerpt: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      read_time: {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: '5 min read'
      },
      author_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      published: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      views: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    await queryInterface.addIndex('blogs', ['slug']);
    await queryInterface.addIndex('blogs', ['category']);
    await queryInterface.addIndex('blogs', ['tag']);
    await queryInterface.addIndex('blogs', ['published']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('blogs');
  }
};
