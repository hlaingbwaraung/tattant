#!/bin/bash
cd /opt/tattant-server

# Generate bcrypt hash and update admin user
node -e "
const bcrypt = require('bcryptjs');
const { Sequelize } = require('sequelize');
require('dotenv').config();

async function main() {
  const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: false
  });
  
  await sequelize.authenticate();
  console.log('Connected to database');
  
  const hash = await bcrypt.hash('admin12345678', 10);
  
  // Try to update existing admin
  const [results] = await sequelize.query(
    \"UPDATE users SET email='mizbwar@gmail.com', password_hash=:hash, is_admin=true, email_verified=true WHERE is_admin=true OR email='admin@admin.com' OR email='admin@tattant.com' OR email='mizbwar@gmail.com' RETURNING email, is_admin\",
    { replacements: { hash } }
  );
  
  if (results.length > 0) {
    console.log('Updated admin:', results[0].email);
  } else {
    // Create new admin
    await sequelize.query(
      \"INSERT INTO users (id, email, password_hash, name, is_admin, email_verified, preferred_language, is_shop_owner, is_premium, points, created_at, updated_at) VALUES (gen_random_uuid(), 'mizbwar@gmail.com', :hash, 'Admin', true, true, 'en', false, false, 0, NOW(), NOW())\",
      { replacements: { hash } }
    );
    console.log('Created new admin: mizbwar@gmail.com');
  }
  
  console.log('Done! Login with mizbwar@gmail.com / admin12345678');
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
"
