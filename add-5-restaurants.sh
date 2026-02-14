#!/bin/bash
# Add 5 more Burmese restaurants to production DB

sudo -u postgres psql -d suteki << 'EOSQL'

DO $$
DECLARE
  ramen_id UUID;
  sushi_id UUID;
  yakiniku_id UUID;
BEGIN
  SELECT id INTO ramen_id FROM categories WHERE slug = 'ramen';
  SELECT id INTO sushi_id FROM categories WHERE slug = 'sushi';
  SELECT id INTO yakiniku_id FROM categories WHERE slug = 'yakiniku';

  INSERT INTO businesses (id, category_id, name, description_en, description_my, address, latitude, longitude, phone, website, opening_hours, price_range, languages_supported, tags, photos, is_active, created_at, updated_at)
  VALUES
  (
    gen_random_uuid(), ramen_id,
    'Yoma Myanmar (ヨーマミャンマー)',
    'Cozy Burmese cafe in Nakano known for rich mohinga breakfast soup, samusa thoke, and strong Burmese coffee. A morning favorite among Myanmar expats.',
    'နကနို ရှိ သက်တောင့်သက်သာ မြန်မာကဖီးဆိုင်။ မုန့်ဟင်းခါး မနက်စာ၊ ဆမူဆာသုပ်နှင့် မြန်မာကော်ဖီ စသည်တို့ဖြင့် နာမည်ကြီးပါသည်။ မြန်မာရွှေ့ပြောင်းနေထိုင်သူများ၏ မနက်စာ အကြိုက်ဆုံးနေရာဖြစ်ပါသည်။',
    '5-52-15 Nakano, Nakano-ku, Tokyo 164-0001',
    35.7075, 139.6649,
    '+81-3-3384-2288', NULL,
    '{"mon":"08:00-15:00, 17:00-21:00","tue":"08:00-15:00, 17:00-21:00","wed":"Closed","thu":"08:00-15:00, 17:00-21:00","fri":"08:00-15:00, 17:00-21:00","sat":"08:00-21:00","sun":"08:00-21:00"}',
    '¥',
    ARRAY['en','my'],
    ARRAY['burmese-food','mohinga','breakfast','coffee','affordable'],
    ARRAY['https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800'],
    true, NOW(), NOW()
  ),
  (
    gen_random_uuid(), sushi_id,
    'Bagan Restaurant (バガン)',
    'Elegant Burmese restaurant in Ikebukuro inspired by the ancient temples of Bagan. Specializes in Burmese set meals, pennywort salad, and traditional egg noodle salad (nan gyi thoke).',
    'ဘုရားပုဂံ၏ လှပမှုကို ပုံဖော်ထားသော အီကေဘိုကိုရို ရှိ မြန်မာစားသောက်ဆိုင်။ မြန်မာ Set Meal၊ မြင်းခွာရွက်သုပ်နှင့် နန်းကြီးသုပ် စသည်တို့ကို အထူးပြင်ဆင်ထားပါသည်။',
    '2-63-4 Ikebukuro, Toshima-ku, Tokyo 171-0014',
    35.7295, 139.7109,
    '+81-3-5951-3388', NULL,
    '{"mon":"11:00-15:00, 17:00-22:00","tue":"11:00-15:00, 17:00-22:00","wed":"11:00-15:00, 17:00-22:00","thu":"11:00-15:00, 17:00-22:00","fri":"11:00-15:00, 17:00-23:00","sat":"11:00-23:00","sun":"11:00-22:00"}',
    '¥¥',
    ARRAY['en','my'],
    ARRAY['burmese-food','set-meals','nan-gyi-thoke','elegant'],
    ARRAY['https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800'],
    true, NOW(), NOW()
  ),
  (
    gen_random_uuid(), ramen_id,
    'Shwe Taung (シュエタウン)',
    'Casual Burmese street food stall in Shin-Okubo. Try their famous Shan tofu salad, tea leaf rice, and crispy onion fritters. Quick, cheap, and incredibly flavorful.',
    'ရှင်းအိုကုဘို ရှိ မြန်မာလမ်းဘေးစားစရာဆိုင်။ ရှမ်းတိုဟူးသုပ်၊ လက်ဖက်ထမင်းနှင့် ကြက်သွန်နီကြော် စသည့် စားစရာများ ရရှိနိုင်ပါသည်။ မြန်မြန်ဆန်ဆန်၊ စျေးသက်သာပြီး အလွန်အရသာရှိပါသည်။',
    '1-3-20 Hyakunincho, Shinjuku-ku, Tokyo 169-0073',
    35.7008, 139.6998,
    '+81-3-6205-5521', NULL,
    '{"mon":"10:00-21:00","tue":"10:00-21:00","wed":"10:00-21:00","thu":"10:00-21:00","fri":"10:00-22:00","sat":"10:00-22:00","sun":"10:00-21:00"}',
    '¥',
    ARRAY['en','my'],
    ARRAY['burmese-food','street-food','shan-tofu','affordable','quick-eats'],
    ARRAY['https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800'],
    true, NOW(), NOW()
  ),
  (
    gen_random_uuid(), yakiniku_id,
    'Inle Lake (インレー湖)',
    'Premium Burmese BBQ and hotpot restaurant in Takadanobaba. Named after the famous Inle Lake. Grilled meats Burmese-style with special dipping sauces, plus traditional soups and salads.',
    'တကဒနိုဘာဘ ရှိ မြန်မာအသားကင်နှင့် ဟော့ပေါ့စားသောက်ဆိုင်။ နာမည်ကြီး အင်းလေးကန်မှ အမည်ယူထားပါသည်။ မြန်မာအမဲ့ရည်ဖြင့် အသားကင်များ၊ ရိုးရာစူပ်နှင့် အသုပ်များ ရရှိနိုင်ပါသည်။',
    '3-6-10 Takadanobaba, Shinjuku-ku, Tokyo 169-0075',
    35.7130, 139.7055,
    '+81-3-3368-5577', NULL,
    '{"mon":"17:00-23:00","tue":"17:00-23:00","wed":"17:00-23:00","thu":"17:00-23:00","fri":"17:00-00:00","sat":"12:00-00:00","sun":"12:00-22:00"}',
    '¥¥¥',
    ARRAY['en','my'],
    ARRAY['burmese-food','bbq','hotpot','premium','group-dining'],
    ARRAY['https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800'],
    true, NOW(), NOW()
  ),
  (
    gen_random_uuid(), sushi_id,
    'Yangon Kitchen (ヤンゴンキッチン)',
    'Modern Burmese fusion restaurant in Shinjuku. Creative dishes blending Burmese and Japanese flavors. Try their signature Burmese curry udon and matcha laphet cake.',
    'ရှင်ဂျုကု ရှိ ခေတ်မှီ မြန်မာ Fusion စားသောက်ဆိုင်။ မြန်မာနှင့် ဂျပန် အရသာများ ပေါင်းစပ်ထားသော ဖန်တီးမှုအသစ်များ ရရှိနိုင်ပါသည်။ မြန်မာဟင်း ဥဒုန်းနှင့် Matcha လက်ဖက်ကိတ်များ စမ်းသပ်ကြည့်ပါ။',
    '3-31-5 Shinjuku, Shinjuku-ku, Tokyo 160-0022',
    35.6920, 139.7050,
    '+81-3-6380-1188', NULL,
    '{"mon":"11:30-15:00, 17:30-22:30","tue":"11:30-15:00, 17:30-22:30","wed":"11:30-15:00, 17:30-22:30","thu":"11:30-15:00, 17:30-22:30","fri":"11:30-15:00, 17:30-23:00","sat":"11:30-23:00","sun":"11:30-22:00"}',
    '¥¥',
    ARRAY['en','my'],
    ARRAY['burmese-food','fusion','modern','creative-cuisine','curry-udon'],
    ARRAY['https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=800'],
    true, NOW(), NOW()
  );

END $$;

-- Verify all businesses
SELECT name, address, price_range FROM businesses ORDER BY name;

EOSQL
