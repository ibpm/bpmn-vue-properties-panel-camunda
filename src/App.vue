<template>
  <div id="app">
    <bpmn-modeler :source="source" :element-templates="customElementTemplates" @update="update" />
  </div>
</template>

<script>
import BpmnModeler from './BpmnModeler'
import CUSTOM_ELEMENT_TEMPLATES from './custom.json'
import { INITIAL_DIAGRAM } from './utils/constants'

export default {
  name: 'App',
  components: { BpmnModeler },
  data() {
    return {
      source: INITIAL_DIAGRAM,
      customElementTemplates: CUSTOM_ELEMENT_TEMPLATES
    }
  },
  methods: {
    update(source) {
      this.source = source
    }
  }
}
</script>

<style lang="scss">
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>

