<!-- https://docs.camunda.org/manual/latest/reference/bpmn20/tasks/ -->
<template>
  <div>
    <Activity :moddle="moddle" :form="form" :templates="templates" @sync="sync" @write="write">
      <template #detail>
        <FormItemInput v-model="form.dueDate" :label="$customTranslate('Due Date')" prop="dueDate" />
        <FormItemInput v-model="form.followUpDate" :label="$customTranslate('Follow Up Date')" prop="followUpDate" />
        <FormItemInput v-model="form.priority" :label="$customTranslate('Priority')" prop="priority" />
        <el-form-item :label="$customTranslate('Task Listener')">
          <el-badge :value="listenerLength">
            <el-button @click="showListener = true">
              {{ $customTranslate('Update') }}
            </el-button>
          </el-badge>
        </el-form-item>
      </template>
    </Activity>
    <TaskListener v-if="showListener" :moddle="moddle" :form="form" @close="finishListener" />
  </div>
</template>

<script>
import Activity from '@/components/embbed/Activity'
import TaskListener from '@/components/part/listener/TaskListener'
import FormItemInput from '@/components/ui/FormItemInput'
import elementHelper from '@/mixins/elementHelper'
import { is } from 'bpmn-js/lib/util/ModelUtil'
import { customize } from '@/utils/utils'

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
    'form.dueDate'(val) {
      this.write({ dueDate: val })
    },
    'form.followUpDate'(val) {
      this.write({ followUpDate: val })
    },
    'form.priority'(val) {
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
      this.listenerLength = this.form.extensionElements?.values
        ?.filter(item => is(item, customize('TaskListener'))).length ?? 0
    }
  }
}
</script>
