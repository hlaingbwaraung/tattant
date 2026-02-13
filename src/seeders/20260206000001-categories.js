'use strict'
const { v4: uuidv4 } = require('uuid')

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const categories = [
      {
        id: uuidv4(),
        name_en: 'Telecom & SIM Cards',
        name_my: 'ဆက်သွယ်ရေးနှင့် SIM ကတ်များ',
        icon: '📶',
        slug: 'sim-cards',
        display_order: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        name_en: 'Ramen Restaurants',
        name_my: 'ရာမင် စားသောက်ဆိုင်များ',
        icon: '🍜',
        slug: 'ramen',
        display_order: 2,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        name_en: 'Sushi Restaurants',
        name_my: 'ဆူရှီ စားသောက်ဆိုင်များ',
        icon: '🍣',
        slug: 'sushi',
        display_order: 3,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        name_en: 'Yakiniku & BBQ',
        name_my: 'ယာကိနိကု နှင့် ဘာဘီကျူး',
        icon: '🥩',
        slug: 'yakiniku',
        display_order: 4,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        name_en: 'Book Stores',
        name_my: 'စာအုပ်ဆိုင်များ',
        icon: '📚',
        slug: 'bookstores',
        display_order: 5,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        name_en: 'Currency Exchange',
        name_my: 'ငွေလဲလှယ်ရေး',
        icon: '💱',
        slug: 'currency-exchange',
        display_order: 6,
        created_at: new Date(),
        updated_at: new Date()
      }
    ]

    await queryInterface.bulkInsert('categories', categories, {})
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('categories', null, {})
  }
}
