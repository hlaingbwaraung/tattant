/**
 * Database Configuration
 *
 * Creates and exports a Sequelize instance connected to PostgreSQL.
 * In production, SSL is enabled for secure cloud connections.
 */

const { Sequelize } = require('sequelize')
require('dotenv').config()

const isProduction = process.env.NODE_ENV === 'production'

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',

  // Only log SQL queries in development
  logging: process.env.NODE_ENV === 'development' ? console.log : false,

  // Connection pool settings
  pool: {
    max: 5,       // max simultaneous connections
    min: 0,       // min idle connections
    acquire: 30000, // max ms to wait for a connection
    idle: 10000     // max ms a connection can sit idle
  },

  // Production: require SSL for hosted PostgreSQL (e.g. Render)
  ...(isProduction && {
    dialectOptions: {
      ssl: { require: true, rejectUnauthorized: false }
    }
  })
})

/**
 * Verify the database connection is working.
 * Called once at server startup.
 */
const testConnection = async () => {
  try {
    await sequelize.authenticate()
    console.log('✓ Database connection established successfully.')
  } catch (error) {
    console.error('✗ Unable to connect to the database:', error)
  }
}

module.exports = { sequelize, testConnection }
