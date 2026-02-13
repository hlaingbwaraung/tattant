'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('quiz_scores', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      user_name: {
        type: Sequelize.STRING,
        allowNull: true
      },
      quiz_type: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'jlpt_n3_kanji_reading'
      },
      score: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      total: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 10
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Index for leaderboard queries
    await queryInterface.addIndex('quiz_scores', ['quiz_type', 'score'], {
      name: 'idx_quiz_scores_type_score'
    });

    await queryInterface.addIndex('quiz_scores', ['user_id'], {
      name: 'idx_quiz_scores_user_id'
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('quiz_scores');
  }
};
