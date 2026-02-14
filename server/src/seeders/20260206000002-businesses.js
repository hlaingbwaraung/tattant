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
        description_my: 'ခရီးသွားများအတွက် စျေးနှုန်းသက်သာသော SIM ကတ်များနှင့် Pocket WiFi ငှားရမ်းနိုင်ပါသည်။ အင်္ဂလိပ်ဘာသာဖြင့် ဝန်ဆောင်မှုပေးပြီး Data Plan အမျိုးမျိုး ရွေးချယ်နိုင်ပါသည်။',
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
        description_my: 'ပရီမီယံ eSIM နှင့် ရိုးရိုး SIM ကတ်များ ရရှိနိုင်ပါသည်။ ချက်ချင်း အသုံးပြုနိုင်ပြီး ၂၄ နာရီ ဝန်ဆောင်မှုပေးပါသည်။',
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

      // Burmese Restaurants in Tokyo
      {
        id: uuidv4(),
        category_id: getCategoryId('ramen'),
        name: 'Nong Inlay (ノングインレー)',
        description_en: 'Authentic Burmese & Shan cuisine in the heart of Takadanobaba. Famous for Shan noodles, tea leaf salad, and rich curries. A beloved gathering spot for the Burmese community in Tokyo.',
        description_my: 'တကဒနိုဘာဘ ရှိ စစ်မှန်သော မြန်မာနှင့် ရှမ်းအစားအစာဆိုင်။ ရှမ်းခေါက်ဆွဲ၊ လက်ဖက်သုပ်နှင့် ဟင်းချက်အမျိုးမျိုးဖြင့် နာမည်ကြီးပါသည်။ တိုကျိုရှိ မြန်မာအသိုင်းအဝိုင်း စုဝေးရာ နေရာလည်းဖြစ်ပါသည်။',
        address: '1-26-12 Takadanobaba, Shinjuku-ku, Tokyo 169-0075',
        latitude: 35.7128,
        longitude: 139.7036,
        phone: '+81-3-3205-2155',
        website: null,
        opening_hours: {
          mon: '11:00-22:00',
          tue: '11:00-22:00',
          wed: '11:00-22:00',
          thu: '11:00-22:00',
          fri: '11:00-22:00',
          sat: '11:00-22:00',
          sun: '11:00-22:00'
        },
        price_range: '¥¥',
        languages_supported: ['en', 'my'],
        tags: ['burmese-food', 'shan-noodles', 'tea-leaf-salad', 'halal-options'],
        photos: ['https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800'],
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        category_id: getCategoryId('ramen'),
        name: 'Myanmar Shwe Myay (ミャンマー・シュエミャイ)',
        description_en: 'Popular Burmese eatery in Takadanobaba serving mohinga, Burmese curry rice, and crispy samusas. Affordable prices and generous portions loved by students and workers alike.',
        description_my: 'တကဒနိုဘာဘ ရှိ လူကြိုက်များသော မြန်မာစားသောက်ဆိုင်။ မုန့်ဟင်းခါး၊ ထမင်းနှင့်ဟင်း၊ ဆမူဆာ စသည်တို့ကို ရရှိနိုင်ပါသည်။ စျေးနှုန်းသက်သာပြီး ပမာဏများစွာ ရရှိနိုင်ပါသည်။',
        address: '3-7-5 Takadanobaba, Shinjuku-ku, Tokyo 169-0075',
        latitude: 35.7133,
        longitude: 139.7059,
        phone: '+81-3-3366-8839',
        website: null,
        opening_hours: {
          mon: '11:00-15:00, 17:00-22:00',
          tue: '11:00-15:00, 17:00-22:00',
          wed: 'Closed',
          thu: '11:00-15:00, 17:00-22:00',
          fri: '11:00-15:00, 17:00-22:00',
          sat: '11:00-22:00',
          sun: '11:00-22:00'
        },
        price_range: '¥',
        languages_supported: ['en', 'my'],
        tags: ['burmese-food', 'mohinga', 'affordable', 'curry-rice'],
        photos: ['https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800'],
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        category_id: getCategoryId('sushi'),
        name: 'Ruby Myanmar (ルビーミャンマー)',
        description_en: 'Beloved Burmese restaurant near Takadanobaba station. Known for authentic Burmese biryani, fish curry, and traditional sweets. Cozy family-run atmosphere with Burmese TV playing.',
        description_my: 'တကဒနိုဘာဘ ဘူတာရှေ့ အနီးရှိ ချစ်စဖွယ် မြန်မာစားသောက်ဆိုင်။ စစ်မှန်သော မြန်မာဒံပေါက်ထမင်း၊ ငါးဟင်းနှင့် မြန်မာမုန့်များ ရရှိနိုင်ပါသည်။ မိသားစုလို ပျော်ရွှင်ဖွယ် ပတ်ဝန်းကျင်ဖြစ်ပါသည်။',
        address: '3-1-25 Takadanobaba, Shinjuku-ku, Tokyo 169-0075',
        latitude: 35.7131,
        longitude: 139.7041,
        phone: '+81-3-3200-7857',
        website: null,
        opening_hours: {
          mon: '11:00-15:00, 17:00-22:30',
          tue: '11:00-15:00, 17:00-22:30',
          wed: '11:00-15:00, 17:00-22:30',
          thu: '11:00-15:00, 17:00-22:30',
          fri: '11:00-15:00, 17:00-23:00',
          sat: '11:00-23:00',
          sun: '11:00-22:00'
        },
        price_range: '¥¥',
        languages_supported: ['en', 'my'],
        tags: ['burmese-food', 'biryani', 'fish-curry', 'family-friendly'],
        photos: ['https://images.unsplash.com/photo-1567337710282-00832b415979?w=800'],
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        category_id: getCategoryId('sushi'),
        name: 'Min Tei (ミンテイ)',
        description_en: 'Hidden gem Burmese restaurant in Shimokitazawa. Serves traditional tea leaf salad, coconut chicken noodles (ohn no khauk swe), and refreshing Burmese milk tea in a trendy neighborhood.',
        description_my: 'ရှိမိုကီတဇဝ ရှိ လူသိနည်းသော မြန်မာစားသောက်ဆိုင်ကောင်း။ လက်ဖက်သုပ်၊ အုန်းနို့ခေါက်ဆွဲနှင့် မြန်မာလက်ဖက်ရည် စသည်တို့ကို ရရှိနိုင်ပါသည်။ ခေတ်မှီရပ်ကွက်တွင် တည်ရှိပါသည်။',
        address: '2-25-2 Kitazawa, Setagaya-ku, Tokyo 155-0031',
        latitude: 35.6614,
        longitude: 139.6681,
        phone: '+81-3-3410-6366',
        website: null,
        opening_hours: {
          mon: 'Closed',
          tue: '11:30-14:30, 17:30-22:00',
          wed: '11:30-14:30, 17:30-22:00',
          thu: '11:30-14:30, 17:30-22:00',
          fri: '11:30-14:30, 17:30-23:00',
          sat: '11:30-23:00',
          sun: '11:30-21:00'
        },
        price_range: '¥¥',
        languages_supported: ['en', 'my'],
        tags: ['burmese-food', 'coconut-noodles', 'tea-leaf-salad', 'trendy-area'],
        photos: ['https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=800'],
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        category_id: getCategoryId('yakiniku'),
        name: 'Golden Myanmar (ゴールデン・ミャンマー)',
        description_en: 'Lively Burmese restaurant and bar in Takadanobaba. Famous for htamin jin (fermented rice salad), grilled skewers, and Myanmar Beer. Live Burmese music on weekends!',
        description_my: 'တကဒနိုဘာဘ ရှိ အသက်ဝင်လှုပ်ရှားသော မြန်မာစားသောက်ဆိုင်နှင့် ဘား။ ထမင်းချဉ်၊ အသားကင်တံချောင်းများနှင့် မြန်မာဘီယာ စသည်တို့ဖြင့် နာမည်ကြီးပါသည်။ စနေ-တနင်္ဂနွေ ညများတွင် မြန်မာဂီတဖျော်ဖြေမှုရှိပါသည်!',
        address: '3-3-3 Takadanobaba, Shinjuku-ku, Tokyo 169-0075',
        latitude: 35.7126,
        longitude: 139.7048,
        phone: '+81-3-3367-3378',
        website: null,
        opening_hours: {
          mon: '17:00-23:00',
          tue: '17:00-23:00',
          wed: '17:00-23:00',
          thu: '17:00-23:00',
          fri: '17:00-01:00',
          sat: '12:00-01:00',
          sun: '12:00-22:00'
        },
        price_range: '¥¥',
        languages_supported: ['en', 'my'],
        tags: ['burmese-food', 'bar', 'live-music', 'myanmar-beer', 'grilled-skewers'],
        photos: ['https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800'],
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        category_id: getCategoryId('yakiniku'),
        name: 'Mandalay Restaurant (マンダレー)',
        description_en: 'Upscale Burmese dining in Shin-Okubo. Features traditional Mandalay cuisine with rich curries, laphet thoke, and Burmese desserts. Popular for group celebrations and weekend gatherings.',
        description_my: 'ရှင်းအိုကုဘို ရှိ အဆင့်မြင့် မြန်မာစားသောက်ဆိုင်။ မန္တလေးရိုးရာ ဟင်းလျာများဖြစ်သော ဟင်းအမျိုးမျိုး၊ လက်ဖက်သုပ်နှင့် မြန်မာမုန့်များ ရရှိနိုင်ပါသည်။ အဖွဲ့လိုက်ပွဲများအတွက် လူကြိုက်များပါသည်။',
        address: '1-1-3 Hyakunincho, Shinjuku-ku, Tokyo 169-0073',
        latitude: 35.7012,
        longitude: 139.7003,
        phone: '+81-3-6233-8897',
        website: null,
        opening_hours: {
          mon: '11:00-15:00, 17:00-23:00',
          tue: '11:00-15:00, 17:00-23:00',
          wed: 'Closed',
          thu: '11:00-15:00, 17:00-23:00',
          fri: '11:00-15:00, 17:00-23:30',
          sat: '11:00-23:30',
          sun: '11:00-22:00'
        },
        price_range: '¥¥¥',
        languages_supported: ['en', 'my'],
        tags: ['burmese-food', 'upscale', 'mandalay-cuisine', 'group-dining', 'celebrations'],
        photos: ['https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800'],
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        category_id: getCategoryId('ramen'),
        name: 'Yoma Myanmar (ヨーマミャンマー)',
        description_en: 'Cozy Burmese cafe in Nakano known for rich mohinga breakfast soup, samusa thoke, and strong Burmese coffee. A morning favorite among Myanmar expats.',
        description_my: 'နကနို ရှိ သက်တောင့်သက်သာ မြန်မာကဖီးဆိုင်။ မုန့်ဟင်းခါး မနက်စာ၊ ဆမူဆာသုပ်နှင့် မြန်မာကော်ဖီ စသည်တို့ဖြင့် နာမည်ကြီးပါသည်။ မြန်မာရွှေ့ပြောင်းနေထိုင်သူများ၏ မနက်စာ အကြိုက်ဆုံးနေရာဖြစ်ပါသည်။',
        address: '5-52-15 Nakano, Nakano-ku, Tokyo 164-0001',
        latitude: 35.7075,
        longitude: 139.6649,
        phone: '+81-3-3384-2288',
        website: null,
        opening_hours: {
          mon: '08:00-15:00, 17:00-21:00',
          tue: '08:00-15:00, 17:00-21:00',
          wed: 'Closed',
          thu: '08:00-15:00, 17:00-21:00',
          fri: '08:00-15:00, 17:00-21:00',
          sat: '08:00-21:00',
          sun: '08:00-21:00'
        },
        price_range: '¥',
        languages_supported: ['en', 'my'],
        tags: ['burmese-food', 'mohinga', 'breakfast', 'coffee', 'affordable'],
        photos: ['https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800'],
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        category_id: getCategoryId('sushi'),
        name: 'Bagan Restaurant (バガン)',
        description_en: 'Elegant Burmese restaurant in Ikebukuro inspired by the ancient temples of Bagan. Specializes in Burmese set meals, pennywort salad, and traditional egg noodle salad (nan gyi thoke).',
        description_my: 'ဘုရားပုဂံ၏ လှပမှုကို ပုံဖော်ထားသော အီကေဘိုကိုရို ရှိ မြန်မာစားသောက်ဆိုင်။ မြန်မာ Set Meal၊ မြင်းခွာရွက်သုပ်နှင့် နန်းကြီးသုပ် စသည်တို့ကို အထူးပြင်ဆင်ထားပါသည်။',
        address: '2-63-4 Ikebukuro, Toshima-ku, Tokyo 171-0014',
        latitude: 35.7295,
        longitude: 139.7109,
        phone: '+81-3-5951-3388',
        website: null,
        opening_hours: {
          mon: '11:00-15:00, 17:00-22:00',
          tue: '11:00-15:00, 17:00-22:00',
          wed: '11:00-15:00, 17:00-22:00',
          thu: '11:00-15:00, 17:00-22:00',
          fri: '11:00-15:00, 17:00-23:00',
          sat: '11:00-23:00',
          sun: '11:00-22:00'
        },
        price_range: '¥¥',
        languages_supported: ['en', 'my'],
        tags: ['burmese-food', 'set-meals', 'nan-gyi-thoke', 'elegant'],
        photos: ['https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800'],
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        category_id: getCategoryId('ramen'),
        name: 'Shwe Taung (シュエタウン)',
        description_en: 'Casual Burmese street food stall in Shin-Okubo. Try their famous Shan tofu salad, tea leaf rice, and crispy onion fritters. Quick, cheap, and incredibly flavorful.',
        description_my: 'ရှင်းအိုကုဘို ရှိ မြန်မာလမ်းဘေးစားစရာဆိုင်။ ရှမ်းတိုဟူးသုပ်၊ လက်ဖက်ထမင်းနှင့် ကြက်သွန်နီကြော် စသည့် စာားစရာများ ရရှိနိုင်ပါသည်။ မြန်မြန်ဆန်ဆန်၊ စျေးသက်သာပြီး အလွန်အရသာရှိပါသည်။',
        address: '1-3-20 Hyakunincho, Shinjuku-ku, Tokyo 169-0073',
        latitude: 35.7008,
        longitude: 139.6998,
        phone: '+81-3-6205-5521',
        website: null,
        opening_hours: {
          mon: '10:00-21:00',
          tue: '10:00-21:00',
          wed: '10:00-21:00',
          thu: '10:00-21:00',
          fri: '10:00-22:00',
          sat: '10:00-22:00',
          sun: '10:00-21:00'
        },
        price_range: '¥',
        languages_supported: ['en', 'my'],
        tags: ['burmese-food', 'street-food', 'shan-tofu', 'affordable', 'quick-eats'],
        photos: ['https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800'],
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        category_id: getCategoryId('yakiniku'),
        name: 'Inle Lake (インレー湖)',
        description_en: 'Premium Burmese BBQ and hotpot restaurant in Takadanobaba. Named after the famous Inle Lake. Grilled meats Burmese-style with special dipping sauces, plus traditional soups and salads.',
        description_my: 'တကဒနိုဘာဘ ရှိ မြန်မာအသားကင်နှင့် ဟော့ပေါ့စားသောက်ဆိုင်။ နာမည်ကြီး အင်းလေးကန်မှ အမည်ယူထားပါသည်။ မြန်မာအမဲ့ရည်ဖြင့် အသားကင်များ၊ ရိုးရာစူပ်နှင့် အသုပ်များ ရရှိနိုင်ပါသည်။',
        address: '3-6-10 Takadanobaba, Shinjuku-ku, Tokyo 169-0075',
        latitude: 35.7130,
        longitude: 139.7055,
        phone: '+81-3-3368-5577',
        website: null,
        opening_hours: {
          mon: '17:00-23:00',
          tue: '17:00-23:00',
          wed: '17:00-23:00',
          thu: '17:00-23:00',
          fri: '17:00-00:00',
          sat: '12:00-00:00',
          sun: '12:00-22:00'
        },
        price_range: '¥¥¥',
        languages_supported: ['en', 'my'],
        tags: ['burmese-food', 'bbq', 'hotpot', 'premium', 'group-dining'],
        photos: ['https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800'],
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        category_id: getCategoryId('sushi'),
        name: 'Yangon Kitchen (ヤンゴンキッチン)',
        description_en: 'Modern Burmese fusion restaurant in Shinjuku. Creative dishes blending Burmese and Japanese flavors. Try their signature Burmese curry udon and matcha laphet cake.',
        description_my: 'ရှင်ဂျုကု ရှိ ခေတ်မှီ မြန်မာ Fusion စားသောက်ဆိုင်။ မြန်မာနှင့် ဂျပန် အရသာများ ပေါင်းစပ်ထားသော ဖန်တီးမှုအသစ်များ ရရှိနိုင်ပါသည်။ မြန်မာဟင်း ဥဒုန်းနှင့် Matcha လက်ဖက်ကိတ်များ စမ်းသပ်ကြည့်ပါ။',
        address: '3-31-5 Shinjuku, Shinjuku-ku, Tokyo 160-0022',
        latitude: 35.6920,
        longitude: 139.7050,
        phone: '+81-3-6380-1188',
        website: null,
        opening_hours: {
          mon: '11:30-15:00, 17:30-22:30',
          tue: '11:30-15:00, 17:30-22:30',
          wed: '11:30-15:00, 17:30-22:30',
          thu: '11:30-15:00, 17:30-22:30',
          fri: '11:30-15:00, 17:30-23:00',
          sat: '11:30-23:00',
          sun: '11:30-22:00'
        },
        price_range: '¥¥',
        languages_supported: ['en', 'my'],
        tags: ['burmese-food', 'fusion', 'modern', 'creative-cuisine', 'curry-udon'],
        photos: ['https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=800'],
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
        description_my: 'အင်္ဂလိပ်စာအုပ်များနှင့် မန်ဂါ (Manga) စာအုပ်များ စုံလင်စွာ ရရှိနိုင်သည့် စာအုပ်ဆိုင်ကြီး။ စာအုပ်များကြည့်ရှုရန် ၇ ထပ် ရှိပါသည်။',
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
        description_my: 'Narita လေဆိပ်ရှိ ငွေလဲလှယ်ရေး ကောင်တာ။ သင့်တင့်သော ငွေလဲလှယ်နှုန်းထားများရှိပြီး မနက်စောစောမှ ညနက်သည်အထိ ဖွင့်လှစ်ထားပါသည်။',
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
