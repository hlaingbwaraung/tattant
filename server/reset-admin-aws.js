const bcrypt = require('bcryptjs')
require('dotenv').config()
const { sequelize } = require('./src/config/database')
const { User } = require('./src/models')

async function resetAdmin() {
  try {
    await sequelize.authenticate()
    console.log('✓ Database connected successfully.')

    // Sync all models to create tables if they don't exist
    await sequelize.sync()
    console.log('✓ Database tables synced.')

    const adminEmail = 'mizbwar@gmail.com'
    const adminPassword = 'admin12345678'
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(adminPassword, 10)
    
    // Check if admin user exists
    let admin = await User.findOne({ where: { email: adminEmail } })
    
    if (admin) {
      // Update existing user
      admin.password_hash = hashedPassword
      admin.is_admin = true
      admin.email_verified = true
      admin.name = admin.name || 'Admin'
      await admin.save()
      console.log(`✓ Updated existing user: ${adminEmail}`)
      console.log('  - Email: mizbwar@gmail.com')
      console.log('  - Password: admin12345678')
      console.log('  - Admin privileges: enabled')
    } else {
      // Create new admin user
      await User.create({
        email: adminEmail,
        password_hash: hashedPassword,
        name: 'Admin',
        is_admin: true,
        email_verified: true,
        preferred_language: 'en'
      })
      console.log(`✓ Created new admin user: ${adminEmail}`)
      console.log('  - Email: mizbwar@gmail.com')
      console.log('  - Password: admin12345678')
      console.log('  - Admin privileges: enabled')
    }

    console.log('\n✓ Admin reset complete!')
    console.log('You can now login at tattant.com with:')
    console.log('  Email: mizbwar@gmail.com')
    console.log('  Password: admin12345678')
    
    process.exit(0)
  } catch (err) {
    console.error('✗ Error:', err)
    process.exit(1)
  }
}

resetAdmin()
