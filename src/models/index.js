/**
 * Model Registry & Associations
 *
 * Central file that imports every Sequelize model and
 * wires up all the associations between them.
 *
 * Relationship map:
 *   Category  1 ── ∞  Business
 *   User      ∞ ── ∞  Business   (through SavedBusiness)
 *   User      1 ── ∞  Blog       (author)
 *   User      1 ── ∞  Business   (owner / shop-owner)
 *   Business  1 ── ∞  Coupon
 *   User      1 ── ∞  QuizScore
 *   User      1 ── ∞  UserCoupon
 *   Coupon    1 ── ∞  UserCoupon
 */

const User          = require('./User')
const Category      = require('./Category')
const Business      = require('./Business')
const SavedBusiness = require('./SavedBusiness')
const Blog          = require('./Blog')
const Coupon        = require('./Coupon')
const QuizScore     = require('./QuizScore')
const UserCoupon    = require('./UserCoupon')

/* ============================
 *  Category ↔ Business
 * ============================ */
Category.hasMany(Business, { foreignKey: 'category_id', as: 'businesses' })
Business.belongsTo(Category, { foreignKey: 'category_id', as: 'category' })

/* ============================
 *  User ↔ SavedBusiness (many-to-many)
 * ============================ */
User.belongsToMany(Business, {
  through: SavedBusiness,
  foreignKey: 'user_id',
  otherKey: 'business_id',
  as: 'savedBusinesses'
})
Business.belongsToMany(User, {
  through: SavedBusiness,
  foreignKey: 'business_id',
  otherKey: 'user_id',
  as: 'savedByUsers'
})

// Direct join-table associations (for eager-loading join table rows)
SavedBusiness.belongsTo(User,     { foreignKey: 'user_id',     as: 'user' })
SavedBusiness.belongsTo(Business, { foreignKey: 'business_id', as: 'business' })

/* ============================
 *  User → Blog  (author)
 * ============================ */
Blog.belongsTo(User, { foreignKey: 'author_id', as: 'author' })
User.hasMany(Blog,   { foreignKey: 'author_id', as: 'blogs' })

/* ============================
 *  User → Business  (shop owner)
 * ============================ */
Business.belongsTo(User, { foreignKey: 'owner_id', as: 'owner' })
User.hasMany(Business,   { foreignKey: 'owner_id', as: 'ownedBusinesses' })

/* ============================
 *  Business → Coupon
 * ============================ */
Coupon.belongsTo(Business,   { foreignKey: 'business_id', as: 'business' })
Business.hasMany(Coupon,     { foreignKey: 'business_id', as: 'coupons' })

/* ============================
 *  User → QuizScore
 * ============================ */
QuizScore.belongsTo(User, { foreignKey: 'user_id', as: 'user' })
User.hasMany(QuizScore,   { foreignKey: 'user_id', as: 'quizScores' })

/* ============================
 *  User / Coupon → UserCoupon (redemptions)
 * ============================ */
UserCoupon.belongsTo(User,   { foreignKey: 'user_id',   as: 'user' })
UserCoupon.belongsTo(Coupon, { foreignKey: 'coupon_id', as: 'coupon' })
User.hasMany(UserCoupon,     { foreignKey: 'user_id',   as: 'redeemedCoupons' })
Coupon.hasMany(UserCoupon,   { foreignKey: 'coupon_id', as: 'redemptions' })

/* ============================
 *  Exports
 * ============================ */
module.exports = {
  User,
  Category,
  Business,
  SavedBusiness,
  Blog,
  Coupon,
  QuizScore,
  UserCoupon
}
