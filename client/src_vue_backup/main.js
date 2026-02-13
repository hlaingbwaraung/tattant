/**
 * Application Bootstrap
 *
 * Creates the Vue app instance and registers:
 *  - Pinia  (state management)
 *  - Router (client-side routing)
 *  - i18n   (English / Burmese translations)
 *
 * Then mounts everything to #app in index.html.
 */

import { createApp }  from 'vue'
import { createPinia } from 'pinia'
import App    from './App.vue'
import router from './router'
import i18n   from './i18n'
import './style.css'

const app   = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(i18n)

app.mount('#app')
