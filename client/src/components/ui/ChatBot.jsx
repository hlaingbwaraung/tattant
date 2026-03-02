/**
 * ChatBot – AI-Powered Multilingual Assistant
 *
 * A floating chatbot that uses Google Gemini AI to answer any question
 * about Japan travel, Tattant services, or general knowledge.
 *
 * Features:
 *   - AI-powered responses via server API (Google Gemini)
 *   - Graceful fallback to local keyword-matching when API unavailable
 *   - Conversation history (context-aware follow-ups)
 *   - Quick-reply suggestions that update contextually
 *   - Typing indicator with real AI latency
 *   - Language switch (EN / JA / MY)
 *   - Markdown rendering (bold, lists, inline code)
 *   - Mobile-friendly responsive design
 */

import React, { useState, useRef, useEffect, useCallback } from 'react'
import api from '../../services/api'
import './ChatBot.css'

/* =========================================================
 *  Local Fallback Knowledge Base (used when API is down)
 * ========================================================= */
const KB = {
  en: {
    greeting: "Hello! 👋 I'm **Tattant AI Assistant** — your smart guide to Japan. Ask me **anything** about Japan travel, culture, food, language, or our platform features & settings. I'm here to help!",
    fallback: "I apologize, but I'm having trouble connecting to my AI engine right now. Here are some topics I can help with — just tap one!",
    offline: "I'm currently in offline mode with limited capabilities. Please try again shortly for full AI responses!",
    placeholder: "Ask me anything...",
    quickReplies: [
      "🗾 Best places in Tokyo",
      "🍜 Top ramen spots",
      "💱 Currency exchange",
      "📶 Best SIM cards",
      "⭐ Tattant Premium",
      "❓ How to book",
      "👤 Profile settings",
      "🏪 Shop owner guide",
    ],
    answers: {
      "what is tattant": "**Tattant** is your premium guide to Japan! 🗾\n\nWe curate the best businesses, restaurants, and essential services for travelers in Japan. From SIM cards and currency exchange to the finest ramen and sushi — we've got you covered.\n\n- Browse categories & save favorites\n- Book at partner businesses\n- Earn points from JLPT quizzes\n- Redeem coupons at the Points Shop\n- Learn Japanese with interactive quizzes\n\nAvailable in English, Burmese, and Japanese!",
      "categories": "We offer **curated categories**:\n\n📶 **Telecom & SIM Cards** — Stay connected\n🍜 **Ramen Restaurants** — Best ramen shops\n🍣 **Sushi Restaurants** — Top sushi spots\n🥩 **Yakiniku & BBQ** — Premium wagyu grills\n📚 **Book Stores** — Manga, novels & rare finds\n💱 **Currency Exchange** — Best exchange rates\n\nAdmins can add more categories like Store, Restaurant, Real Estate, Travel.\n\nVisit the **Explore** page (/explore) to browse all businesses!",
      "how to book": "Booking is easy! 📅\n\n1. Browse a business from any category\n2. Click on the business to view its details\n3. Use the **Book Now** button\n4. Fill in: customer name, phone, date, time, party size, notes\n5. Submit — you'll see it in your **Dashboard** under My Bookings\n\n**Booking statuses:** Pending → Confirmed → Completed (or Cancelled / No-Show)\n\nYou need to be logged in to make bookings.",
      "premium": "**Tattant Premium** unlocks exclusive features! ⭐\n\n✅ JLPT Kanji Quiz — all modes & levels (N5–N1)\n✅ Similar Kanji study pairs\n✅ Grammar patterns by JLPT level\n✅ Leaderboard access & progress tracking\n✅ Japanese Dictionary (powered by Jisho.org)\n✅ Extra points from quizzes\n✅ Future premium content & guides\n\n**Plans:**\n- 💳 Monthly: $4.99/month\n- 💎 Lifetime: one-time purchase\n\nVisit **/premium** to upgrade!",
      "points": "**Points & Coupons System** 🎁\n\n- Take JLPT quizzes → earn points\n- Visit **Points Shop** (/points-shop) → browse coupons\n- Redeem points → get coupon codes\n- Show coupon at the partner shop → enjoy discounts!\n\nCoupon types: percentage discount or fixed amount.\nSome coupons have minimum purchase requirements.\n\nCheck your points balance on your Dashboard!",
      "learn japanese": "**Learn Japanese with our JLPT Hub!** 🎌\n\n5 features:\n1. **Kanji Quiz** — Timed rounds (15s per question), multiple choice, combo streaks, points\n2. **Similar Kanji** — Study confusing kanji pairs\n3. **Grammar** — Patterns organized by JLPT level\n4. **Leaderboard** — Global scores + personal best\n5. **Dictionary** — Search Japanese words (Jisho.org)\n\nLevels: N5 (beginner) → N1 (advanced)\n\nThis is a **Premium** feature — visit /premium to upgrade!",
      "languages": "Tattant supports **3 languages**: 🇬🇧 English, 🇯🇵 日本語, 🇲🇲 မြန်မာ\n\nSwitch the site language using the **EN/MY** toggle in the header.\nThis chatbot also supports Japanese — use the language bar above!",
      "contact": "Need more help? 📩\n\n- Visit the **Contact** page (/contact)\n- Check the **FAQ** section (/faq)\n- Email: **support@tattant.com**\n- Shop owners can contact admin directly from their Dashboard with photo attachments\n\nMessage categories: General Inquiry, Bug Report, Feature Request, Account Issue, Business Listing.",
      "profile settings": "**Profile Settings** ⚙️\n\nAccess at **/profile/settings**:\n\n1. **Update Name & Email** — Change your display name and email address\n2. **Change Password** — Enter current password + new password (min 6 chars) + confirm\n3. **Delete Account** — Permanently remove your account (with confirmation)\n\nYou must be logged in to access settings.",
      "dashboard": "**Your Dashboard** 📊\n\nAt **/dashboard** you'll find:\n\n- Welcome message with your name\n- **Stats**: saved places count, bookings count\n- **Quick Actions**: links to favorites, explore, settings\n- **My Bookings**: all your bookings with status badges (Pending, Confirmed, Completed, Cancelled, No-Show)\n\nLog in to access your dashboard!",
      "favorites": "**Favorites / Saved Businesses** ❤️\n\n- Click the **heart icon** on any business detail page to save it\n- View all saved businesses at **/favorites**\n- Remove from favorites anytime\n- Your saved count appears on your dashboard\n\nYou need to be logged in to save favorites.",
      "shop owner": "**Become a Shop Owner** 🏪\n\n1. Register or go to your settings\n2. Submit a Shop Owner Request with: shop name, description, phone, address, category, message\n3. Admin reviews and approves/rejects\n4. Once approved, access your **Shop Owner Dashboard** (/shop-owner)\n\n**Dashboard tabs:**\n- 🏢 My Businesses — manage your listings\n- 🎫 Coupons — create/edit discount coupons\n- 🍽️ Menu Items — manage food/service menu\n- 📅 Bookings — view customer bookings\n- 📩 Contact Admin — send messages with photo attachments (up to 5 images)",
      "premier": "**Premier Shop Owner** 👑\n\nAn upgraded shop owner tier with exclusive features:\n\n- Full **Booking Management Dashboard** (/bookings)\n- Calendar view with drag & drop\n- Create, edit, delete bookings\n- Filter by business/status\n- Monthly statistics: customers + revenue\n- Revenue tracking & analytics\n\nContact admin to upgrade to Premier!",
      "login register": "**Getting Started** 🔐\n\n**Register:**\n1. Go to **/register**\n2. Enter name, email, password\n3. Optionally request Shop Owner status\n\n**Login:**\n- Email + password at **/login**\n- Or use **Google Sign-In** (one click!)\n\n**Forgot Password:**\n1. Go to **/forgot-password**\n2. Enter your email\n3. Receive 6-digit OTP code\n4. Set new password",
      "theme": "**Dark / Light Mode** 🌙☀️\n\nToggle dark or light theme using the button in the header.\nYour preference is saved automatically!",
      "about japan": "**About Japan** 🗾\n\nVisit **/about-japan** for blog articles on:\n- 🏯 Japanese Culture\n- ✈️ Travel Tips\n- 🍜 Food & Drink\n- 🎎 Etiquette\n- 🌸 Seasons\n- 📋 Practical Info\n\nArticles are available in English and Burmese.",
      "admin": "**Admin Dashboard** 🛡️\n\nAdmin-only panel at **/admin** with tabs:\n\n- 👥 **Users** — Manage all users, toggle admin/premium/shop-owner/premier, reset passwords, delete\n- 📝 **Blogs** — Create, edit, delete blog articles\n- 📂 **Categories** — Manage business categories\n- 🏪 **Shops** — Manage all businesses with photos, tags, languages\n- 📋 **Shop Owner Requests** — Approve/reject with notes\n- 📩 **Contact Messages** — Read, reply, delete messages",
    }
  },
  ja: {
    greeting: "こんにちは！👋 **Tattant AIアシスタント**です。日本旅行、文化、食事、言語、プラットフォームの設定や機能について**何でも**お聞きください！",
    fallback: "申し訳ございません、現在AIエンジンに接続できません。下のトピックからお選びください。",
    offline: "現在オフラインモードで、機能が制限されています。しばらくしてからお試しください。",
    placeholder: "何でも聞いてください...",
    quickReplies: [
      "🗾 東京のおすすめ",
      "🍜 ラーメンランキング",
      "💱 両替について",
      "📶 SIMカード",
      "⭐ プレミアム機能",
      "❓ 予約方法",
      "👤 プロフィール設定",
      "🏪 ショップオーナー",
    ],
    answers: {
      "tattantとは": "**Tattant**は、あなたのプレミアム日本ガイドです！🗾\n\nSIMカードや両替所から最高のラーメンや寿司まで、日本のベストビジネスを厳選しています。\n\n- カテゴリ閲覧 & お気に入り保存\n- パートナー店舗で予約\n- JLPTクイズでポイント獲得\n- Points Shop でクーポン交換\n\n英語・ビルマ語・日本語対応！",
      "カテゴリ": "📶 **通信・SIMカード** — 日本でつながる\n🍜 **ラーメン店** — おすすめラーメン\n🍣 **寿司レストラン** — 人気の寿司店\n🥩 **焼肉・BBQ** — 高級和牛\n📚 **書店** — Manga、小説・レア本\n💱 **両替所** — お得なレート\n\n**探索ページ** (/explore) でご覧ください！",
      "予約": "予約は簡単です！📅\n\n1. カテゴリからビジネスを閲覧\n2. 詳細ページを開く\n3. **今すぐ予約**ボタンをクリック\n4. 名前、電話、日時、人数、メモを入力\n5. 送信 → ダッシュボードに表示\n\n**ステータス:** 保留中 → 確認済 → 完了（キャンセル / 不参加）\n\nログインが必要です。",
      "プレミアム": "**Tattantプレミアム** ⭐\n\n✅ JLPT漢字クイズ（全レベルN5〜N1）\n✅ 類似漢字学習\n✅ 文法パターン\n✅ リーダーボード\n✅ おもに辞書（Jisho.org）\n✅ 追加ポイント\n\n**プラン:**\n- 💳 月額: $4.99/月\n- 💎 永久: 一回払い\n\n**/premium** でアップグレード！",
      "ポイント": "**ポイント＆クーポンシステム** 🎁\n\n- JLPTクイズ受験 → ポイント獲得\n- **Points Shop** (/points-shop) → クーポン閲覧\n- ポイント交換 → クーポンコード取得\n- 提携店で提示 → 割引！\n\nDashboard でポイント残高を確認！",
      "日本語学習": "**JLPT学習ハブ** 🎌\n\n1. **漢字クイズ** — 制限時間15秒、多肢選択、コンボ\n2. **類似漢字** — 紛らわしい漢字ペア学習\n3. **文法** — JLPTレベル別文法パターン\n4. **リーダーボード** — グローバルスコア\n5. **辞書** — 日本語検索（Jisho.org）\n\nプレミアム機能です。**/premium** でアップグレード！",
      "プロフィール設定": "**プロフィール設定** ⚙️\n\n**/profile/settings** で以下を変更:\n\n1. **名前・メールアドレス変更**\n2. **パスワード変更** — 現在のパスワード + 新しいパスワード（6文字以上）\n3. **アカウント削除** — 確認ダイアログ付き\n\nログインが必要です。",
      "お気に入り": "**お気に入り** ❤️\n\n- ビジネス詳細ページの**ハートアイコン**で保存\n- **/favorites** で一覧表示\n- いつでも解除可能\n- ダッシュボードに保存数表示",
      "ショップオーナー": "**ショップオーナーになるには** 🏪\n\n1. 登録時にリクエスト submit\n2. 店名、説明、電話、住所、カテゴリを入力\n3. 管理者が承認/拒否\n4. 承認後、**ショップオーナーダッシュボード**にアクセス\n\nタブ: ビジネス管理、クーポン、メニュー、予約、管理者への連絡",
      "テーマ": "**ダーク/ライトモード** 🌙☀️\n\nヘッダーのトグルボタンで切り替え。設定は自動保存されます！",
      "ログイン": "**はじめに** 🔐\n\n- **/register** で新規登録（名前・メール・パスワード）\n- **/login** でログイン（メール+パスワード or Googleサインイン）\n- **/forgot-password** でパスワードリセット（メール → OTP → 新パスワード）",
      "連絡先": "**お問い合わせ** 📩\n\n- **/contact** ページ\n- **/faq** よくある質問\n- メール: **support@tattant.com**\n- ショップオーナーはダッシュボードから写真付きで管理者に連絡可能",
    }
  },
  my: {
    greeting: "မင်္ဂလာပါ! 👋 **Tattant AI လက်ထောက်**ပါ။ ဂျပန်ခရီးသွား၊ ယဉ်ကျေးမှု၊ အစားအသောက်၊ ဘာသာစကား သို့မဟုတ် ပလက်ဖောင်းရဲ့ feature နဲ့ setting အကြောင်း **ဘာမဆို** မေးနိုင်ပါတယ်!",
    fallback: "ဝမ်းနည်းပါတယ်၊ AI စနစ်နဲ့ ချိတ်ဆက်မရပါ။ အောက်ပိုင်းမှ ရွေးချယ်ပါ။",
    offline: "လောလောဆယ် အော့ဖ်လိုင်းမုဒ်ဖြစ်နေပါတယ်။ ခဏစောင့်ပြီး ထပ်ကြိုးစားကြည့်ပါ။",
    placeholder: "ဘာမဆို မေးနိုင်ပါတယ်...",
    quickReplies: [
      "🗾 တိုကျိုမှာ သွားစရာ",
      "🍜 ရာမင်ဆိုင်အကောင်းဆုံး",
      "💱 ငွေလဲလှယ်",
      "📶 SIM ကတ်",
      "⭐ ပရီမီယံ အကြောင်း",
      "❓ ဘုတ်ကင်လုပ်နည်း",
      "👤 ပရိုဖိုင် setting",
      "🏪 ဆိုင်ပိုင်ရှင်",
    ],
    answers: {
      "tattant": "**Tattant** သည် သင့်ရဲ့ ပရီမီယံ ဂျပန်လမ်းညွှန်ဖြစ်ပါတယ်! 🗾\n\nSIM ကတ်တွေ၊ ငွေလဲလှယ်ရေးကနေ အကောင်းဆုံး ရာမင်နဲ့ ဆူရှီအထိ ဂျပန်ရဲ့ အကောင်းဆုံး စီးပွါးရေးလုပ်ငန်းတွေကို စုစည်းထားပါတယ်။\n\n- ကဏ္ဍအလိုက် ရှာဖွေ & အကြိုက်တွေ သိမ်းဆည်း\n- လုပ်ငန်းတွေမှာ ဘုတ်ကင်လုပ်\n- JLPT ပဟေဠိတွေနဲ့ အမှတ်ရယူ\n- Points Shop မှာ ကူပွန်လဲလှယ်\n\nအင်္ဂလိပ်၊ ဗမာ၊ ဂျပန် ၃ ဘာသာနဲ့ ရနိုင်ပါတယ်!",
      "ကဏ္ဍ": "📶 **ဆက်သွယ်ရေး & SIM ကတ်** — ဂျပန်မှာ ချိတ်ဆက်နေပါ\n🍜 **ရာမင်ဆိုင်** — အကောင်းဆုံး ရာမင်ဆိုင်များ\n🍣 **ဆူရှီဆိုင်** — ထိပ်တန်း ဆူရှီဆိုင်များ\n🥩 **ယာကီနီကူ & BBQ** — ပရီမီယံ wagyu\n📚 **စာအုပ်ဆိုင်** — Manga၊ ဝတ္ထု\n💱 **ငွေလဲလှယ်** — အကောင်းဆုံး လဲလှယ်နှုန်း\n\n**Explore** စာမျက်နှာ (/explore) မှာ ကြည့်ပါ!",
      "ဘုတ်ကင်": "ဘုတ်ကင်လုပ်ရတာ လွယ်ပါတယ်! 📅\n\n1. ကဏ္ဍတစ်ခုမှ လုပ်ငန်းကို ရှာပါ\n2. အသေးစိတ်ကြည့်ပါ\n3. **Book Now** ခလုတ်နှိပ်ပါ\n4. နာမည်၊ ဖုန်း၊ ရက်စွဲ၊ အချိန်၊ လူဦးရေ၊ မှတ်ချက် ဖြည့်ပါ\n5. Submit နှိပ်ပါ → Dashboard မှာ ပေါ်လာပါမယ်\n\n**ဘုတ်ကင်အခြေအနေ:** စောင့်ဆိုင်း → အတည်ပြု → ပြီးဆုံး (သို့ ပယ်ဖျက် / မလာ)\n\nလော့အင်ဝင်ထားဖို့ လိုပါတယ်။",
      "ပရီမီယံ": "**Tattant ပရီမီယံ** ⭐\n\n✅ JLPT ခန်းစာကဏ္ဍ (N5-N1 အဆင့်အားလုံး)\n✅ အလားတူ ခန်းစာ လေ့လာမှု\n✅ သဒ္ဒါပုံစံများ\n✅ Leaderboard\n✅ ဂျပန်ဘာသာ အဘိဓာန်\n✅ ပိုရ points\n\n**အစီအစဉ်:**\n- 💳 လစဉ်: $4.99/လ\n- 💎 တစ်သက်တာ: တစ်ကြိမ်ငွေပေးချေ\n\n**/premium** မှာ အဆင့်မြှင့်ပါ!",
      "အမှတ်": "**အမှတ်နဲ့ ကူပွန်စနစ်** 🎁\n\n- JLPT ပဟေဠိတွေ ဖြေ → အမှတ်ရယူ\n- **Points Shop** (/points-shop) → ကူပွန်ရှာ\n- အမှတ်နဲ့ လဲလှယ် → ကူပွန်ကုဒ်ရယူ\n- ဆိုင်မှာ ကူပွန်ပြ → လျှော့စျေးခံစား!\n\nDashboard မှာ အမှတ်လက်ကျန် စစ်ဆေးပါ!",
      "ဂျပန်စာ": "**JLPT လေ့လာရေး Hub** 🎌\n\n1. **ခန်းစာ Quiz** — အချိန်ကန့်သတ် 15 စက္ကန့်၊ ရွေးချယ်မေး\n2. **အလားတူ ခန်းစာ** — ရှုပ်ထွေးနိုင်တဲ့ ခန်းစာအတွဲများ\n3. **သဒ္ဒါ** — JLPT အဆင့်အလိုက်\n4. **Leaderboard** — ကမ္ဘာလုံးဆိုင်ရာ အမှတ်\n5. **အဘိဓာန်** — ဂျပန်စာ ရှာဖွေ\n\nပရီမီယံ feature ဖြစ်ပါတယ်!",
      "ပရိုဖိုင်": "**ပရိုဖိုင် Setting** ⚙️\n\n**/profile/settings** မှာ:\n\n1. **နာမည်နဲ့ အီးမေးလ် ပြောင်းလဲ**\n2. **စကားဝှက် ပြောင်းလဲ** — လက်ရှိ + အသစ် (အနည်းဆုံး ၆ လုံး)\n3. **အကောင့် ဖျက်** — အတည်ပြုချက်နဲ့\n\nလော့အင်ဝင်ထားဖို့ လိုပါတယ်။",
      "ဆိုင်ပိုင်ရှင်": "**ဆိုင်ပိုင်ရှင် ဖြစ်နည်း** 🏪\n\n1. မှတ်ပုံတင်စဉ် သို့မဟုတ် နောက်ပိုင်းမှာ တောင်းဆိုပါ\n2. ဆိုင်နာမည်၊ ဖောင်ပြချက်၊ ဖုန်း၊ လိပ်စာ၊ ကဏ္ဍ ဖြည့်ပါ\n3. Admin ခွင့်ပြု/ပယ်ချပါမယ်\n4. ခွင့်ပြုပြီးရင် **Shop Owner Dashboard** (/shop-owner) ဝင်နိုင်ပါတယ်\n\n**Dashboard tab များ:**\n- 🏢 ကျွန်ုပ်၏ လုပ်ငန်းများ\n- 🎫 ကူပွန်များ\n- 🍽️ မီနူး\n- 📅 ဘုတ်ကင်များ\n- 📩 Admin ကို ဆက်သွယ် (ဓာတ်ပုံ ၅ ပုံအထိ ပူးတွဲနိုင်)",
      "အကြိုက်": "**အကြိုက်များ / သိမ်းဆည်းထားသော လုပ်ငန်းများ** ❤️\n\n- လုပ်ငန်းအသေးစိတ်စာမျက်နှာမှ **နှလုံးသားအိုင်ကွန်** နှိပ်ပါ\n- **/favorites** မှာ အားလုံး ကြည့်ပါ\n- အချိန်မရွေး ဖယ်ရှားနိုင်ပါတယ်\n\nလော့အင်ဝင်ထားဖို့ လိုပါတယ်။",
      "အကောင့်": "**စတင်နည်း** 🔐\n\n**မှတ်ပုံတင်:**\n1. **/register** သို့သွားပါ\n2. နာမည်၊ အီးမေးလ်၊ စကားဝှက် ဖြည့်ပါ\n\n**လော့အင်:**\n- အီးမေးလ် + စကားဝှက် (**/login**)\n- သို့မဟုတ် **Google Sign-In**\n\n**စကားဝှက် မေ့သွားရင်:**\n1. **/forgot-password** သို့သွားပါ\n2. OTP ကုဒ် ၆ လုံး ရယူပါ\n3. စကားဝှက်အသစ် သတ်မှတ်ပါ",
      "အပြင်အဆင်": "**Dark / Light Mode** 🌙☀️\n\nheader ထဲက toggle ခလုတ်နဲ့ ပြောင်းလဲနိုင်ပါတယ်။\nသင့် ရွေးချယ်မှုကို အလိုအလျောက် သိမ်းဆည်းပါတယ်!",
      "ဂျပန်အကြောင်း": "**ဂျပန်အကြောင်း** 🗾\n\n**/about-japan** မှာ ဘလော့ဂ် ဆောင်းပါးများ:\n- 🏯 ဂျပန် ယဉ်ကျေးမှု\n- ✈️ ခရီးသွား အကြံပြုချက်\n- 🍜 အစားအသောက်\n- 🎎 ယဉ်ကျေးမှု ဓလေ့ထုံးစံ\n- 🌸 ရာသီအလိုက်\n- 📋 လက်တွေ့ အချက်အလက်",
      "ဆက်သွယ်": "**ဆက်သွယ်ရန်** 📩\n\n- **/contact** စာမျက်နှာ\n- **/faq** မေးလေ့ရှိသော မေးခွန်းများ\n- အီးမေးလ်: **support@tattant.com**\n- ဆိုင်ပိုင်ရှင်များ Dashboard ကနေ ဓာတ်ပုံပါ admin ကို ဆက်သွယ်နိုင်",
    }
  }
}

/* =========================================================
 *  Local keyword matching (fallback only)
 * ========================================================= */
const KEYWORD_MAP = {
  en: [
    { keys: ['what is tattant', 'tattant', 'about tattant', 'what do you do', 'platform'], answer: 'what is tattant' },
    { keys: ['categories', 'services', 'category', 'sim', 'ramen', 'sushi', 'yakiniku', 'book store', 'currency', 'exchange', 'telecom'], answer: 'categories' },
    { keys: ['book', 'booking', 'reserve', 'reservation', 'how to book', 'book now'], answer: 'how to book' },
    { keys: ['premium', 'upgrade', 'membership', 'subscribe', 'plan', 'pricing', 'monthly', 'lifetime'], answer: 'premium' },
    { keys: ['points', 'coupon', 'redeem', 'discount', 'points shop', 'rewards'], answer: 'points' },
    { keys: ['learn', 'japanese', 'jlpt', 'quiz', 'kanji', 'grammar', 'dictionary', 'n5', 'n4', 'n3', 'n2', 'n1'], answer: 'learn japanese' },
    { keys: ['language', 'languages', 'english', 'burmese', 'multilingual', 'translate'], answer: 'languages' },
    { keys: ['contact', 'support', 'help', 'email', 'message'], answer: 'contact' },
    { keys: ['profile', 'settings', 'account settings', 'change password', 'update name', 'delete account'], answer: 'profile settings' },
    { keys: ['dashboard', 'my dashboard', 'user dashboard', 'stats'], answer: 'dashboard' },
    { keys: ['favorite', 'favourites', 'saved', 'heart', 'bookmarks', 'save business'], answer: 'favorites' },
    { keys: ['shop owner', 'owner', 'manage shop', 'my business', 'become owner', 'shop dashboard'], answer: 'shop owner' },
    { keys: ['premier', 'premier owner', 'booking dashboard', 'calendar', 'revenue', 'analytics'], answer: 'premier' },
    { keys: ['login', 'register', 'sign up', 'sign in', 'forgot password', 'otp', 'google login', 'authentication'], answer: 'login register' },
    { keys: ['theme', 'dark mode', 'light mode', 'dark', 'light', 'appearance'], answer: 'theme' },
    { keys: ['about japan', 'blog', 'articles', 'culture', 'travel tips', 'etiquette'], answer: 'about japan' },
    { keys: ['admin', 'admin dashboard', 'manage users', 'admin panel'], answer: 'admin' },
  ],
  ja: [
    { keys: ['tattant', 'とは', 'なに', '何', 'プラットフォーム'], answer: 'tattantとは' },
    { keys: ['カテゴリ', 'サービス', 'sim', 'ラーメン', '寿司', '焼肉', '書店', '両替', '通信'], answer: 'カテゴリ' },
    { keys: ['予約', 'ブッキング', '予約方法', '予約する'], answer: '予約' },
    { keys: ['プレミアム', 'アップグレード', '会員', '月額', '永久', '料金'], answer: 'プレミアム' },
    { keys: ['ポイント', 'クーポン', '割引', '交換', 'ポイントショップ'], answer: 'ポイント' },
    { keys: ['学習', '日本語', 'jlpt', 'クイズ', '漢字', '文法', '辞書'], answer: '日本語学習' },
    { keys: ['設定', 'プロフィール', 'パスワード', 'メール', 'アカウント'], answer: 'プロフィール設定' },
    { keys: ['お気に入り', '保存', 'ハート', 'ブックマーク'], answer: 'お気に入り' },
    { keys: ['オーナー', 'ショップオーナー', '店舗管理', 'ビジネス管理'], answer: 'ショップオーナー' },
    { keys: ['テーマ', 'ダーク', 'ライト', '暗い', '明るい'], answer: 'テーマ' },
    { keys: ['ログイン', '登録', 'サインイン', 'パスワード忘れ', 'グーグル'], answer: 'ログイン' },
    { keys: ['連絡', '問い合わせ', 'メール', 'サポート', 'ヘルプ'], answer: '連絡先' },
  ],
  my: [
    { keys: ['tattant', 'ဘာလဲ', 'ပလက်ဖောင်း'], answer: 'tattant' },
    { keys: ['ကဏ္ဍ', 'ဝန်ဆောင်မှု', 'sim', 'ရာမင်', 'ဆူရှီ', 'ယာကီနီကူ', 'စာအုပ်', 'ငွေလဲ'], answer: 'ကဏ္ဍ' },
    { keys: ['ဘုတ်ကင်', 'ကြိုတင်', 'reserve', 'booking'], answer: 'ဘုတ်ကင်' },
    { keys: ['ပရီမီယံ', 'အဆင့်မြှင့်', 'premium', 'အစီအစဉ်'], answer: 'ပရီမီယံ' },
    { keys: ['အမှတ်', 'ကူပွန်', 'လျှော့', 'points', 'ပွိုင့်'], answer: 'အမှတ်' },
    { keys: ['ဂျပန်စာ', 'jlpt', 'ခန်းစာ', 'quiz', 'သဒ္ဒါ', 'အဘိဓာန်'], answer: 'ဂျပန်စာ' },
    { keys: ['ပရိုဖိုင်', 'setting', 'စကားဝှက်', 'အီးမေးလ်', 'အကောင့်'], answer: 'ပရိုဖိုင်' },
    { keys: ['ဆိုင်ပိုင်ရှင်', 'owner', 'ဆိုင်', 'စီးပွါးရေး', 'လုပ်ငန်း'], answer: 'ဆိုင်ပိုင်ရှင်' },
    { keys: ['အကြိုက်', 'သိမ်း', 'favorite', 'နှလုံးသား'], answer: 'အကြိုက်' },
    { keys: ['login', 'register', 'လော့အင်', 'မှတ်ပုံတင်', 'google'], answer: 'အကောင့်' },
    { keys: ['theme', 'dark', 'light', 'အပြင်အဆင်', 'အမှောင်', 'အလင်း'], answer: 'အပြင်အဆင်' },
    { keys: ['ဂျပန်အကြောင်း', 'ဘလော့ဂ်', 'ယဉ်ကျေးမှု', 'ဆောင်းပါး'], answer: 'ဂျပန်အကြောင်း' },
    { keys: ['ဆက်သွယ်', 'support', 'help', 'အကူအညီ'], answer: 'ဆက်သွယ်' },
  ]
}

function findLocalAnswer (input, lang) {
  const text = input.toLowerCase().trim()
  const map = KEYWORD_MAP[lang] || KEYWORD_MAP.en
  const answers = KB[lang]?.answers || KB.en.answers
  for (const entry of map) {
    if (entry.keys.some(k => text.includes(k))) return answers[entry.answer]
  }
  return null
}

/* =========================================================
 *  Contextual follow-up suggestions
 * ========================================================= */
const FOLLOW_UP_SUGGESTIONS = {
  en: [
    "🍜 Best ramen in Tokyo",
    "🗾 Travel tips for first-timers",
    "💴 How much does Japan cost?",
    "🚅 Shinkansen vs flights",
    "🏨 Where to stay in Osaka",
    "🎌 Must-see temples & shrines",
    "🍣 Sushi etiquette guide",
    "📱 eSIM vs physical SIM",
    "🌸 Best time to visit Japan",
    "🗣️ Useful Japanese phrases",
    "🏯 Kyoto day trip guide",
    "🗻 Climbing Mount Fuji",
    "⚙️ How to change my settings",
    "🏪 How to become a shop owner",
    "👑 What is Premier shop owner?",
    "🎁 How do points work?",
    "📅 How does booking work?",
    "❤️ How to save favorites",
    "📝 How to register",
    "🔐 Forgot my password",
  ],
  ja: [
    "🗾 初めての日本旅行",
    "🍜 東京のラーメン",
    "🚅 新幹線の使い方",
    "🏨 大阪のホテル",
    "🌸 桜の季節",
    "🎌 おすすめ神社仏閣",
    "⚙️ 設定の変更方法",
    "🏪 ショップオーナーになるには",
    "⭐ プレミアムの特典",
    "🎁 ポイントの使い方",
    "📅 予約のやり方",
    "❤️ お気に入りの保存方法",
  ],
  my: [
    "🗾 ဂျပန်ခရီးစဉ်",
    "🍜 တိုကျိုရာမင်",
    "🚅 ရှင်ကန်ဆင် အသုံးပြုပုံ",
    "💴 ဂျပန်ခရီးစရိတ်",
    "⚙️ Setting ပြောင်းနည်း",
    "🏪 ဆိုင်ပိုင်ရှင် ဖြစ်နည်း",
    "⭐ ပရီမီယံ အကျိုးကျေးဇူး",
    "🎁 အမှတ်တွေ ဘယ်လိုသုံးမလဲ",
    "📅 ဘုတ်ကင်လုပ်နည်း",
    "❤️ အကြိုက်တွေ သိမ်းနည်း",
    "📝 မှတ်ပုံတင်နည်း",
    "🔐 စကားဝှက် မေ့သွားရင်",
  ]
}

/* =========================================================
 *  Markdown Renderer
 * ========================================================= */
function renderMarkdown (text) {
  return text.split('\n').map((line, lineIdx) => {
    const processInline = (str) => {
      const parts = []
      let remaining = str
      let partKey = 0

      while (remaining.length > 0) {
        const boldMatch = remaining.match(/\*\*(.*?)\*\*/)
        const codeMatch = remaining.match(/`(.*?)`/)

        let earliest = null
        let type = null

        if (boldMatch && (!earliest || boldMatch.index < earliest.index)) {
          earliest = boldMatch
          type = 'bold'
        }
        if (codeMatch && (!earliest || codeMatch.index < earliest.index)) {
          earliest = codeMatch
          type = 'code'
        }

        if (!earliest) {
          parts.push(<React.Fragment key={partKey++}>{remaining}</React.Fragment>)
          break
        }

        if (earliest.index > 0) {
          parts.push(<React.Fragment key={partKey++}>{remaining.slice(0, earliest.index)}</React.Fragment>)
        }

        if (type === 'bold') {
          parts.push(<strong key={partKey++}>{earliest[1]}</strong>)
        } else if (type === 'code') {
          parts.push(<code key={partKey++} className="chat-inline-code">{earliest[1]}</code>)
        }

        remaining = remaining.slice(earliest.index + earliest[0].length)
      }

      return parts
    }

    // Bullet points
    if (/^\s*[-•✅✓]\s+/.test(line)) {
      return (
        <div key={lineIdx} className="chat-list-item">
          <span className="chat-bullet">•</span>
          <span>{processInline(line.replace(/^\s*[-•✅✓]\s+/, ''))}</span>
        </div>
      )
    }

    // Numbered lists
    const numMatch = line.match(/^(\d+)\.\s+(.*)/)
    if (numMatch) {
      return (
        <div key={lineIdx} className="chat-list-item">
          <span className="chat-num">{numMatch[1]}.</span>
          <span>{processInline(numMatch[2])}</span>
        </div>
      )
    }

    // Empty line
    if (line.trim() === '') {
      return <div key={lineIdx} className="chat-spacer" />
    }

    return <div key={lineIdx}>{processInline(line)}</div>
  })
}

/* =========================================================
 *  ChatBot Component
 * ========================================================= */
export default function ChatBot () {
  const [isOpen, setIsOpen] = useState(false)
  const [lang, setLang] = useState('en')
  const [messages, setMessages] = useState([])
  const [inputVal, setInputVal] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [hasGreeted, setHasGreeted] = useState({})
  const [aiAvailable, setAiAvailable] = useState(true)
  const [suggestions, setSuggestions] = useState([])
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  /* ---------- Auto-scroll ---------- */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  /* ---------- Greeting on open ---------- */
  useEffect(() => {
    if (isOpen && !hasGreeted[lang]) {
      setHasGreeted(prev => ({ ...prev, [lang]: true }))
      const kb = KB[lang] || KB.en
      setMessages(prev => [...prev, { role: 'bot', text: kb.greeting }])
      setSuggestions(kb.quickReplies)
    }
  }, [isOpen, lang])

  /* ---------- Focus input on open ---------- */
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300)
    }
  }, [isOpen])

  /* ---------- Send to AI backend ---------- */
  const sendToAI = useCallback(async (userMessage, conversationHistory) => {
    try {
      const res = await api.post('/chat', {
        message: userMessage,
        history: conversationHistory.slice(-20).map(m => ({ role: m.role, text: m.text })),
        lang
      })

      if (res.data.success) {
        setAiAvailable(true)
        return res.data.data.reply
      }

      if (res.data.fallback) {
        setAiAvailable(false)
        return null
      }

      return null
    } catch (err) {
      console.warn('ChatBot AI unavailable:', err.message)
      setAiAvailable(false)
      return null
    }
  }, [lang])

  /* ---------- Handle sending a message ---------- */
  const handleSend = useCallback(async (text) => {
    const trimmed = (text || inputVal).trim()
    if (!trimmed || isTyping) return
    setInputVal('')

    const userMsg = { role: 'user', text: trimmed }
    setMessages(prev => [...prev, userMsg])
    setIsTyping(true)
    setSuggestions([])

    const allMessages = [...messages, userMsg]
    let reply = null

    if (aiAvailable) {
      reply = await sendToAI(trimmed, allMessages)
    }

    // Fallback to local KB
    if (!reply) {
      reply = findLocalAnswer(trimmed, lang)
    }

    // Ultimate fallback
    if (!reply) {
      const kb = KB[lang] || KB.en
      reply = aiAvailable ? kb.fallback : kb.offline
    }

    setIsTyping(false)
    setMessages(prev => [...prev, { role: 'bot', text: reply }])

    // Contextual follow-up suggestions
    const followUps = FOLLOW_UP_SUGGESTIONS[lang] || FOLLOW_UP_SUGGESTIONS.en
    const shuffled = [...followUps].sort(() => Math.random() - 0.5)
    setSuggestions(shuffled.slice(0, 4))

  }, [inputVal, isTyping, messages, lang, aiAvailable, sendToAI])

  const handleQuickReply = useCallback((reply) => {
    handleSend(reply)
  }, [handleSend])

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }, [handleSend])

  const handleLangSwitch = useCallback((newLang) => {
    if (newLang === lang) return
    setLang(newLang)
  }, [lang])

  const handleClearChat = useCallback(() => {
    setMessages([])
    setHasGreeted({})
    const kb = KB[lang] || KB.en
    setMessages([{ role: 'bot', text: kb.greeting }])
    setHasGreeted({ [lang]: true })
    setSuggestions(kb.quickReplies)
  }, [lang])

  const currentKB = KB[lang] || KB.en

  return (
    <>
      {/* Floating Toggle */}
      <button
        className={`chatbot-toggle ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open chat"
      >
        {isOpen ? '✕' : '💬'}
        {!isOpen && <span className="notif-dot" />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="chatbot-window">
          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-header-left">
              <div className="chatbot-avatar">
                <span className="avatar-pulse" />
                🤖
              </div>
              <div className="chatbot-header-info">
                <h4>Tattant AI</h4>
                <span className="chatbot-status">
                  <span className={`status-dot ${aiAvailable ? 'online' : 'limited'}`} />
                  {aiAvailable
                    ? (lang === 'ja' ? 'AI搭載' : lang === 'my' ? 'AI စွမ်းအင်' : 'AI Powered')
                    : (lang === 'ja' ? 'オフライン' : lang === 'my' ? 'အော့ဖ်လိုင်း' : 'Offline Mode')
                  }
                </span>
              </div>
            </div>
            <div className="chatbot-header-actions">
              <button className="chatbot-close-btn" onClick={() => setIsOpen(false)} aria-label="Close chat">
                ✕
              </button>
            </div>
          </div>

          {/* Language Bar */}
          <div className="chatbot-lang-bar">
            <button className={`chatbot-lang-btn ${lang === 'en' ? 'active' : ''}`} onClick={() => handleLangSwitch('en')}>
              🇬🇧 EN
            </button>
            <button className={`chatbot-lang-btn ${lang === 'ja' ? 'active' : ''}`} onClick={() => handleLangSwitch('ja')}>
              🇯🇵 日本語
            </button>
            <button className={`chatbot-lang-btn ${lang === 'my' ? 'active' : ''}`} onClick={() => handleLangSwitch('my')}>
              🇲🇲 မြန်မာ
            </button>
          </div>

          {/* Messages */}
          <div className="chatbot-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`chat-msg ${msg.role}`}>
                <div className="chat-msg-avatar">
                  {msg.role === 'bot' ? '🤖' : '👤'}
                </div>
                <div className="chat-msg-bubble">
                  {msg.role === 'bot' ? renderMarkdown(msg.text) : msg.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="chat-msg bot">
                <div className="chat-msg-avatar">🤖</div>
                <div className="typing-indicator">
                  <span /><span /><span />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Replies / Suggestions */}
          {suggestions.length > 0 && !isTyping && (
            <div className="chatbot-quick-replies">
              {suggestions.map((reply, i) => (
                <button key={i} className="quick-reply-btn" onClick={() => handleQuickReply(reply)}>
                  {reply}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="chatbot-input-area">
            <input
              ref={inputRef}
              className="chatbot-input"
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={currentKB.placeholder}
              disabled={isTyping}
            />
            <button
              className="chatbot-send-btn"
              onClick={() => handleSend()}
              disabled={!inputVal.trim() || isTyping}
              aria-label="Send"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>

          {/* AI Badge */}
          <div className="chatbot-ai-badge">
            Powered by Gemini AI ✨
          </div>
        </div>
      )}
    </>
  )
}
