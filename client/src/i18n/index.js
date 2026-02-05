import { createI18n } from 'vue-i18n'
import en from './locales/en.json'
import jp from './locales/jp.json'
import cn from './locales/cn.json'
import kr from './locales/kr.json'

const i18n = createI18n({
  legacy: false,
  locale: localStorage.getItem('locale') || navigator.language.split('-')[0] || 'en',
  fallbackLocale: 'en',
  messages: {
    en,
    jp,
    cn,
    kr
  }
})

export default i18n
