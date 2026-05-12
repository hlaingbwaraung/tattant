require('dotenv').config()

const baseConfig = {
  use_env_variable: 'DATABASE_URL',
  dialect: 'postgres'
}

const withOptionalSsl = () => {
  if (process.env.DB_SSL !== 'true') return baseConfig

  return {
    ...baseConfig,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  }
}

module.exports = {
  development: withOptionalSsl(),
  test: withOptionalSsl(),
  production: withOptionalSsl()
}
