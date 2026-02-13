/**
 * User model  –  Sequelize definition for the `users` table.
 *
 * Fields:
 *   id, email, password_hash (+ virtual `password`), google_id,
 *   name, preferred_language, email_verified, email_verification_token,
 *   is_admin, birthdate, is_shop_owner, is_premium, premium_type,
 *   premium_expires_at, points
 *
 * Auth can be local (email + password_hash) or Google OAuth (google_id).
 */
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
      isIn: [['en', 'my']]
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
  },
  is_shop_owner: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false
  },
  is_premium: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false
  },
  premium_type: {
    type: DataTypes.STRING,
    allowNull: true
  },
  premium_expires_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  points: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false
  },
  otp_code: {
    type: DataTypes.STRING,
    allowNull: true
  },
  otp_expires_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'users',
  underscored: true,
  timestamps: true
})

module.exports = User
