/**
 * QuizScore model  –  Sequelize definition for the `quiz_scores` table.
 *
 * Stores a user’s JLPT quiz result: score out of total,
 * quiz_type, and user_name for the leaderboard.
 */
const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/database')

const QuizScore = sequelize.define('QuizScore', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  user_name: {
    type: DataTypes.STRING,
    allowNull: true
  },
  quiz_type: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'jlpt_n3_kanji_reading'
  },
  score: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  total: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 10
  }
}, {
  tableName: 'quiz_scores',
  underscored: true,
  timestamps: true
})

module.exports = QuizScore
