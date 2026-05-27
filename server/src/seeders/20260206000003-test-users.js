'use strict'
const { v4: uuidv4 } = require('uuid')
const bcrypt = require('bcryptjs')

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const adminPasswordHash = await bcrypt.hash('admin12345', 10)

    const users = [
      {
        id: uuidv4(),
        email: 'admin@tattant.com',
        password_hash: adminPasswordHash,
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

    const existing = await queryInterface.sequelize.query(
      'SELECT email FROM users WHERE email IN (:emails);',
      {
        replacements: { emails: users.map(user => user.email) },
        type: Sequelize.QueryTypes.SELECT
      }
    )
    const existingEmails = new Set(existing.map(user => user.email))
    const missingUsers = users.filter(user => !existingEmails.has(user.email))

    if (missingUsers.length > 0) {
      await queryInterface.bulkInsert('users', missingUsers, {})
    }

    await queryInterface.bulkUpdate('users', {
      password_hash: adminPasswordHash,
      is_admin: true,
      email_verified: true,
      updated_at: new Date()
    }, {
      email: 'admin@tattant.com'
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('users', {
      email: {
        [Sequelize.Op.in]: ['admin@tattant.com', 'test@example.com']
      }
    }, {})
  }
}
