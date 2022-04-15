import store from '../store'

/**
 * 前置条件：在选中modelerTemplate后进行计算
 * binding.arg:bo
 * binding.value:prop
 *
 * @type {{inserted: templated.inserted}}
 */
const
  templated = (el, binding) => {
    if (el?.parentNode && binding.arg) {
      const
        tId = binding.arg['modelerTemplate'],
        nodeType = binding.arg['$type'],
        names = store.getters.bindingNames(nodeType, tId)
      console.log(tId, nodeType, names, binding.value)
      if (names.find(n => n === binding.value)) {
        el.parentNode.removeChild(el)
      }
    }
  },
  install = (Vue) => {
    Vue.directive('templated', templated)
  }

if (window.Vue) {
  window['templated'] = templated
  Vue.use(install) // eslint-disable-line
}

templated.install = install

export default templated
