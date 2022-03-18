<!-- https://docs.camunda.org/manual/latest/reference/bpmn20/tasks/ -->
<template>
  <div>
    <Activity :moddle="moddle" :business-object="businessObject" :templates="templates" @sync="sync" @write="write">
      <template #detail>
        <FormItemInput v-model="businessObject.dueDate" :label="$customTranslate('Due Date')" prop="dueDate" />
        <FormItemInput v-model="businessObject.followUpDate" :label="$customTranslate('Follow Up Date')" prop="followUpDate" />
        <FormItemInput v-model="businessObject.priority" :label="$customTranslate('Priority')" prop="priority" />
        <el-form-item :label="$customTranslate('Task Listener')">
          <el-badge :value="listenerLength">
            <el-button @click="showListener = true">
              {{ $customTranslate('Update') }}
            </el-button>
          </el-badge>
        </el-form-item>
      </template>
    </Activity>
    <TaskListener v-if="showListener" :moddle="moddle" :business-object="businessObject" @close="finishListener" />
  </div>
</template>

<script>
import Activity from '../../embbed/Activity'
import TaskListener from '../../part/listener/TaskListener'
import FormItemInput from '../../ui/FormItemInput'
import elementHelper from '../../../mixins/elementHelper'
import { is } from 'bpmn-js/lib/util/ModelUtil'
import { customize } from '../../../utils'

export default {
  name: 'UserTask',
  components: {
    Activity,
    TaskListener,
    FormItemInput
  },
  mixins: [elementHelper],
  data() {
    return {
      showListener: false,
      listenerLength: 0
    }
  },
  watch: {
    'businessObject.dueDate'(val) {
      this.write({ dueDate: val })
    },
    'businessObject.followUpDate'(val) {
      this.write({ followUpDate: val })
    },
    'businessObject.priority'(val) {
      this.write({ priority: val })
    }
  },
  created() {
    this.sync()
  },
  methods: {
    sync() {
      this.computeLength()
    },
    finishListener() {
      this.computeLength()
      this.showListener = false
    },
    computeLength() {
      this.listenerLength = this.businessObject.extensionElements?.values
        ?.filter(item => is(item, customize('TaskListener'))).length ?? 0
    }
  }
}
</script>
