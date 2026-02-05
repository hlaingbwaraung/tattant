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
        description_jp: '観光客向けの手頃な価格のSIMカードとポケットWiFiレンタル。英語サポート対応。複数のデータプラン。',
        description_cn: '为游客提供价格实惠的SIM卡和便携式WiFi租赁服务。提供英语支持。多种数据套餐。',
        description_kr: '관광객을 위한 저렴한 SIM 카드 및 포켓 WiFi 대여. 영어 지원 가능. 다양한 데이터 요금제.',
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
        languages_supported: ['en', 'jp', 'cn', 'kr'],
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
        description_jp: 'プレミアムeSIMおよび物理SIMカード。即時アクティベーション。24時間365日カスタマーサポート。',
        description_cn: '优质eSIM和实体SIM卡。即时激活。全天候客户支持。',
        description_kr: '프리미엄 eSIM 및 실제 SIM 카드. 즉시 활성화. 연중무휴 고객 지원.',
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
        languages_supported: ['en', 'jp', 'cn'],
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
        description_jp: '有名な豚骨ラーメンチェーン。集中して食事を楽しめる個室ブース。カスタマイズ可能な辛さレベル。',
        description_cn: '著名的豚骨拉面连锁店。独立用餐隔间，专注用餐体验。可定制辣度。',
        description_kr: '유명한 돈코츠 라멘 체인. 집중적인 식사 경험을 위한 개인 부스. 맞춤형 매운맛 레벨.',
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
        languages_supported: ['en', 'jp', 'cn', 'kr'],
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
        description_jp: 'さっぱりとした柚子ラーメン。モダンな雰囲気。初心者に最適。',
        description_cn: '清淡的柚子拉面。现代氛围。非常适合初次尝试者。',
        description_kr: '가벼운 유자 시트러스 라멘. 현대적인 분위기. 초보자에게 완벽.',
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
        languages_supported: ['en', 'jp'],
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
        description_jp: 'リーズナブルな価格で高品質な寿司。有名なマグロオークション会場。24時間営業。',
        description_cn: '价格合理的高品质寿司。著名金枪鱼拍卖场地。24小时营业。',
        description_kr: '합리적인 가격의 고품질 스시. 유명한 참치 경매장. 24시간 영업.',
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
        languages_supported: ['en', 'jp', 'cn'],
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
        description_jp: '人気の焼肉チェーン。食べ放題オプション。英語メニュー対応。',
        description_cn: '受欢迎的烤肉连锁店。提供自助餐选项。有英文菜单。',
        description_kr: '인기 야키니쿠 체인. 무한리필 옵션. 영어 메뉴 제공.',
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
        languages_supported: ['en', 'jp', 'cn', 'kr'],
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
        description_jp: '英語と漫画の充実したセクションを持つ大型書店。7フロアの本。',
        description_cn: '大型书店，设有丰富的英语和漫画区。7层楼的书籍。',
        description_kr: '광범위한 영어 및 만화 섹션이 있는 대형 서점. 7층짜리 책들.',
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
        languages_supported: ['en', 'jp'],
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
        description_jp: '成田空港での両替。競争力のあるレート。早朝から深夜まで営業。',
        description_cn: '成田机场货币兑换。优惠汇率。营业时间从早到晚。',
        description_kr: '나리타 공항 환전소. 경쟁력 있는 환율. 이른 아침부터 늦은 시간까지 영업.',
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
        languages_supported: ['en', 'jp', 'cn', 'kr'],
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
