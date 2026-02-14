#!/bin/bash
echo "=== Updating Burmese translations in suteki database ==="

sudo -u postgres psql -d suteki <<'EOSQL'

-- Update category Burmese names
UPDATE categories SET name_my = 'SIM ကတ်နှင့် အင်တာနက်' WHERE slug = 'sim-cards';
UPDATE categories SET name_my = 'ရာမင်ဆိုင်များ' WHERE slug = 'ramen';
UPDATE categories SET name_my = 'ဆူရှီဆိုင်များ' WHERE slug = 'sushi';
UPDATE categories SET name_my = 'ယာကိနိကု (အသားကင်)' WHERE slug = 'yakiniku';

-- Update business Burmese descriptions
UPDATE businesses SET description_my = 'ခရီးသွားများအတွက် စျေးနှုန်းသက်သာသော SIM ကတ်များနှင့် Pocket WiFi ငှားရမ်းနိုင်ပါသည်။ အင်္ဂလိပ်ဘာသာဖြင့် ဝန်ဆောင်မှုပေးပြီး Data Plan အမျိုးမျိုး ရွေးချယ်နိုင်ပါသည်။' WHERE name = 'Sakura Mobile';

UPDATE businesses SET description_my = 'ပရီမီယံ eSIM နှင့် ရိုးရိုး SIM ကတ်များ ရရှိနိုင်ပါသည်။ ချက်ချင်း အသုံးပြုနိုင်ပြီး ၂၄ နာရီ ဝန်ဆောင်မှုပေးပါသည်။' WHERE name = 'Japan Wireless';

UPDATE businesses SET description_my = 'နာမည်ကြီး Tonkotsu ရာမင်ဆိုင်ခွဲ ဖြစ်ပါသည်။ တစ်ယောက်တည်း သီးသန့်စားသုံးနိုင်သော နေရာများပါရှိပြီး အစပ်အဆင့်ကို စိတ်ကြိုက် ပြင်ဆင်နိုင်ပါသည်။' WHERE name = 'Ichiran Ramen Shibuya';

UPDATE businesses SET description_my = 'ပေါ့ပါးသော ယူးဇူးသံပုရာအရသာ ရာမင်ဆိုင် ဖြစ်ပါသည်။ ခေတ်မှီသော ပတ်ဝန်းကျင်ရှိပြီး ပထမဆုံးအကြိမ် စမ်းသပ်စားသုံးမည့်သူများအတွက် အလွန်သင့်တော်ပါသည်။' WHERE name = 'Afuri Ramen Harajuku';

UPDATE businesses SET description_my = 'သင့်တင့်သော စျေးနှုန်းဖြင့် အရည်အသွေးမြင့် ဆူရှီများ ရရှိနိုင်ပါသည်။ နာမည်ကြီး တူနားငါးလေလံပွဲ ကျင်းပရာ နေရာဖြစ်ပြီး ၂၄ နာရီ ဖွင့်လှစ်ထားပါသည်။' WHERE name = 'Sushi Zanmai Tsukiji';

UPDATE businesses SET description_my = 'လူကြိုက်များသော ယာကိနိကု ဆိုင်ခွဲ ဖြစ်ပါသည်။ စားချင်သလောက် စားနိုင်သော ပက်ကေ့ချ်များ ရှိပြီး အင်္ဂလိပ်ဘာသာ မန်နူးလည်း ရရှိနိုင်ပါသည်။' WHERE name = 'Gyukaku Shibuya';

UPDATE businesses SET description_my = 'အင်္ဂလိပ်စာအုပ်များနှင့် မန်ဂါ (Manga) စာအုပ်များ စုံလင်စွာ ရရှိနိုင်သည့် စာအုပ်ဆိုင်ကြီး။ စာအုပ်များကြည့်ရှုရန် ၇ ထပ် ရှိပါသည်။' WHERE name = 'Kinokuniya Shinjuku';

UPDATE businesses SET description_my = 'Narita လေဆိပ်ရှိ ငွေလဲလှယ်ရေး ကောင်တာ။ သင့်တင့်သော ငွေလဲလှယ်နှုန်းထားများရှိပြီး မနက်စောစောမှ ညနက်သည်အထိ ဖွင့်လှစ်ထားပါသည်။' WHERE name = 'Travelex Narita Airport';

EOSQL

echo ""
echo "=== Verifying category updates ==="
sudo -u postgres psql -d suteki -c "SELECT slug, name_my FROM categories ORDER BY display_order;"

echo ""
echo "=== Verifying business updates ==="
sudo -u postgres psql -d suteki -c "SELECT name, LEFT(description_my, 80) as burmese_preview FROM businesses ORDER BY name;"

echo ""
echo "=== All Burmese translations updated! ==="
