import { createApp } from 'vue'
import { createPinia } from 'pinia' // 1. Import createPinia

import './style.css'
import App from './App.vue'
import router from './router'

const app = createApp(App)

// 2. Create a Pinia instance
const pinia = createPinia()

// 3. Tell the Vue app to use Pinia
app.use(pinia)
// Make sure to use router AFTER creating app, but BEFORE mounting
app.use(router)

app.mount('#app')