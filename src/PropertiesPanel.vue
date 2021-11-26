<!-- 属性面板 -->
<template>
  <div class="panelStyle">
    <div v-if="element" class="titleStyle">
      {{ element.businessObject.name || element.id }}
    </div>
    <keep-alive>
      <component
        :is="getComponent"
        v-if="element"
        :key="element.id"
        :element="element"
        :modeling="modeling"
        :moddle="moddle"
      />
    </keep-alive>
  </div>
</template>

<script>
import Common from '@/components/embbed/Common'
import Process from '@/components/bpmn/Process'
import StartEvent from '@/components/bpmn/events/StartEvent'
import EndEvent from '@/components/bpmn/events/EndEvent'
import SequenceFlow from '@/components/bpmn/SequenceFlow'
import Task from '@/components/bpmn/tasks/Task'
import UserTask from '@/components/bpmn/tasks/UserTask'

export default {
  name: 'PropertiesPanel',
  components: {
    Common,
    Process,
    StartEvent,
    EndEvent,
    SequenceFlow,
    Task,
    UserTask
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
      return this.element?.type.split(':')[1]
    },
    modeling() {
      return this.modeler.get('modeling')
    },
    moddle() {
      return this.modeler.get('moddle')
    }
  },
  mounted() {
    this.modeler.on('root.added', e => {
      this.reset(e)
    })
    this.modeler.on('element.click', e => {
      this.reset(e)
    })
    this.modeler.on('selection.changed', e => {
      this.element = null
      if (e.newSelection && e.newSelection[0]) {
        this.$nextTick().then(() => {
          this.element = e.newSelection[0]
        })
      }
    })
  },
  methods: {
    reset(event) {
      this.element = null
      this.$nextTick().then(() => {
        this.element = event.element
      })
    }
  }
}
</script>

<style scoped>
  .panelStyle {
    background-color: #F2F6FC
  }

  .titleStyle {
    margin: 15px 0 15px 0;
  }
</style>
