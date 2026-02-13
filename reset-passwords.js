const bcrypt = require('bcryptjs')
require('dotenv').config()
const { sequelize } = require('./src/config/database')
const { User } = require('./src/models')

async function resetPasswords() {
  try {
    await sequelize.authenticate()
    console.log('Database connected.')

    // 1) Reset ALL user passwords to "admin123"
    const defaultHash = await bcrypt.hash('admin123', 10)
    const [affectedCount] = await User.update(
      { password_hash: defaultHash },
      { where: {}, individualHooks: false }
    )
    console.log(`Reset passwords for ${affectedCount} users to "admin123".`)

    // 2) Ensure admin@admin.com exists with admin privileges
    let admin = await User.findOne({ where: { email: 'admin@admin.com' } })
    if (admin) {
      admin.password_hash = defaultHash
      admin.is_admin = true
      admin.email_verified = true
      await admin.save()
      console.log('Updated existing admin@admin.com — is_admin=true, password=admin123')
    } else {
      await User.create({
        name: 'Admin',
        email: 'admin@admin.com',
        password_hash: defaultHash,
        is_admin: true,
        email_verified: true
      })
      console.log('Created admin@admin.com — is_admin=true, password=admin123')
    }

    console.log('\nDone! All passwords reset to "admin123".')
    process.exit(0)
  } catch (err) {
    console.error('Error:', err)
    process.exit(1)
  }
}

resetPasswords()
