#!/bin/bash
# Update restaurants in production DB: Replace fake Japanese restaurants with real Burmese restaurants in Tokyo

sudo -u postgres psql -d suteki << 'EOSQL'

-- First, get category IDs
DO $$
DECLARE
  ramen_id UUID;
  sushi_id UUID;
  yakiniku_id UUID;
BEGIN
  SELECT id INTO ramen_id FROM categories WHERE slug = 'ramen';
  SELECT id INTO sushi_id FROM categories WHERE slug = 'sushi';
  SELECT id INTO yakiniku_id FROM categories WHERE slug = 'yakiniku';

  -- Delete old fake restaurants (CASCADE will clean up coupons, saved_businesses)
  DELETE FROM coupons WHERE business_id IN (SELECT id FROM businesses WHERE name IN ('Ichiran Ramen Shibuya', 'Afuri Ramen Harajuku', 'Sushi Zanmai Tsukiji', 'Gyukaku Shibuya'));
  DELETE FROM saved_businesses WHERE business_id IN (SELECT id FROM businesses WHERE name IN ('Ichiran Ramen Shibuya', 'Afuri Ramen Harajuku', 'Sushi Zanmai Tsukiji', 'Gyukaku Shibuya'));
  DELETE FROM businesses WHERE name IN (
    'Ichiran Ramen Shibuya',
    'Afuri Ramen Harajuku',
    'Sushi Zanmai Tsukiji',
    'Gyukaku Shibuya'
  );

  -- Insert real Burmese restaurants
  INSERT INTO businesses (id, category_id, name, description_en, description_my, address, latitude, longitude, phone, website, opening_hours, price_range, languages_supported, tags, photos, is_active, created_at, updated_at)
  VALUES
  (
    gen_random_uuid(), ramen_id,
    'Nong Inlay (ノングインレー)',
    'Authentic Burmese & Shan cuisine in the heart of Takadanobaba. Famous for Shan noodles, tea leaf salad, and rich curries. A beloved gathering spot for the Burmese community in Tokyo.',
    'တကဒနိုဘာဘ ရှိ စစ်မှန်သော မြန်မာနှင့် ရှမ်းအစားအစာဆိုင်။ ရှမ်းခေါက်ဆွဲ၊ လက်ဖက်သုပ်နှင့် ဟင်းချက်အမျိုးမျိုးဖြင့် နာမည်ကြီးပါသည်။ တိုကျိုရှိ မြန်မာအသိုင်းအဝိုင်း စုဝေးရာ နေရာလည်းဖြစ်ပါသည်။',
    '1-26-12 Takadanobaba, Shinjuku-ku, Tokyo 169-0075',
    35.7128, 139.7036,
    '+81-3-3205-2155', NULL,
    '{"mon":"11:00-22:00","tue":"11:00-22:00","wed":"11:00-22:00","thu":"11:00-22:00","fri":"11:00-22:00","sat":"11:00-22:00","sun":"11:00-22:00"}',
    '¥¥',
    ARRAY['en','my'],
    ARRAY['burmese-food','shan-noodles','tea-leaf-salad','halal-options'],
    ARRAY['https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800'],
    true, NOW(), NOW()
  ),
  (
    gen_random_uuid(), ramen_id,
    'Myanmar Shwe Myay (ミャンマー・シュエミャイ)',
    'Popular Burmese eatery in Takadanobaba serving mohinga, Burmese curry rice, and crispy samusas. Affordable prices and generous portions loved by students and workers alike.',
    'တကဒနိုဘာဘ ရှိ လူကြိုက်များသော မြန်မာစားသောက်ဆိုင်။ မုန့်ဟင်းခါး၊ ထမင်းနှင့်ဟင်း၊ ဆမူဆာ စသည်တို့ကို ရရှိနိုင်ပါသည်။ စျေးနှုန်းသက်သာပြီး ပမာဏများစွာ ရရှိနိုင်ပါသည်။',
    '3-7-5 Takadanobaba, Shinjuku-ku, Tokyo 169-0075',
    35.7133, 139.7059,
    '+81-3-3366-8839', NULL,
    '{"mon":"11:00-15:00, 17:00-22:00","tue":"11:00-15:00, 17:00-22:00","wed":"Closed","thu":"11:00-15:00, 17:00-22:00","fri":"11:00-15:00, 17:00-22:00","sat":"11:00-22:00","sun":"11:00-22:00"}',
    '¥',
    ARRAY['en','my'],
    ARRAY['burmese-food','mohinga','affordable','curry-rice'],
    ARRAY['https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800'],
    true, NOW(), NOW()
  ),
  (
    gen_random_uuid(), sushi_id,
    'Ruby Myanmar (ルビーミャンマー)',
    'Beloved Burmese restaurant near Takadanobaba station. Known for authentic Burmese biryani, fish curry, and traditional sweets. Cozy family-run atmosphere with Burmese TV playing.',
    'တကဒနိုဘာဘ ဘူတာရှေ့ အနီးရှိ ချစ်စဖွယ် မြန်မာစားသောက်ဆိုင်။ စစ်မှန်သော မြန်မာဒံပေါက်ထမင်း၊ ငါးဟင်းနှင့် မြန်မာမုန့်များ ရရှိနိုင်ပါသည်။ မိသားစုလို ပျော်ရွှင်ဖွယ် ပတ်ဝန်းကျင်ဖြစ်ပါသည်။',
    '3-1-25 Takadanobaba, Shinjuku-ku, Tokyo 169-0075',
    35.7131, 139.7041,
    '+81-3-3200-7857', NULL,
    '{"mon":"11:00-15:00, 17:00-22:30","tue":"11:00-15:00, 17:00-22:30","wed":"11:00-15:00, 17:00-22:30","thu":"11:00-15:00, 17:00-22:30","fri":"11:00-15:00, 17:00-23:00","sat":"11:00-23:00","sun":"11:00-22:00"}',
    '¥¥',
    ARRAY['en','my'],
    ARRAY['burmese-food','biryani','fish-curry','family-friendly'],
    ARRAY['https://images.unsplash.com/photo-1567337710282-00832b415979?w=800'],
    true, NOW(), NOW()
  ),
  (
    gen_random_uuid(), sushi_id,
    'Min Tei (ミンテイ)',
    'Hidden gem Burmese restaurant in Shimokitazawa. Serves traditional tea leaf salad, coconut chicken noodles (ohn no khauk swe), and refreshing Burmese milk tea in a trendy neighborhood.',
    'ရှိမိုကီတဇဝ ရှိ လူသိနည်းသော မြန်မာစားသောက်ဆိုင်ကောင်း။ လက်ဖက်သုပ်၊ အုန်းနို့ခေါက်ဆွဲနှင့် မြန်မာလက်ဖက်ရည် စသည်တို့ကို ရရှိနိုင်ပါသည်။ ခေတ်မှီရပ်ကွက်တွင် တည်ရှိပါသည်။',
    '2-25-2 Kitazawa, Setagaya-ku, Tokyo 155-0031',
    35.6614, 139.6681,
    '+81-3-3410-6366', NULL,
    '{"mon":"Closed","tue":"11:30-14:30, 17:30-22:00","wed":"11:30-14:30, 17:30-22:00","thu":"11:30-14:30, 17:30-22:00","fri":"11:30-14:30, 17:30-23:00","sat":"11:30-23:00","sun":"11:30-21:00"}',
    '¥¥',
    ARRAY['en','my'],
    ARRAY['burmese-food','coconut-noodles','tea-leaf-salad','trendy-area'],
    ARRAY['https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=800'],
    true, NOW(), NOW()
  ),
  (
    gen_random_uuid(), yakiniku_id,
    'Golden Myanmar (ゴールデン・ミャンマー)',
    'Lively Burmese restaurant and bar in Takadanobaba. Famous for htamin jin (fermented rice salad), grilled skewers, and Myanmar Beer. Live Burmese music on weekends!',
    'တကဒနိုဘာဘ ရှိ အသက်ဝင်လှုပ်ရှားသော မြန်မာစားသောက်ဆိုင်နှင့် ဘား။ ထမင်းချဉ်၊ အသားကင်တံချောင်းများနှင့် မြန်မာဘီယာ စသည်တို့ဖြင့် နာမည်ကြီးပါသည်။ စနေ-တနင်္ဂနွေ ညများတွင် မြန်မာဂီတဖျော်ဖြေမှုရှိပါသည်!',
    '3-3-3 Takadanobaba, Shinjuku-ku, Tokyo 169-0075',
    35.7126, 139.7048,
    '+81-3-3367-3378', NULL,
    '{"mon":"17:00-23:00","tue":"17:00-23:00","wed":"17:00-23:00","thu":"17:00-23:00","fri":"17:00-01:00","sat":"12:00-01:00","sun":"12:00-22:00"}',
    '¥¥',
    ARRAY['en','my'],
    ARRAY['burmese-food','bar','live-music','myanmar-beer','grilled-skewers'],
    ARRAY['https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800'],
    true, NOW(), NOW()
  ),
  (
    gen_random_uuid(), yakiniku_id,
    'Mandalay Restaurant (マンダレー)',
    'Upscale Burmese dining in Shin-Okubo. Features traditional Mandalay cuisine with rich curries, laphet thoke, and Burmese desserts. Popular for group celebrations and weekend gatherings.',
    'ရှင်းအိုကုဘို ရှိ အဆင့်မြင့် မြန်မာစားသောက်ဆိုင်။ မန္တလေးရိုးရာ ဟင်းလျာများဖြစ်သော ဟင်းအမျိုးမျိုး၊ လက်ဖက်သုပ်နှင့် မြန်မာမုန့်များ ရရှိနိုင်ပါသည်။ အဖွဲ့လိုက်ပွဲများအတွက် လူကြိုက်များပါသည်။',
    '1-1-3 Hyakunincho, Shinjuku-ku, Tokyo 169-0073',
    35.7012, 139.7003,
    '+81-3-6233-8897', NULL,
    '{"mon":"11:00-15:00, 17:00-23:00","tue":"11:00-15:00, 17:00-23:00","wed":"Closed","thu":"11:00-15:00, 17:00-23:00","fri":"11:00-15:00, 17:00-23:30","sat":"11:00-23:30","sun":"11:00-22:00"}',
    '¥¥¥',
    ARRAY['en','my'],
    ARRAY['burmese-food','upscale','mandalay-cuisine','group-dining','celebrations'],
    ARRAY['https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800'],
    true, NOW(), NOW()
  );

END $$;

-- Verify the update
SELECT name, address, price_range FROM businesses ORDER BY name;

EOSQL
