#!/bin/bash
cd /opt/tattant-server
node << 'SCRIPT'
const bcrypt = require('bcryptjs');
require('dotenv').config();
const { Sequelize } = require('sequelize');

async function main() {
  const s = new Sequelize(process.env.DATABASE_URL, { dialect: 'postgres', logging: false });
  await s.authenticate();
  console.log('Connected');
  
  const hash = await bcrypt.hash('admin12345678', 10);
  
  const [r] = await s.query(
    'UPDATE users SET password_hash = :hash, is_admin = true, email_verified = true WHERE email = :email RETURNING email, is_admin',
    { replacements: { hash, email: 'mizbwar@gmail.com' } }
  );
  
  if (r.length > 0) {
    console.log('Updated:', r[0].email, '- admin:', r[0].is_admin);
  } else {
    console.log('User not found, creating...');
    await s.query(
      "INSERT INTO users (id, email, password_hash, name, is_admin, email_verified, preferred_language, is_shop_owner, is_premium, points, created_at, updated_at) VALUES (gen_random_uuid(), :email, :hash, 'Admin', true, true, 'en', false, false, 0, NOW(), NOW())",
      { replacements: { hash, email: 'mizbwar@gmail.com' } }
    );
    console.log('Created admin: mizbwar@gmail.com');
  }
  
  console.log('Done! Login: mizbwar@gmail.com / admin12345678');
  process.exit(0);
}

main().catch(e => { console.error(e.message); process.exit(1); });
SCRIPT
