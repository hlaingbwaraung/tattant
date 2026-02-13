/**
 * Dictionary Routes
 *
 * Provides a server-side proxy to the Jisho.org API to avoid
 * CORS issues when the front-end tries to call it directly.
 *
 * No authentication required – the premium gate is enforced on the client.
 *
 * Endpoints:
 *   GET /api/dictionary/search?q=<keyword>
 */

const express = require('express')
const router  = express.Router()
const dictionaryController = require('../controllers/dictionaryController')

router.get('/search', dictionaryController.search)

module.exports = router
