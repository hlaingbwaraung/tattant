/**
 * Visit Controller – track site visits & provide stats for admin dashboard.
 *
 * Exports: recordVisit, getVisitStats
 */
const { Op, fn, col, literal } = require('sequelize')
const { SiteVisit } = require('../models')

/**
 * POST /api/visits/track
 * Records a page visit. Works for both anonymous and authenticated users.
 */
exports.recordVisit = async (req, res) => {
  try {
    let visitor_type = 'anonymous'
    let user_id = null

    if (req.user) {
      user_id = req.user.id
      visitor_type = req.user.is_shop_owner ? 'shop_owner' : 'user'
    }

    await SiteVisit.create({
      visitor_type,
      user_id,
      path: req.body.path || '/',
      ip_address: req.ip,
      user_agent: req.headers['user-agent']
    })

    res.json({ success: true })
  } catch (error) {
    console.error('Record visit error:', error)
    res.status(500).json({ message: 'Failed to record visit' })
  }
}

/**
 * GET /api/visits/stats
 * Admin-only: returns visit statistics with daily breakdown for charts.
 */
exports.getVisitStats = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30

    const since = new Date()
    since.setDate(since.getDate() - days)
    since.setHours(0, 0, 0, 0)

    // Total counts by visitor type
    const totals = await SiteVisit.findAll({
      attributes: [
        'visitor_type',
        [fn('COUNT', col('id')), 'count']
      ],
      where: { created_at: { [Op.gte]: since } },
      group: ['visitor_type'],
      raw: true
    })

    const totalMap = { anonymous: 0, user: 0, shop_owner: 0 }
    totals.forEach(t => { totalMap[t.visitor_type] = parseInt(t.count) })

    // Daily breakdown by visitor type
    const dailyRaw = await SiteVisit.findAll({
      attributes: [
        [fn('DATE', col('created_at')), 'date'],
        'visitor_type',
        [fn('COUNT', col('id')), 'count']
      ],
      where: { created_at: { [Op.gte]: since } },
      group: [fn('DATE', col('created_at')), 'visitor_type'],
      order: [[fn('DATE', col('created_at')), 'ASC']],
      raw: true
    })

    // Build daily array with all types filled in
    const dailyMap = {}
    for (let d = new Date(since); d <= new Date(); d.setDate(d.getDate() + 1)) {
      const key = d.toISOString().slice(0, 10)
      dailyMap[key] = { date: key, anonymous: 0, user: 0, shop_owner: 0 }
    }
    dailyRaw.forEach(r => {
      const key = typeof r.date === 'string' ? r.date.slice(0, 10) : new Date(r.date).toISOString().slice(0, 10)
      if (dailyMap[key]) dailyMap[key][r.visitor_type] = parseInt(r.count)
    })

    const daily = Object.values(dailyMap)

    // Today's count
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const todayCount = await SiteVisit.count({
      where: { created_at: { [Op.gte]: todayStart } }
    })

    // Grand total
    const grandTotal = totalMap.anonymous + totalMap.user + totalMap.shop_owner

    res.json({
      days,
      totals: totalMap,
      grandTotal,
      todayCount,
      daily
    })
  } catch (error) {
    console.error('Visit stats error:', error)
    res.status(500).json({ message: 'Failed to get visit stats' })
  }
}
