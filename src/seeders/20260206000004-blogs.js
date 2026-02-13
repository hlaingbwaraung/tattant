'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Get admin user
    const users = await queryInterface.sequelize.query(
      "SELECT id FROM users WHERE is_admin = true LIMIT 1;",
      { type: Sequelize.QueryTypes.SELECT }
    )
    const authorId = users.length > 0 ? users[0].id : null

    await queryInterface.bulkInsert('blogs', [
      {
        title: 'The Ultimate Guide to Riding Japan\'s Shinkansen',
        slug: 'ultimate-guide-shinkansen',
        emoji: '🚄',
        photo: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800',
        category: 'Travel Tips',
        tag: 'travel',
        excerpt: 'Everything you need to know about Japan\'s famous bullet train — from buying tickets to understanding reserved vs. non-reserved seating.',
        content: '<h2>Why the Shinkansen?</h2><p>Japan\'s Shinkansen (bullet train) is one of the most efficient and iconic rail systems in the world. With speeds reaching 320 km/h, it connects major cities like Tokyo, Osaka, Kyoto, and Hiroshima in just a few hours.</p><h2>Buying Tickets</h2><p>You can purchase Shinkansen tickets at JR ticket counters, vending machines (with English menus), or online through services like SmartEX. If you plan to travel extensively, the <strong>Japan Rail Pass (JR Pass)</strong> is a must — it offers unlimited travel on most JR trains including the Shinkansen.</p><h2>Reserved vs. Non-Reserved</h2><ul><li><strong>Reserved (指定席):</strong> Guaranteed seat. Recommended during peak seasons (Golden Week, Obon, New Year).</li><li><strong>Non-Reserved (自由席):</strong> First-come, first-served. Usually available on weekdays.</li><li><strong>Green Car (グリーン車):</strong> First class. Extra legroom and quieter environment.</li></ul><h2>Pro Tips</h2><ul><li>Arrive 10 minutes early for non-reserved cars</li><li>The train stops for exactly the time stated — don\'t be late!</li><li>Eating bento on the Shinkansen is a beloved tradition — try an ekiben (station bento)</li><li>Keep your ticket; you need it to exit at your destination</li></ul>',
        read_time: '6 min read',
        author_id: authorId,
        published: true,
        views: 245,
        created_at: new Date('2026-01-15'),
        updated_at: new Date('2026-01-15')
      },
      {
        title: '10 Japanese Etiquette Rules Every Visitor Must Know',
        slug: '10-japanese-etiquette-rules',
        emoji: '🙇',
        photo: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800',
        category: 'Etiquette',
        tag: 'etiquette',
        excerpt: 'From bowing customs to chopstick taboos — avoid cultural faux pas and show respect during your stay in Japan.',
        content: '<h2>1. Bowing</h2><p>Bowing is the most common form of greeting. A slight 15-degree bow works for casual situations. Deeper bows (30-45°) show more respect.</p><h2>2. Shoes Off Indoors</h2><p>Always remove your shoes when entering homes, temples, traditional restaurants, and ryokan. Look for shoe racks or lockers at the entrance.</p><h2>3. Chopstick Etiquette</h2><ul><li>Never stick chopsticks upright in rice (resembles funeral incense)</li><li>Don\'t pass food chopstick-to-chopstick</li><li>Don\'t point with chopsticks</li></ul><h2>4. Quiet on Public Transport</h2><p>Talking on phones is considered rude on trains and buses. Switch to manner mode (マナーモード) and avoid loud conversations.</p><h2>5. Tipping is Not Customary</h2><p>Unlike Western countries, tipping is not expected and can even be considered rude in some contexts. Service is already included.</p><h2>6. Queue Properly</h2><p>Japanese people are famous for orderly queuing. Wait your turn at train platforms, restaurants, and shops.</p><h2>7. Don\'t Eat While Walking</h2><p>Eating and drinking while walking is frowned upon. Find a bench or designated eating area.</p><h2>8. Use Both Hands for Exchanges</h2><p>When giving or receiving business cards, money, or gifts, use both hands as a sign of respect.</p><h2>9. Onsen (Hot Spring) Rules</h2><p>Wash thoroughly before entering the communal bath. Tattoos may be restricted at some facilities.</p><h2>10. Trash Etiquette</h2><p>Public trash bins are rare. Carry your trash with you or look for bins at convenience stores.</p>',
        read_time: '7 min read',
        author_id: authorId,
        published: true,
        views: 189,
        created_at: new Date('2026-01-18'),
        updated_at: new Date('2026-01-18')
      },
      {
        title: 'Cherry Blossom Season: When and Where to See Sakura',
        slug: 'cherry-blossom-season-guide',
        emoji: '🌸',
        photo: 'https://images.unsplash.com/photo-1522383225653-ed111181a951?w=800',
        category: 'Seasons',
        tag: 'seasons',
        excerpt: 'Plan your trip around Japan\'s most magical season. A complete guide to cherry blossom forecasts, best viewing spots, and hanami culture.',
        content: '<h2>When Does Sakura Season Start?</h2><p>Cherry blossoms typically bloom from late March to mid-April, moving from south to north. Okinawa sees early blooms in January, while Hokkaido\'s sakura peaks in May.</p><h2>Best Viewing Spots</h2><ul><li><strong>Tokyo:</strong> Ueno Park, Shinjuku Gyoen, Meguro River, Chidorigafuchi</li><li><strong>Kyoto:</strong> Maruyama Park, Philosopher\'s Path, Arashiyama</li><li><strong>Osaka:</strong> Osaka Castle Park, Kema Sakuranomiya</li><li><strong>Nara:</strong> Yoshino Mountain (30,000 trees!)</li></ul><h2>Hanami Culture</h2><p><strong>Hanami (花見)</strong> means "flower viewing" and is a centuries-old tradition. Japanese families and friends gather under the cherry trees for picnics with food, drinks, and laughter.</p><h2>Tips for the Best Experience</h2><ul><li>Check the <strong>sakura forecast (桜前線)</strong> updated by the Japan Meteorological Agency</li><li>Full bloom lasts only about one week — plan accordingly</li><li>Go early morning for photos without crowds</li><li>Night illuminations (yozakura) at many spots create magical atmospheres</li><li>Bring a blue tarp for sitting in parks</li></ul>',
        read_time: '5 min read',
        author_id: authorId,
        published: true,
        views: 312,
        created_at: new Date('2026-01-22'),
        updated_at: new Date('2026-01-22')
      },
      {
        title: 'A First-Timer\'s Guide to Japanese Ramen',
        slug: 'first-timers-guide-ramen',
        emoji: '🍜',
        photo: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800',
        category: 'Food & Drink',
        tag: 'food',
        excerpt: 'From tonkotsu to shoyu — understand the different ramen styles, how to order at a ticket machine, and proper eating etiquette.',
        content: '<h2>The Four Main Ramen Styles</h2><ul><li><strong>Shoyu (醤油):</strong> Soy sauce-based. Clear, brown broth. The most traditional style, popular in Tokyo.</li><li><strong>Tonkotsu (豚骨):</strong> Pork bone broth. Rich, creamy, milky white. Originated in Fukuoka (Hakata).</li><li><strong>Miso (味噌):</strong> Fermented soybean paste base. Hearty and savory. Originated in Sapporo, Hokkaido.</li><li><strong>Shio (塩):</strong> Salt-based. The lightest and most delicate of the four. Often clear broth.</li></ul><h2>How to Order</h2><p>Most ramen shops use a <strong>ticket vending machine (食券機)</strong> at the entrance. Insert money, press the button for your chosen ramen (usually with photos), and hand the ticket to the chef.</p><h2>Eating Etiquette</h2><ul><li><strong>Slurping is encouraged!</strong> It shows you enjoy the food and helps cool the noodles</li><li>Eat quickly — ramen is best fresh and hot</li><li>Add toppings from the counter: pickled ginger, garlic, sesame</li><li>Consider ordering <strong>kaedama (替え玉)</strong> — an extra serving of noodles for 100-200 yen</li></ul><h2>Must-Try Ramen Shops</h2><p>Ichiran and Ippudo are excellent chains for beginners, but the best ramen is often found at tiny hole-in-the-wall shops with just 8-10 seats.</p>',
        read_time: '6 min read',
        author_id: authorId,
        published: true,
        views: 278,
        created_at: new Date('2026-01-25'),
        updated_at: new Date('2026-01-25')
      },
      {
        title: 'Understanding Japan\'s Temple and Shrine Culture',
        slug: 'temple-shrine-culture',
        emoji: '⛩️',
        photo: 'https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?w=800',
        category: 'Culture',
        tag: 'culture',
        excerpt: 'Learn the difference between Shinto shrines and Buddhist temples, proper worship etiquette, and the most breathtaking sacred sites to visit.',
        content: '<h2>Shrines vs. Temples</h2><p><strong>Shrines (神社 / jinja)</strong> are Shinto — look for the iconic torii gates (鳥居). <strong>Temples (寺 / tera)</strong> are Buddhist — identified by their large entrance gates (山門 / sanmon) and incense.</p><h2>Shrine Etiquette</h2><ol><li>Bow once before passing through the torii gate</li><li>Walk on the sides of the path (the center is for the gods)</li><li>Wash hands and mouth at the temizu basin</li><li>At the offering hall: throw a coin, bow twice, clap twice, make a wish, bow once more</li></ol><h2>Temple Etiquette</h2><ol><li>Enter quietly and remove hats</li><li>Light incense (if available) and waft the smoke toward you for purification</li><li>Bow with hands together in prayer (no clapping at temples)</li></ol><h2>Must-Visit Sacred Sites</h2><ul><li><strong>Fushimi Inari Taisha (Kyoto):</strong> 10,000 vermillion torii gates</li><li><strong>Senso-ji (Tokyo):</strong> Tokyo\'s oldest temple with the famous Kaminarimon gate</li><li><strong>Kinkaku-ji (Kyoto):</strong> The Golden Pavilion</li><li><strong>Meiji Shrine (Tokyo):</strong> Serene forest oasis in the heart of Shibuya</li><li><strong>Todai-ji (Nara):</strong> Houses the world\'s largest bronze Buddha</li></ul>',
        read_time: '7 min read',
        author_id: authorId,
        published: true,
        views: 201,
        created_at: new Date('2026-01-28'),
        updated_at: new Date('2026-01-28')
      },
      {
        title: 'How to Use IC Cards: Suica, Pasmo & ICOCA Explained',
        slug: 'ic-cards-suica-pasmo-icoca',
        emoji: '💳',
        photo: 'https://images.unsplash.com/photo-1590559899731-a382839e5549?w=800',
        category: 'Practical',
        tag: 'practical',
        excerpt: 'Cashless travel made easy. Learn how rechargeable IC cards work for trains, buses, convenience stores, and vending machines across Japan.',
        content: '<h2>What Are IC Cards?</h2><p>IC cards are rechargeable smart cards used for public transport and small purchases across Japan. The three most popular are <strong>Suica</strong> (JR East, Tokyo), <strong>Pasmo</strong> (Tokyo Metro/private railways), and <strong>ICOCA</strong> (JR West, Osaka/Kyoto).</p><h2>Where to Get One</h2><ul><li>Ticket vending machines at major JR stations</li><li>Airport kiosks (Narita, Haneda, Kansai)</li><li>Apple Wallet or Google Pay (mobile Suica)</li></ul><h2>How They Work</h2><p>Tap the card on the reader when entering and exiting train gates. The fare is automatically calculated and deducted. You can recharge at any station or convenience store.</p><h2>Where You Can Use Them</h2><ul><li>All trains and buses in major cities</li><li>Convenience stores (7-Eleven, Lawson, FamilyMart)</li><li>Vending machines</li><li>Many restaurants and shops</li><li>Coin lockers at stations</li></ul><h2>Pro Tips</h2><ul><li>IC cards are interchangeable — a Suica works in Osaka and vice versa</li><li>Keep at least ¥500 balance for smooth transfers</li><li>You can get a ¥500 deposit refund when returning the card</li><li>Mobile Suica on your phone is the most convenient option</li></ul>',
        read_time: '5 min read',
        author_id: authorId,
        published: true,
        views: 156,
        created_at: new Date('2026-01-30'),
        updated_at: new Date('2026-01-30')
      },
      {
        title: 'Autumn in Japan: The Best Spots for Fall Foliage',
        slug: 'autumn-fall-foliage-guide',
        emoji: '🍁',
        photo: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800',
        category: 'Seasons',
        tag: 'seasons',
        excerpt: 'Japan\'s autumn colors rival its cherry blossoms in beauty. Discover the best momiji (maple) viewing spots and timing for your trip.',
        content: '<h2>When Is Autumn Color Season?</h2><p>Fall foliage (紅葉 / koyo) season runs from late September to early December, moving from north to south — the opposite direction of cherry blossoms.</p><h2>Best Viewing Spots</h2><ul><li><strong>Nikko (Tochigi):</strong> Stunning lake reflections and mountain colors. Peak: mid-October</li><li><strong>Kyoto:</strong> Tofuku-ji Temple, Eikando, and Arashiyama. Peak: mid-November</li><li><strong>Mount Koya (Wakayama):</strong> Ancient cemetery among towering cedars and maples</li><li><strong>Kenroku-en (Kanazawa):</strong> One of Japan\'s three great gardens</li><li><strong>Oirase Gorge (Aomori):</strong> A 14km stream walk through stunning forest</li></ul><h2>Momijigari Culture</h2><p><strong>Momijigari (紅葉狩り)</strong> means "autumn leaf hunting" — the fall equivalent of hanami. It\'s a beloved tradition of walking through forests and gardens to admire the changing leaves.</p><h2>Tips</h2><ul><li>Night illuminations at Kyoto temples are breathtaking</li><li>Weekdays are less crowded than weekends</li><li>Pair with onsen (hot springs) for the ultimate autumn experience</li></ul>',
        read_time: '5 min read',
        author_id: authorId,
        published: true,
        views: 167,
        created_at: new Date('2026-02-01'),
        updated_at: new Date('2026-02-01')
      },
      {
        title: 'Japanese Street Food: 15 Must-Try Snacks',
        slug: 'japanese-street-food-must-try',
        emoji: '🍡',
        photo: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800',
        category: 'Food & Drink',
        tag: 'food',
        excerpt: 'From takoyaki to taiyaki — explore Japan\'s vibrant street food scene at festivals, shopping streets, and local markets.',
        content: '<h2>Savory Street Foods</h2><ul><li><strong>Takoyaki (たこ焼き):</strong> Crispy octopus balls from Osaka. Topped with mayo, bonito flakes, and sauce</li><li><strong>Okonomiyaki (お好み焼き):</strong> Savory pancake packed with cabbage, meat, and seafood</li><li><strong>Yakitori (焼き鳥):</strong> Grilled chicken skewers in various cuts and seasonings</li><li><strong>Karaage (唐揚げ):</strong> Japanese-style fried chicken — incredibly juicy</li><li><strong>Gyoza (餃子):</strong> Pan-fried dumplings with crispy bottoms</li><li><strong>Korokke (コロッケ):</strong> Japanese croquettes filled with potato and meat</li><li><strong>Yakisoba (焼きそば):</strong> Stir-fried noodles with vegetables and sauce</li></ul><h2>Sweet Treats</h2><ul><li><strong>Taiyaki (たい焼き):</strong> Fish-shaped pastry filled with red bean paste, custard, or chocolate</li><li><strong>Dango (団子):</strong> Chewy rice dumplings on a stick, often with sweet soy glaze</li><li><strong>Crepes:</strong> Harajuku-style crepes overflowing with fruits, cream, and toppings</li><li><strong>Kakigori (かき氷):</strong> Fluffy shaved ice with flavored syrups — a summer essential</li><li><strong>Imagawayaki (今川焼き):</strong> Round pastries filled with sweet red bean</li></ul><h2>Best Street Food Spots</h2><ul><li><strong>Dotonbori (Osaka):</strong> The street food capital of Japan</li><li><strong>Nakamise-dori (Tokyo):</strong> The shopping street leading to Senso-ji</li><li><strong>Nishiki Market (Kyoto):</strong> "Kyoto\'s Kitchen" with 100+ vendors</li><li><strong>Tsukiji Outer Market (Tokyo):</strong> Fresh seafood and sushi</li></ul>',
        read_time: '8 min read',
        author_id: authorId,
        published: true,
        views: 334,
        created_at: new Date('2026-02-03'),
        updated_at: new Date('2026-02-03')
      },
      {
        title: 'Surviving Your First Japanese Convenience Store Visit',
        slug: 'japanese-convenience-store-guide',
        emoji: '🏪',
        photo: 'https://images.unsplash.com/photo-1528728329032-2972f65dfb3f?w=800',
        category: 'Practical',
        tag: 'practical',
        excerpt: 'Japan\s konbini (convenience stores) are a traveler\'s best friend. From ATMs to hot meals — here\'s how to make the most of 7-Eleven, Lawson, and FamilyMart.',
        content: '<h2>Why Konbini Are Amazing</h2><p>Japanese convenience stores (コンビニ / konbini) are nothing like their Western counterparts. Open 24/7, they offer hot meals, fresh onigiri, ATMs, bill payment, event tickets, and much more.</p><h2>The Big Three</h2><ul><li><strong>7-Eleven:</strong> Best ATMs for international cards, excellent onigiri</li><li><strong>Lawson:</strong> Famous for their karaage-kun (fried chicken bites) and Uchi Café desserts</li><li><strong>FamilyMart:</strong> Great Famichiki (fried chicken) and coffee</li></ul><h2>Must-Try Konbini Foods</h2><ul><li><strong>Onigiri (おにぎり):</strong> Rice balls with various fillings — ¥100-150 each</li><li><strong>Egg Sandwich (タマゴサンド):</strong> The legendary fluffy egg sandwich</li><li><strong>Oden (おでん):</strong> Hot stew with various ingredients (winter only)</li><li><strong>Nikuman (肉まん):</strong> Steamed meat buns</li><li><strong>Premium ice cream and desserts</strong></li></ul><h2>Practical Services</h2><ul><li>ATMs that accept foreign cards (7-Eleven and Japan Post ATMs)</li><li>Free WiFi at most locations</li><li>Print/copy/fax machines</li><li>Package shipping (takkyubin)</li><li>Event and concert ticket purchases</li></ul>',
        read_time: '5 min read',
        author_id: authorId,
        published: true,
        views: 198,
        created_at: new Date('2026-02-04'),
        updated_at: new Date('2026-02-04')
      },
      {
        title: 'The Art of Japanese Tea Ceremony: A Cultural Deep Dive',
        slug: 'japanese-tea-ceremony-guide',
        emoji: '🍵',
        photo: 'https://images.unsplash.com/photo-1563822249366-3efb23b8e0c9?w=800',
        category: 'Culture',
        tag: 'culture',
        excerpt: 'Experience the meditative beauty of chado — the Japanese Way of Tea. Learn the history, rituals, and where to participate as a visitor.',
        content: '<h2>What Is Chado?</h2><p><strong>Chado (茶道)</strong>, the Way of Tea, is far more than just drinking tea. It is a spiritual practice rooted in Zen Buddhism that emphasizes harmony (和 wa), respect (敬 kei), purity (清 sei), and tranquility (寂 jaku).</p><h2>A Brief History</h2><p>Tea was introduced to Japan from China in the 9th century. The tea ceremony as we know it was formalized by Sen no Rikyu in the 16th century, who elevated it from a social gathering to an art form.</p><h2>The Ceremony</h2><ol><li>Guests enter the tea room through a small door (nijiriguchi), symbolizing humility</li><li>The host prepares matcha (powdered green tea) with precise, graceful movements</li><li>Each utensil is carefully selected and placed intentionally</li><li>Guests rotate the bowl before drinking to admire its design</li><li>A sweet wagashi is served before the tea to complement its bitterness</li></ol><h2>Where to Experience It</h2><ul><li><strong>Kyoto:</strong> Urasenke Foundation, Camellia Garden</li><li><strong>Tokyo:</strong> Happo-en Garden, Imperial Hotel tea room</li><li><strong>Kanazawa:</strong> Kenroku-en tea houses</li></ul><p>Many tourist-friendly ceremonies last 30-60 minutes and cost ¥1,000-3,000. English explanations are often available.</p>',
        read_time: '6 min read',
        author_id: authorId,
        published: true,
        views: 142,
        created_at: new Date('2026-02-06'),
        updated_at: new Date('2026-02-06')
      }
    ])
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('blogs', null, {})
  }
}
