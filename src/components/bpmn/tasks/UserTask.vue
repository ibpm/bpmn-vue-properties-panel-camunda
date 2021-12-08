<template>
  <div>
    <Common :moddle="moddle" :form="form" @write="write">
      <template #detail>
        <el-form-item :label="$customTranslate('Task Listener')">
          <el-badge :value="taskListenerLength">
            <el-button @click="dialogName = 'taskListenerDialog'">
              {{ $customTranslate('Update') }}
            </el-button>
          </el-badge>
        </el-form-item>
        <FormItemInput v-model="form.dueDate" :label="$customTranslate('Due Date')" prop="dueDate" />
        <FormItemInput v-model="form.followUpDate" :label="$customTranslate('Follow Up Date')" prop="followUpDate" />
        <FormItemInput v-model="form.priority" :label="$customTranslate('Priority')" prop="priority" />
      </template>
    </Common>
    <TaskListener v-if="dialogName === 'taskListenerDialog'" :moddle="moddle" :form="form" @close="finishTaskListener" />
  </div>
</template>

<script>
import Common from '@/components/embbed/Common'
import TaskListener from '@/components/part/listener/TaskListener'
import FormItemInput from '@/components/ui/FormItemInput'
import elementHelper from '@/mixins/elementHelper'

export default {
  name: 'UserTask',
  components: {
    Common,
    TaskListener,
    FormItemInput
  },
  mixins: [elementHelper],
  data() {
    return {
      dialogName: '',
      taskListenerLength: 0
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
  methods: {
    finishTaskListener() {
      this.computedTaskListenerLength()
      this.dialogName = ''
    },
    computedTaskListenerLength() {
      this.taskListenerLength = this.element.businessObject.extensionElements?.values
        ?.filter(item => item.$type.split(':')[1] === 'TaskListener').length ?? 0
    }
  }
}
</script>
