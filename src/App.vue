<template>
  <div id="app">
    <bpmn-modeler :element-templates="customElementTemplates" />
  </div>
</template>

<script>
import BpmnModeler from '@/BpmnModeler'
import CUSTOM_ELEMENT_TEMPLATES from './custom.json'

export default {
  name: 'App',
  components: { BpmnModeler },
  data() {
    return {
      customElementTemplates: CUSTOM_ELEMENT_TEMPLATES
    }
  },
  methods: {}
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

