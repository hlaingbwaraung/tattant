/**
 * Authentication Configuration
 *
 * Centralises auth-related constants so they can be
 * imported from one place instead of reading process.env everywhere.
 */

require('dotenv').config()

module.exports = {
  jwtSecret:          process.env.JWT_SECRET,
  jwtExpire:          process.env.JWT_EXPIRE || '7d',
  bcryptRounds:       10,
  googleClientId:     process.env.GOOGLE_CLIENT_ID,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET
}
