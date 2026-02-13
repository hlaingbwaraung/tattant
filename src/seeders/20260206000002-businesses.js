'use strict'
const { v4: uuidv4 } = require('uuid')

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // First, get category IDs
    const categories = await queryInterface.sequelize.query(
      'SELECT id, slug FROM categories;',
      { type: Sequelize.QueryTypes.SELECT }
    )

    const getCategoryId = (slug) => {
      const cat = categories.find(c => c.slug === slug)
      return cat ? cat.id : null
    }

    const businesses = [
      // SIM Cards
      {
        id: uuidv4(),
        category_id: getCategoryId('sim-cards'),
        name: 'Sakura Mobile',
        description_en: 'Affordable SIM cards and pocket WiFi rental for tourists. English support available. Multiple data plans.',
        description_my: 'ခရီးသွားများအတွက် စျေးသက်သာသော SIM ကတ်များနှင့် ပိုက်ကက် WiFi ငှားရမ်းခြင်း။ အင်္ဂလိပ်စကား အထောက်အကူပြုမှု ရရှိနိုင်သည်။ ဒေတာအစီအစဉ် အမျိုးမျိုး။',
        address: '1-1-1 Shibuya, Shibuya-ku, Tokyo',
        latitude: 35.6595,
        longitude: 139.7004,
        phone: '+81-3-1234-5678',
        website: 'https://sakuramobile.jp',
        opening_hours: {
          mon: '09:00-20:00',
          tue: '09:00-20:00',
          wed: '09:00-20:00',
          thu: '09:00-20:00',
          fri: '09:00-20:00',
          sat: '10:00-18:00',
          sun: '10:00-18:00'
        },
        price_range: '¥¥',
        languages_supported: ['en', 'my'],
        tags: ['tourist-friendly', 'english-support', 'airport-pickup'],
        photos: ['https://images.unsplash.com/photo-1585909695284-32d2985ac9c0?w=800'],
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        category_id: getCategoryId('sim-cards'),
        name: 'Japan Wireless',
        description_en: 'Premium eSIM and physical SIM cards. Instant activation. 24/7 customer support.',
        description_my: 'ပရီမီယံ eSIM နှင့် SIM ကတ် အစစ်များ။ ချက်ချင်း အသက်သွင်းခြင်း။ ၂၄/၇ ဖောက်သည်ဝန်ဆောင်မှု။',
        address: '2-8-1 Shinjuku, Shinjuku-ku, Tokyo',
        latitude: 35.6938,
        longitude: 139.7034,
        phone: '+81-3-2345-6789',
        website: 'https://japanwireless.com',
        opening_hours: {
          mon: '08:00-21:00',
          tue: '08:00-21:00',
          wed: '08:00-21:00',
          thu: '08:00-21:00',
          fri: '08:00-21:00',
          sat: '09:00-19:00',
          sun: '09:00-19:00'
        },
        price_range: '¥¥¥',
        languages_supported: ['en', 'my'],
        tags: ['esim', 'premium', '24-7-support'],
        photos: ['https://images.unsplash.com/photo-1556656793-08538906a9f8?w=800'],
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },

      // Ramen
      {
        id: uuidv4(),
        category_id: getCategoryId('ramen'),
        name: 'Ichiran Ramen Shibuya',
        description_en: 'Famous tonkotsu ramen chain. Solo dining booths for focused eating experience. Customizable spice levels.',
        description_my: 'နာမည်ကြီး တွန်ကိုဆု ရာမင်ဆိုင်ကွင်း။ တစ်ယောက်တည်းစားရန် ဘူးသီး။ အစပ်အဆင့် စိတ်ကြိုက်ပြင်ဆင်နိုင်သည်။',
        address: '1-22-7 Jinnan, Shibuya-ku, Tokyo',
        latitude: 35.6627,
        longitude: 139.6989,
        phone: '+81-3-3463-3667',
        website: 'https://ichiran.com',
        opening_hours: {
          mon: '10:00-06:00',
          tue: '10:00-06:00',
          wed: '10:00-06:00',
          thu: '10:00-06:00',
          fri: '10:00-06:00',
          sat: '10:00-06:00',
          sun: '10:00-06:00'
        },
        price_range: '¥¥',
        languages_supported: ['en', 'my'],
        tags: ['halal-friendly', 'late-night', 'famous'],
        photos: ['https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800'],
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        category_id: getCategoryId('ramen'),
        name: 'Afuri Ramen Harajuku',
        description_en: 'Light yuzu-citrus ramen. Modern atmosphere. Perfect for first-timers.',
        description_my: 'ပေါ့ပါးသော ယူဇူး-ရှာသီးသီး ရာမင်။ ခေတ်မှီသော ပတ်၀န်ကျင်။ ပထမအကြိမ် စားသူများအတွက် ပြည့်စုံ။',
        address: '1-1-7 Jingumae, Shibuya-ku, Tokyo',
        latitude: 35.6702,
        longitude: 139.7026,
        phone: '+81-3-6447-2afuri',
        website: 'https://afuri.com',
        opening_hours: {
          mon: '11:00-23:00',
          tue: '11:00-23:00',
          wed: '11:00-23:00',
          thu: '11:00-23:00',
          fri: '11:00-23:00',
          sat: '11:00-23:00',
          sun: '11:00-23:00'
        },
        price_range: '¥¥',
        languages_supported: ['en', 'my'],
        tags: ['modern', 'healthy', 'instagram-worthy'],
        photos: ['https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=800'],
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },

      // Sushi
      {
        id: uuidv4(),
        category_id: getCategoryId('sushi'),
        name: 'Sushi Zanmai Tsukiji',
        description_en: 'High-quality sushi at reasonable prices. Famous tuna auction venue. Open 24 hours.',
        description_my: 'စျေးသက်သာသော စျေးနှုန်းဖြင့် အရည်အသွေးမြင့်သော ဆူရှီ။ နာမည်ကြီး တူနားငါးလေလံပွဲနေရာ။ ၂၄နာရီဖွင့်။',
        address: '4-11-9 Tsukiji, Chuo-ku, Tokyo',
        latitude: 35.6654,
        longitude: 139.7707,
        phone: '+81-3-3541-1117',
        website: 'https://www.kiyomura.co.jp',
        opening_hours: {
          mon: '00:00-23:59',
          tue: '00:00-23:59',
          wed: '00:00-23:59',
          thu: '00:00-23:59',
          fri: '00:00-23:59',
          sat: '00:00-23:59',
          sun: '00:00-23:59'
        },
        price_range: '¥¥¥',
        languages_supported: ['en', 'my'],
        tags: ['24-hours', 'famous', 'fresh'],
        photos: ['https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800'],
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },

      // Yakiniku
      {
        id: uuidv4(),
        category_id: getCategoryId('yakiniku'),
        name: 'Gyukaku Shibuya',
        description_en: 'Popular yakiniku chain. All-you-can-eat options. English menu available.',
        description_my: 'လူကြိုက်သော ယာကိနိကု ဆိုင်ကွင်း။ အကုန်မကျန် စားရန် ရွေးချယ်များ။ အင်္ဂလိပ်မန်ယူး ရရှိနိုင်သည်။',
        address: '15-3 Udagawacho, Shibuya-ku, Tokyo',
        latitude: 35.6617,
        longitude: 139.6980,
        phone: '+81-3-5784-3929',
        website: 'https://www.gyukaku.ne.jp',
        opening_hours: {
          mon: '11:30-23:00',
          tue: '11:30-23:00',
          wed: '11:30-23:00',
          thu: '11:30-23:00',
          fri: '11:30-00:00',
          sat: '11:30-00:00',
          sun: '11:30-23:00'
        },
        price_range: '¥¥¥',
        languages_supported: ['en', 'my'],
        tags: ['all-you-can-eat', 'group-friendly', 'english-menu'],
        photos: ['https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=800'],
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },

      // Bookstores
      {
        id: uuidv4(),
        category_id: getCategoryId('bookstores'),
        name: 'Kinokuniya Shinjuku',
        description_en: 'Massive bookstore with extensive English and manga sections. 7 floors of books.',
        description_my: 'အင်္ဂလိပ်နှင့် မန်ဂါ ကပ်များ ကျယ်ပြန့်သော စာအုပ်ဆိုင်ကြီး။ စာအုပ်များ ၇ထပ်။',
        address: '3-17-7 Shinjuku, Shinjuku-ku, Tokyo',
        latitude: 35.6910,
        longitude: 139.7043,
        phone: '+81-3-3354-0131',
        website: 'https://www.kinokuniya.co.jp',
        opening_hours: {
          mon: '10:00-21:00',
          tue: '10:00-21:00',
          wed: '10:00-21:00',
          thu: '10:00-21:00',
          fri: '10:00-21:00',
          sat: '10:00-21:00',
          sun: '10:00-21:00'
        },
        price_range: '¥¥',
        languages_supported: ['en', 'my'],
        tags: ['english-books', 'manga', 'large-selection'],
        photos: ['https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800'],
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },

      // Currency Exchange
      {
        id: uuidv4(),
        category_id: getCategoryId('currency-exchange'),
        name: 'Travelex Narita Airport',
        description_en: 'Currency exchange at Narita Airport. Competitive rates. Open early to late.',
        description_my: 'နာရီတာလေဆိပ်ကွင်းတွင် ငွေလဲလှယ်ရေး။ ယှဉ်ပြိုင်နိုင်သော နှုန်းများ။ မနက်စောစောမှ ညနေညမှိုင်းအထိ ဖွင့်။',
        address: 'Narita International Airport Terminal 1, Narita, Chiba',
        latitude: 35.7647,
        longitude: 140.3864,
        phone: '+81-476-34-5877',
        website: 'https://www.travelex.co.jp',
        opening_hours: {
          mon: '06:00-22:00',
          tue: '06:00-22:00',
          wed: '06:00-22:00',
          thu: '06:00-22:00',
          fri: '06:00-22:00',
          sat: '06:00-22:00',
          sun: '06:00-22:00'
        },
        price_range: '¥',
        languages_supported: ['en', 'my'],
        tags: ['airport', 'competitive-rates', 'convenient'],
        photos: ['https://images.unsplash.com/photo-1580519542036-c47de6196ba5?w=800'],
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ]

    // Stringify JSONB fields for bulkInsert
    const processedBusinesses = businesses.map(biz => ({
      ...biz,
      opening_hours: JSON.stringify(biz.opening_hours)
    }))

    await queryInterface.bulkInsert('businesses', processedBusinesses, {})
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('businesses', null, {})
  }
}
