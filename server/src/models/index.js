const User = require('./User')
const Category = require('./Category')
const Business = require('./Business')
const SavedBusiness = require('./SavedBusiness')

// Define associations
Category.hasMany(Business, {
  foreignKey: 'category_id',
  as: 'businesses'
})

Business.belongsTo(Category, {
  foreignKey: 'category_id',
  as: 'category'
})

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

// Direct associations for SavedBusiness
SavedBusiness.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
})

SavedBusiness.belongsTo(Business, {
  foreignKey: 'business_id',
  as: 'business'
})

module.exports = {
  User,
  Category,
  Business,
  SavedBusiness
}
