import Vue from 'vue'
import Vuex from 'vuex'
import { splitColon } from '../utils/tools'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    nodeTitle: '',
    templateMap: {} // key=bpmn:xxx,value=templates array
  },
  getters: {
    bindingNames: state => (nodeType, tId) => {
      return !nodeType || !tId ? []
        : state.templateMap[nodeType].find(t => t.id === tId)?.properties?.map(p => splitColon(p['binding']?.name))
    }
  },
  mutations: {
    PUT_TEMPLATE(state, { nodeType, templates }) {
      if (nodeType && !state.templateMap[nodeType]) {
        state.templateMap[nodeType] = templates
      }
    },
    SET_NODE_TITLE(state, title) {
      state.nodeTitle = title
    }
  }
})
