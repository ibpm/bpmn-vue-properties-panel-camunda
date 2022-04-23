import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    nodeTitle: '',
    templateMap: {} // key=bpmn:xxx,value=templates array
  },
  getters: {
    getTemplates: state => (nodeType) => {
      return state.templateMap[nodeType] || []
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
