<template>
  <div>
    <Common :moddle="moddle" :form="form" @write="write">
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
    </Common>
    <TaskListener
      v-if="showListener"
      :moddle="moddle"
      :form="form"
      @write="write"
      @close="finishListener"
    />
  </div>
</template>

<script>
import Common from '@/components/embbed/Common'
import TaskListener from '@/components/part/listener/TaskListener'
import FormItemInput from '@/components/ui/FormItemInput'
import elementHelper from '@/mixins/elementHelper'
import { typeMatch } from '@/utils/helper'

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
  methods: {
    finishListener() {
      this.listenerLength = this.form.extensionElements?.values
        ?.filter(item => typeMatch(item.$type, 'TaskListener')).length ?? 0
      this.showListener = false
    }
  }
}
</script>
