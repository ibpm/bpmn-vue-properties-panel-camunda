<!-- 属性面板 -->
<template>
  <div style="background-color: #F2F6FC">
    <div v-if="element">
      {{ element.businessObject.name || element.id }}
    </div>
    <component
      :is="getComponent"
      v-if="element"
      :modeler="modeler"
      :element="element"
    />
  </div>
</template>

<script>
import Process from '@/components/bpmn/Process'
import Task from '@/components/bpmn/tasks/Task'
import Event from '@/components/bpmn/events/Event'

export default {
  name: 'PropertiesPanel',
  components: {
    Process,
    Task,
    Event
  },
  props: {
    modeler: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      element: null
    }
  },
  computed: {
    getComponent() {
      switch (this.element?.type) {
        case 'bpmn:Process':
          return 'Process'
        case 'bpmn:StartEvent':
        case 'bpmn:EndEvent':
        case 'bpmn:IntermediateThrowEvent':
          return 'Event'
        case 'bpmn:Task':
        case 'bpmn:UserTask':
        case 'bpmn:ServiceTask':
        case 'bpmn:ScriptTask':
        case 'bpmn:SendTask':
        case 'bpmn:ReceiveTask':
        case 'bpmn:ManualTask':
        case 'bpmn:BusinessRuleTask':
          return 'Task'
        case 'bpmn:SequenceFlow':
          return 'SequenceFlow'
        case 'bpmn:ExclusiveGateway':
        case 'bpmn:InclusiveGateway':
        case 'bpmn:ParallelGateway':
        case 'bpmn:EventBasedGateway':
          return 'Gateway'
        default:
          return null
      }
    }
  },
  mounted() {
    this.modeler.on('root.added', e => {
      this.element = null
      this.$nextTick().then(() => {
        this.element = e.element
      })
    })
    this.modeler.on('element.click', e => {
      this.element = e.element
    })
    this.modeler.on('selection.changed', e => {
      this.element = null
      if (e.newSelection && e.newSelection[0]) {
        this.$nextTick().then(() => {
          this.element = e.newSelection[0]
        })
      }
    })
  }
}
</script>

<style scoped>

</style>
