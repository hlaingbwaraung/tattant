'use strict'
const { v4: uuidv4 } = require('uuid')
const bcrypt = require('bcryptjs')

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const hashedPassword = await bcrypt.hash('admin123', 10)

    const users = [
      {
        id: uuidv4(),
        email: 'admin@tattant.com',
        password_hash: hashedPassword,
        google_id: null,
        name: 'Admin User',
        preferred_language: 'en',
        email_verified: true,
        email_verification_token: null,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        email: 'test@example.com',
        password_hash: await bcrypt.hash('test123', 10),
        google_id: null,
        name: 'Test User',
        preferred_language: 'en',
        email_verified: true,
        email_verification_token: null,
        created_at: new Date(),
        updated_at: new Date()
      }
    ]

    await queryInterface.bulkInsert('users', users, {})
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('users', {
      email: {
        [Sequelize.Op.in]: ['admin@tattant.com', 'test@example.com']
      }
    }, {})
  }
}
