<!-- https://docs.camunda.org/manual/latest/reference/bpmn20/tasks/ -->
<template>
  <div>
    <Activity :element="element" :moddle="moddle" :bo="bo" @sync="sync" @write="write">
      <template #detail>
        <FormItemInput
          v-model="bo.dueDate"
          :label="$customTranslate('Due Date')"
          prop="dueDate"
        />
        <FormItemInput
          v-model="bo.followUpDate"
          :label="$customTranslate('Follow Up Date')"
          prop="followUpDate"
        />
        <FormItemInput
          v-model="bo.priority"
          :label="$customTranslate('Priority')"
          prop="priority"
        />
        <el-form-item :label="$customTranslate('Task Listener')">
          <el-badge :value="listenerLength">
            <el-button @click="showListener = true">
              {{ $customTranslate('Update') }}
            </el-button>
          </el-badge>
        </el-form-item>
      </template>
    </Activity>
    <TaskListener v-if="showListener" :moddle="moddle" :bo="bo" @write="write" @close="finishListener" />
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
    'bo.dueDate'(val) {
      this.write({ dueDate: val })
    },
    'bo.followUpDate'(val) {
      this.write({ followUpDate: val })
    },
    'bo.priority'(val) {
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
      this.listenerLength = this.bo.extensionElements?.values
        ?.filter(item => is(item, customize('TaskListener'))).length ?? 0
    }
  }
}
</script>
