/**
 * vue-i18n configuration
 *
 * Supported locales:
 *   - en  (English)  – default
 *   - my  (Burmese)
 *
 * The active locale is persisted to localStorage as 'locale'.
 */
import { createI18n } from 'vue-i18n'
import en from './locales/en.json'
import my from './locales/my.json'

const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: localStorage.getItem('locale') || 'en',
  fallbackLocale: 'en',
  messages: {
    en,
    my
  }
})

export default i18n
