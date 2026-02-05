const { User } = require('./src/models')
const { sequelize } = require('./src/config/database')

async function cleanupBrokenUsers() {
  try {
    await sequelize.authenticate()
    console.log('Database connected')

    // Find users without password_hash (not Google OAuth users)
    const brokenUsers = await User.findAll({
      where: {
        password_hash: null,
        google_id: null
      }
    })

    console.log(`Found ${brokenUsers.length} users without passwords:`)
    brokenUsers.forEach(user => {
      console.log(`  - ${user.email}`)
    })

    if (brokenUsers.length > 0) {
      // Delete these broken users
      const deleted = await User.destroy({
        where: {
          password_hash: null,
          google_id: null
        }
      })
      console.log(`\n✓ Deleted ${deleted} broken users`)
      console.log('These users will need to register again.')
    } else {
      console.log('\n✓ No broken users found')
    }

    process.exit(0)
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

cleanupBrokenUsers()
