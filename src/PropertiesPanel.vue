<!-- 属性面板 -->
<template>
  <div>
    <div v-if="element" class="titleStyle">
      {{ element.businessObject.name || element.id }}
    </div>
    <keep-alive>
      <component
        :is="getComponent"
        v-if="element"
        :key="element.eid"
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
import { next } from '@/utils/tools'

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
    },
    candidateUsers: {
      type: Array,
      default: null
    },
    candidateGroups: {
      type: Array,
      default: null
    },
    executionListenerClasses: {
      type: Array,
      default: null
    },
    taskListenerClasses: {
      type: Array,
      default: null
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
      this.reset(e.element)
    })
    this.modeler.on('element.click', e => {
      this.reset(e.element)
    })
    this.modeler.on('selection.changed', e => {
      if (e.newSelection && e.newSelection[0]) {
        this.reset(e.newSelection[0])
      }
    })
  },
  methods: {
    reset(newElement) {
      this.element = null
      this.$nextTick().then(() => {
        this.element = newElement
        if (!this.element.eid) {
          this.element.eid = next()
        }
      })
    }
  }
}
</script>

<style scoped>
  .titleStyle {
    margin: 10px 0 5px 0;
  }
</style>
