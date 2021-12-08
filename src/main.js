import Vue from 'vue'
import App from './App.vue'
import Element from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import customTranslate from '@/utils/customTranslate'
// import './styles/global.less' // global css

Vue.prototype.$customTranslate = customTranslate

Vue.use(Element)

new Vue({
  el: '#app',
  render: h => h(App)
})
