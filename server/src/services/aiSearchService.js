/**
 * AI Deep Search Service
 *
 * Uses Google Gemini to perform "deep search" for Burmese restaurants
 * in Japan. The AI generates structured data based on its training
 * knowledge of real businesses, Facebook pages, Google Maps, etc.
 *
 * Each search query instructs Gemini to act as a research bot that
 * dives deep into its knowledge of Burmese restaurants and returns
 * structured JSON results ready to import into the database.
 */

const { GoogleGenerativeAI } = require('@google/generative-ai')

// Models to try in order — if one hits quota limits, fall back to next
const MODEL_CHAIN = [
  'gemini-2.0-flash',
  'gemini-1.5-flash',
  'gemini-1.5-flash-8b',
  'gemini-2.0-flash-lite',
]

let genAI = null

function getGenAI() {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) return null
    genAI = new GoogleGenerativeAI(apiKey)
  }
  return genAI
}

function getModel(modelName = MODEL_CHAIN[0]) {
  const ai = getGenAI()
  if (!ai) return null
  return ai.getGenerativeModel({ model: modelName })
}

/**
 * Sleep helper for retry backoff
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Call Gemini with retry + model fallback.
 * - Retries up to 3 times per model with exponential backoff on 429 errors
 * - Falls back to next model in MODEL_CHAIN if all retries exhausted
 */
async function callWithRetry(prompt, maxRetriesPerModel = 3) {
  const ai = getGenAI()
  if (!ai) throw new Error('AI service not configured. Set GEMINI_API_KEY in .env')

  for (const modelName of MODEL_CHAIN) {
    const model = ai.getGenerativeModel({ model: modelName })
    console.log(`[AI Search] Trying model: ${modelName}`)

    for (let attempt = 1; attempt <= maxRetriesPerModel; attempt++) {
      try {
        const result = await model.generateContent(prompt)
        console.log(`[AI Search] Success with ${modelName} on attempt ${attempt}`)
        return result.response.text()
      } catch (err) {
        const is429 = err.message?.includes('429') ||
                       err.message?.includes('quota') ||
                       err.message?.includes('Too Many Requests') ||
                       err.message?.includes('RESOURCE_EXHAUSTED')

        if (is429) {
          // Extract retry delay from error if available
          const delayMatch = err.message?.match(/retry in ([\d.]+)s/i)
          const baseDelay = delayMatch ? parseFloat(delayMatch[1]) * 1000 : 5000
          const delay = Math.min(baseDelay * Math.pow(2, attempt - 1), 60000)

          if (attempt < maxRetriesPerModel) {
            console.log(`[AI Search] Rate limited on ${modelName}, retrying in ${(delay / 1000).toFixed(1)}s (attempt ${attempt}/${maxRetriesPerModel})`)
            await sleep(delay)
          } else {
            console.log(`[AI Search] ${modelName} quota exhausted after ${maxRetriesPerModel} attempts, trying next model...`)
          }
        } else {
          // Non-rate-limit error — don't retry, throw immediately
          throw err
        }
      }
    }
  }

  throw new Error(
    'All Gemini models quota exhausted. Please wait a few minutes and try again, or upgrade your Google AI plan at https://ai.google.dev/pricing'
  )
}

/**
 * Build the deep search prompt for Gemini.
 * Instructs the AI to return a JSON array of restaurant objects
 * matching the Business model schema.
 */
function buildSearchPrompt(query, location, options = {}) {
  const { cuisine = 'Burmese', maxResults = 10, existingNames = [] } = options

  const exclusionNote = existingNames.length > 0
    ? `\n\nIMPORTANT: Do NOT include any of these already-registered restaurants:\n${existingNames.map(n => `- ${n}`).join('\n')}`
    : ''

  return `You are an expert restaurant researcher and data analyst. You specialize in finding ${cuisine} restaurants, food businesses, and eateries — particularly those run by or catering to the Myanmar/Burmese community.

Your task: Deep search for ${cuisine} restaurants matching this query:
- Search query: "${query}"
- Location: ${location || 'Japan (especially Tokyo, Osaka, Nagoya, Fukuoka)'}

RESEARCH SOURCES TO SIMULATE:
- Facebook pages and groups for Myanmar/Burmese community in Japan
- Google Maps restaurant listings
- Tabelog, Hot Pepper, Gurunavi restaurant databases
- Instagram food accounts
- Myanmar community forums and blogs

IMPORTANT RULES:
1. Return ONLY restaurants you have real knowledge about OR that very likely exist based on your training data
2. Include realistic Japanese addresses with proper format (e.g., "1-2-3 Takadanobaba, Shinjuku-ku, Tokyo 169-0075")
3. Include realistic coordinates (latitude/longitude) for Japan locations
4. Include real phone numbers format (+81-XX-XXXX-XXXX)
5. Generate bilingual descriptions: English and Burmese (Myanmar Unicode)
6. Include realistic opening hours
7. Include relevant tags like: burmese-food, myanmar-cuisine, halal, shan-noodles, mohinga, etc.
8. Price range should be ¥ (cheap), ¥¥ (moderate), ¥¥¥ (expensive), or ¥¥¥¥ (luxury)
9. Return MAXIMUM ${maxResults} results
10. Each restaurant MUST have a unique, realistic name (mix of Burmese and Japanese naming)${exclusionNote}

Return ONLY a valid JSON array (no markdown, no explanation, no code blocks). Each object must have:
{
  "name": "Restaurant Name (Japanese name in katakana)",
  "description_en": "Detailed English description (2-3 sentences about the food, atmosphere, specialties)",
  "description_my": "Detailed Burmese/Myanmar description in Myanmar Unicode script",
  "address": "Full Japanese address",
  "latitude": 35.XXXXX,
  "longitude": 139.XXXXX,
  "phone": "+81-X-XXXX-XXXX",
  "website": "https://... or null",
  "opening_hours": {"mon":"HH:MM-HH:MM","tue":"...","wed":"...","thu":"...","fri":"...","sat":"...","sun":"..."},
  "price_range": "¥ or ¥¥ or ¥¥¥",
  "languages_supported": ["en","my"],
  "tags": ["burmese-food", "tag2", "tag3"],
  "photos": [],
  "source_hint": "Where this restaurant might be found (e.g., 'Facebook: Myanmar Tokyo Group', 'Google Maps', 'Tabelog')",
  "confidence": "high" or "medium" or "low"
}

Return the JSON array now:`
}

/**
 * Parse Gemini response, extracting JSON even if wrapped in markdown.
 */
function parseAIResponse(text) {
  // Try direct JSON parse
  try {
    const parsed = JSON.parse(text)
    return Array.isArray(parsed) ? parsed : [parsed]
  } catch (_) {}

  // Extract from markdown code blocks
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (codeBlockMatch) {
    try {
      const parsed = JSON.parse(codeBlockMatch[1].trim())
      return Array.isArray(parsed) ? parsed : [parsed]
    } catch (_) {}
  }

  // Try to find JSON array in the text
  const arrayMatch = text.match(/\[[\s\S]*\]/)
  if (arrayMatch) {
    try {
      return JSON.parse(arrayMatch[0])
    } catch (_) {}
  }

  return []
}

/**
 * Perform AI deep search.
 * @param {string} query - Search query (e.g., "Burmese restaurants in Takadanobaba")
 * @param {string} location - Location focus (e.g., "Tokyo")
 * @param {object} options - { cuisine, maxResults, existingNames }
 * @returns {Promise<Array>} Array of restaurant objects
 */
async function deepSearch(query, location, options = {}) {
  if (!getGenAI()) {
    throw new Error('AI service not configured. Set GEMINI_API_KEY in .env')
  }

  const prompt = buildSearchPrompt(query, location, options)
  const responseText = await callWithRetry(prompt)
  const restaurants = parseAIResponse(responseText)

  // Validate and clean each result
  return restaurants
    .filter(r => r && r.name && r.address)
    .map(r => ({
      name: r.name || 'Unknown Restaurant',
      description_en: r.description_en || '',
      description_my: r.description_my || '',
      address: r.address || '',
      latitude: r.latitude ? parseFloat(r.latitude) : null,
      longitude: r.longitude ? parseFloat(r.longitude) : null,
      phone: r.phone || null,
      website: r.website || null,
      opening_hours: r.opening_hours || null,
      price_range: ['¥', '¥¥', '¥¥¥', '¥¥¥¥'].includes(r.price_range) ? r.price_range : '¥¥',
      languages_supported: r.languages_supported || ['en', 'my'],
      tags: Array.isArray(r.tags) ? r.tags : ['burmese-food'],
      photos: Array.isArray(r.photos) ? r.photos : [],
      source_hint: r.source_hint || 'AI Deep Search',
      confidence: ['high', 'medium', 'low'].includes(r.confidence) ? r.confidence : 'medium'
    }))
}

module.exports = { deepSearch }
