/**
 * Settings Controller
 *
 * GET  /api/settings           – Get all public settings (no auth)
 * GET  /api/settings/:key      – Get a single setting by key (no auth)
 * PUT  /api/settings/:key      – Update a setting (admin only)
 */

const SiteSetting = require('../models/SiteSetting')

// GET /api/settings – all settings (public)
exports.getAllSettings = async (_req, res) => {
  try {
    const settings = await SiteSetting.findAll()
    const result = {}
    settings.forEach(s => { result[s.key] = s.value })
    res.json({ success: true, data: result })
  } catch (err) {
    console.error('Get settings error:', err)
    res.status(500).json({ success: false, error: 'Failed to load settings' })
  }
}

// GET /api/settings/:key – single setting (public)
exports.getSetting = async (req, res) => {
  try {
    const setting = await SiteSetting.findOne({ where: { key: req.params.key } })
    if (!setting) return res.status(404).json({ success: false, error: 'Setting not found' })
    res.json({ success: true, data: setting.value })
  } catch (err) {
    console.error('Get setting error:', err)
    res.status(500).json({ success: false, error: 'Failed to load setting' })
  }
}

// PUT /api/settings/:key – update (admin only)
exports.updateSetting = async (req, res) => {
  try {
    if (!req.user?.is_admin) {
      return res.status(403).json({ success: false, error: 'Admin access required' })
    }
    const { value } = req.body
    const [setting, created] = await SiteSetting.findOrCreate({
      where: { key: req.params.key },
      defaults: { value }
    })
    if (!created) {
      setting.value = value
      await setting.save()
    }
    res.json({ success: true, data: setting.value })
  } catch (err) {
    console.error('Update setting error:', err)
    res.status(500).json({ success: false, error: 'Failed to update setting' })
  }
}
