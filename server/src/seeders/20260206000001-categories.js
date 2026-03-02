'use strict';
const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const categories = [
      {
        id: uuidv4(),
        name_en: 'Phone & SIM cards',
        name_my: 'ဖုန်းနှင့် ဆင်းကတ်များ',
        icon: '📱',
        slug: 'phone-and-sim-cards',
        display_order: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        name_en: 'Restaurants',
        name_my: 'စားသောက်ဆိုင်များ',
        icon: '🍽️',
        slug: 'restaurants',
        display_order: 2,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        name_en: 'Real Estate',
        name_my: 'အိမ်ခြံမြေ',
        icon: '🏠',
        slug: 'real-estate',
        display_order: 3,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        name_en: 'Book Stores',
        name_my: 'စာအုပ်ဆိုင်များ',
        icon: '📚',
        slug: 'book-stores',
        display_order: 4,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        name_en: 'Currency Exchange',
        name_my: 'ငွေလွှဲနှင့်ငွေလဲ',
        icon: '💱',
        slug: 'currency-exchange',
        display_order: 5,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    await queryInterface.bulkInsert('categories', categories, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('categories', null, {});
  }
};
