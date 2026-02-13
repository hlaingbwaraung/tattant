/**
 * i18n Configuration (react-i18next)
 *
 * Supported locales:
 *   - en  (English)  – default
 *   - my  (Burmese)
 *
 * The active locale is persisted to localStorage as 'locale'.
 */
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en.json'
import my from './locales/my.json'

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    my: { translation: my }
  },
  lng: localStorage.getItem('locale') || 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false // React already escapes
  }
})

export default i18n
