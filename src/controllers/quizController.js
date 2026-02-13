/**
 * Quiz controller  –  submit scores and fetch leaderboard.
 *
 * Exports: submitScore, getLeaderboard
 * Awards 1 point per correct answer on submission.
 */
const QuizScore = require('../models/QuizScore')
const User = require('../models/User')

// POST /api/quiz/scores — save a quiz score
exports.submitScore = async (req, res) => {
  try {
    const { score, total, quiz_type } = req.body
    const userId = req.user.id

    if (score === undefined || score === null || !quiz_type) {
      return res.status(400).json({ message: 'score and quiz_type are required' })
    }

    // Get user name
    const user = await User.findByPk(userId)
    const userName = user?.name || 'Anonymous'

    const entry = await QuizScore.create({
      user_id: userId,
      user_name: userName,
      quiz_type,
      score: Math.min(Math.max(0, parseInt(score)), total || 10),
      total: total || 10
    })

    // Award points: 1 point per correct answer
    const pointsEarned = Math.min(Math.max(0, parseInt(score)), total || 10)
    if (pointsEarned > 0) {
      user.points = (user.points || 0) + pointsEarned
      await user.save()
    }

    res.status(201).json({ success: true, data: entry, pointsEarned, totalPoints: user.points })
  } catch (error) {
    console.error('Submit score error:', error)
    res.status(500).json({ message: 'Failed to save score' })
  }
}

// GET /api/quiz/leaderboard — total scores across ALL quiz types
exports.getLeaderboard = async (req, res) => {
  try {
    const { sequelize } = require('../config/database')

    // Total score leaderboard: sum of best scores per quiz_type per user
    const [leaderboard] = await sequelize.query(`
      SELECT 
        sub.user_id,
        sub.user_name,
        SUM(sub.best_score) as total_score,
        COUNT(DISTINCT sub.quiz_type) as quiz_types_played,
        MAX(sub.latest_date) as last_played
      FROM (
        SELECT DISTINCT ON (user_id, quiz_type)
          user_id, user_name, quiz_type, score as best_score, created_at as latest_date
        FROM quiz_scores
        ORDER BY user_id, quiz_type, score DESC, created_at DESC
      ) sub
      GROUP BY sub.user_id, sub.user_name
      ORDER BY total_score DESC, quiz_types_played DESC
      LIMIT 20
    `, { type: sequelize.QueryTypes.SELECT }).then(rows => [rows])

    // Personal total
    let personalTotal = null
    if (req.user?.id) {
      const [result] = await sequelize.query(`
        SELECT SUM(best_score) as total_score FROM (
          SELECT DISTINCT ON (quiz_type) score as best_score
          FROM quiz_scores
          WHERE user_id = :userId
          ORDER BY quiz_type, score DESC
        ) sub
      `, {
        replacements: { userId: req.user.id },
        type: sequelize.QueryTypes.SELECT
      }).then(rows => [rows])
      personalTotal = result?.total_score ? parseInt(result.total_score) : null
    }

    res.json({ leaderboard, personalBest: personalTotal })
  } catch (error) {
    console.error('Leaderboard error:', error)
    // Fallback: simple query
    try {
      const scores = await QuizScore.findAll({
        order: [['score', 'DESC'], ['created_at', 'ASC']],
        limit: 200
      })

      // Build total scores per user
      const userScores = {}
      for (const s of scores) {
        if (!userScores[s.user_id]) {
          userScores[s.user_id] = { user_id: s.user_id, user_name: s.user_name, total_score: 0, quiz_types_played: 0, last_played: s.created_at, bestPerType: {} }
        }
        const key = s.quiz_type
        if (!userScores[s.user_id].bestPerType[key] || s.score > userScores[s.user_id].bestPerType[key]) {
          userScores[s.user_id].bestPerType[key] = s.score
        }
      }

      const leaderboard = Object.values(userScores).map(u => {
        u.total_score = Object.values(u.bestPerType).reduce((a, b) => a + b, 0)
        u.quiz_types_played = Object.keys(u.bestPerType).length
        delete u.bestPerType
        return u
      }).sort((a, b) => b.total_score - a.total_score).slice(0, 20)

      let personalBest = null
      if (req.user?.id && userScores[req.user.id]) {
        personalBest = leaderboard.find(l => l.user_id === req.user.id)?.total_score || null
      }

      res.json({ leaderboard, personalBest })
    } catch (fallbackErr) {
      console.error('Leaderboard fallback error:', fallbackErr)
      res.status(500).json({ message: 'Failed to fetch leaderboard' })
    }
  }
}
