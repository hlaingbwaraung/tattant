'use strict'
const { v4: uuidv4 } = require('uuid')

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const categories = [
      {
        id: uuidv4(),
        name_en: 'Telecom & SIM Cards',
        name_jp: '通信・SIMカード',
        name_cn: '电信和SIM卡',
        name_kr: '통신 및 SIM 카드',
        icon: '📶',
        slug: 'sim-cards',
        display_order: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        name_en: 'Ramen Restaurants',
        name_jp: 'ラーメン店',
        name_cn: '拉面店',
        name_kr: '라멘 레스토랑',
        icon: '🍜',
        slug: 'ramen',
        display_order: 2,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        name_en: 'Sushi Restaurants',
        name_jp: '寿司店',
        name_cn: '寿司店',
        name_kr: '스시 레스토랑',
        icon: '🍣',
        slug: 'sushi',
        display_order: 3,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        name_en: 'Yakiniku & BBQ',
        name_jp: '焼肉',
        name_cn: '烤肉',
        name_kr: '야키니쿠',
        icon: '🥩',
        slug: 'yakiniku',
        display_order: 4,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        name_en: 'Book Stores',
        name_jp: '書店',
        name_cn: '书店',
        name_kr: '서점',
        icon: '📚',
        slug: 'bookstores',
        display_order: 5,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        name_en: 'Currency Exchange',
        name_jp: '両替所',
        name_cn: '货币兑换',
        name_kr: '환전소',
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
