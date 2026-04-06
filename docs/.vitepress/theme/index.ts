import type { App } from 'vue'
import DefaultTheme from 'vitepress/theme'
import CustomLayout from './CustomLayout.vue'
import ApiReference from './components/ApiReference.vue'
import './custom.css'

export default {
  ...DefaultTheme,
  Layout: CustomLayout,
  enhanceApp({ app }: { app: App }) {
    app.component('ApiReference', ApiReference)
  }
}
