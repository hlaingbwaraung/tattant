const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/database')

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password_hash: {
    type: DataTypes.STRING,
    allowNull: true
  },
  password: {
    type: DataTypes.VIRTUAL,
    set(value) {
      // This is a virtual field that maps to password_hash
      this.setDataValue('password_hash', value)
    },
    get() {
      return this.getDataValue('password_hash')
    }
  },
  google_id: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: true
  },
  preferred_language: {
    type: DataTypes.STRING,
    defaultValue: 'en',
    validate: {
      isIn: [['en', 'jp', 'cn', 'kr']]
    }
  },
  email_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  email_verification_token: {
    type: DataTypes.STRING,
    allowNull: true
  },
  is_admin: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false
  },
  birthdate: {
    type: DataTypes.DATEONLY,
    allowNull: true
  }
}, {
  tableName: 'users',
  underscored: true,
  timestamps: true
})

module.exports = User
