/**
 * AI Deep Search Controller
 *
 * POST /api/ai-search/search     – Run AI deep search for restaurants
 * POST /api/ai-search/import     – Import selected results into businesses table
 */

const { Business, Category } = require('../models')
const { deepSearch } = require('../services/aiSearchService')

/**
 * POST /api/ai-search/search
 * Body: { query, location, cuisine, maxResults }
 *
 * Runs an AI-powered deep search and returns structured restaurant data.
 */
exports.search = async (req, res) => {
  try {
    if (!req.user?.is_admin) {
      return res.status(403).json({ success: false, error: 'Admin access required' })
    }

    const { query, location, cuisine, maxResults } = req.body

    if (!query || !query.trim()) {
      return res.status(400).json({ success: false, error: 'Search query is required' })
    }

    // Get existing business names to avoid duplicates
    const existingBusinesses = await Business.findAll({ attributes: ['name'] })
    const existingNames = existingBusinesses.map(b => b.name)

    const results = await deepSearch(query, location, {
      cuisine: cuisine || 'Burmese',
      maxResults: maxResults || 10,
      existingNames
    })

    res.json({
      success: true,
      count: results.length,
      data: results
    })
  } catch (error) {
    console.error('AI Search error:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'AI search failed'
    })
  }
}

/**
 * POST /api/ai-search/import
 * Body: { restaurants: [...], category_id }
 *
 * Import selected AI search results into the businesses table.
 * If category_id is not provided, auto-find or create a "Restaurants" category.
 */
exports.importResults = async (req, res) => {
  try {
    if (!req.user?.is_admin) {
      return res.status(403).json({ success: false, error: 'Admin access required' })
    }

    let { restaurants, category_id } = req.body

    if (!restaurants || !Array.isArray(restaurants) || restaurants.length === 0) {
      return res.status(400).json({ success: false, error: 'No restaurants to import' })
    }

    // Find or determine the category
    if (!category_id) {
      const restaurantCat = await Category.findOne({
        where: { slug: 'restaurants' }
      })
      if (restaurantCat) {
        category_id = restaurantCat.id
      } else {
        return res.status(400).json({
          success: false,
          error: 'No category_id provided and no "restaurants" category found'
        })
      }
    }

    // Verify category exists
    const category = await Category.findByPk(category_id)
    if (!category) {
      return res.status(400).json({ success: false, error: 'Invalid category_id' })
    }

    const imported = []
    const skipped = []

    for (const r of restaurants) {
      // Skip if a business with the same name already exists
      const exists = await Business.findOne({ where: { name: r.name } })
      if (exists) {
        skipped.push({ name: r.name, reason: 'Already exists' })
        continue
      }

      try {
        const business = await Business.create({
          category_id,
          name: r.name,
          description_en: r.description_en || null,
          description_my: r.description_my || null,
          address: r.address || null,
          latitude: r.latitude || null,
          longitude: r.longitude || null,
          phone: r.phone || null,
          website: r.website || null,
          opening_hours: r.opening_hours || null,
          price_range: r.price_range || '¥¥',
          languages_supported: r.languages_supported || ['en', 'my'],
          tags: r.tags || ['burmese-food'],
          photos: r.photos || [],
          is_active: true
        })
        imported.push({ id: business.id, name: business.name })
      } catch (err) {
        skipped.push({ name: r.name, reason: err.message })
      }
    }

    res.json({
      success: true,
      message: `Imported ${imported.length} restaurants, skipped ${skipped.length}`,
      imported,
      skipped
    })
  } catch (error) {
    console.error('AI Import error:', error)
    res.status(500).json({ success: false, error: 'Import failed' })
  }
}
