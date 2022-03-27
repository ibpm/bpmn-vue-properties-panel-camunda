<!-- 属性面板 -->
<template>
  <div>
    <div v-if="element" class="titleStyle">
      {{ bo.name || bo.id || element.id }}
    </div>
    <component
      :is="getComponent"
      v-if="element"
      :element="element"
      :modeling="modeling"
      :moddle="moddle"
      :bo="bo"
      :templates="templates"
    />
  </div>
</template>

<script>
import Process from '../components/bpmn/Process'
import StartEvent from '../components/bpmn/events/StartEvent'
import EndEvent from '../components/bpmn/events/EndEvent'
import Gateway from '../components/bpmn/gateways/Gateway'
import SequenceFlow from '../components/bpmn/SequenceFlow'
import Task from '../components/bpmn/tasks/Task'
import UserTask from '../components/bpmn/tasks/UserTask'
import ServiceTask from '../components/bpmn/tasks/ServiceTask'
import ScriptTask from '../components/bpmn/tasks/ScriptTask'
import BusinessRuleTask from '../components/bpmn/tasks/BusinessRuleTask'
import ReceiveTask from '../components/bpmn/tasks/ReceiveTask'
import CallActivity from '../components/bpmn/subprocess/CallActivity'
import { isAny } from 'bpmn-js/lib/util/ModelUtil'
// import { next } from '../utils/tools'

export default {
  name: 'PropertiesPanel',
  components: {
    Process,
    SequenceFlow,
    // events
    StartEvent,
    EndEvent,
    // gateways
    Gateway,
    // tasks
    Task,
    UserTask,
    ServiceTask,
    ScriptTask,
    BusinessRuleTask,
    ReceiveTask,
    // subprocess
    CallActivity
  },
  props: {
    modeler: {
      type: Object,
      required: true
    },
    elementTemplates: {
      type: Array,
      default: () => []
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
      element: null,
      bo: null
    }
  },
  computed: {
    getComponent() {
      const type = this.element?.type.split(':')[1]
      if (type.endsWith('Gateway')) {
        return 'Gateway'
      }
      switch (type) {
        // https://docs.camunda.org/manual/latest/reference/bpmn20/tasks/send-task/
        case 'SendTask': return 'ServiceTask'
        // https://docs.camunda.org/manual/latest/reference/bpmn20/tasks/manual-task/
        case 'ManualTask': return 'Task'
        default: return type
      }
    },
    modeling() {
      return this.modeler.get('modeling')
    },
    moddle() {
      return this.modeler.get('moddle')
    },
    templates() {
      return this.elementTemplates?.filter(template => isAny(this.element, template.appliesTo))
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
        this.bo = {
          ...this.element.businessObject
        }
      })
    }
  }
}
</script>

<style scoped>
  .titleStyle {
    text-align: center;
    margin-top: 10px;
    margin-bottom: 10px;
  }
</style>
