#!/bin/bash
cd /opt/tattant-server
node << 'SCRIPT'
const bcrypt = require('bcryptjs')
require('dotenv').config()
const { Sequelize } = require('sequelize')

async function main() {
  const email = 'abc@gmail.com'
  const plainPassword = 'abc123456'

  const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: false
  })

  await sequelize.authenticate()

  const hash = await bcrypt.hash(plainPassword, 10)

  const [updated] = await sequelize.query(
    'UPDATE users SET password_hash = :hash, email_verified = true, updated_at = NOW() WHERE email = :email RETURNING id, email',
    { replacements: { hash, email } }
  )

  if (updated.length > 0) {
    console.log(`Updated existing user: ${updated[0].email}`)
    process.exit(0)
  }

  const [created] = await sequelize.query(
    "INSERT INTO users (id, email, password_hash, name, preferred_language, email_verified, is_admin, is_shop_owner, is_premium, points, created_at, updated_at) VALUES (gen_random_uuid(), :email, :hash, 'ABC User', 'en', true, false, false, false, 0, NOW(), NOW()) RETURNING id, email",
    { replacements: { email, hash } }
  )

  console.log(`Created user: ${created[0].email}`)
  process.exit(0)
}

main().catch((err) => {
  console.error('Error:', err.message)
  process.exit(1)
})
SCRIPT
