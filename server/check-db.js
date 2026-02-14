require('dotenv').config()
const { sequelize } = require('./src/config/database')

async function listTables() {
  try {
    await sequelize.authenticate()
    console.log('Connected to Supabase!')
    
    const result = await sequelize.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema='public'"
    )
    const tables = result[0]
    console.log('\nTables found:')
    if (tables && tables.length > 0) {
      tables.forEach(t => console.log('  -', t.table_name))
    } else {
      console.log('  (none)')
    }
    
    // Check if users table exists and list some users
    try {
      const usersResult = await sequelize.query('SELECT id, email, is_admin FROM users LIMIT 10')
      const users = usersResult[0]
      console.log('\nExisting users:')
      if (users && users.length > 0) {
        users.forEach(u => console.log(`  - ${u.email} (admin: ${u.is_admin})`))
      } else {
        console.log('  (no users)')
      }
    } catch (e) {
      console.log('\nNo users table or empty')
    }
    
    process.exit(0)
  } catch (err) {
    console.error('Error:', err.message)
    process.exit(1)
  }
}

listTables()
