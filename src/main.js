import Vue from 'vue'
import App from './App.vue'
import Element from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import customTranslate from './utils/customTranslate'
import store from './store'

Vue.prototype.$customTranslate = customTranslate

Vue.use(Element)

new Vue({
  el: '#app',
  store,
  render: h => h(App)
})
