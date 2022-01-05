<!-- https://docs.camunda.org/manual/latest/reference/bpmn20/tasks/receive-task/ -->
<template>
  <Activity :moddle="moddle" :form="form" @write="write">
    <template #detail>
      <el-form-item :label="$customTranslate('Global Message referenced')" prop="messageRef">
        <el-select v-model="form.messageRef" filterable allow-create @visible-change="changeVisible">
          <el-option
            v-for="item in messages"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          >
            <span style="float: left">{{ item.name }}</span>
            <span style="float: right">
              <el-button type="danger" size="mini" icon="el-icon-delete" circle @click.stop="remove(item.id)" />
            </span>
          </el-option>
        </el-select>
      </el-form-item>
    </template>
  </Activity>
</template>

<script>
import Activity from '@/components/embbed/Activity'
import elementHelper from '@/mixins/elementHelper'
import { next } from '@/utils/tools'
import { getRoot, findRootElementsByType, getFlowElements } from '@/utils/helper'
import { BPMN_MESSAGE } from '@/utils/constants'
import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil'

export default {
  name: 'ReceiveTask',
  components: {
    Activity
  },
  mixins: [elementHelper],
  data() {
    return {
      messages: []
    }
  },
  watch: {
    'form.messageRef'(val) {
      if (!val) return
      let message = this.messages.find(item => item.id === val)
      if (!message) { // 新增下拉选项
        message = this.moddle.create(BPMN_MESSAGE, { id: next('message'), name: val })
        const root = getRoot(this.element)
        message.$parent = root
        root.rootElements = (root.rootElements || []).concat([message])
        this.messages.push(message)
      }
      this.write({ messageRef: message })
    }
  },
  methods: {
    remove(id) {
      let index = 0, name = null
      while (index < this.messages.length) {
        if (this.messages[index].id === id) {
          name = this.messages[index].name
          break
        }
        index++
      }
      if (this.form.messageRef === id || this.form.messageRef === name) {
        this.write({ messageRef: this.form.messageRef = null })
        this.delete(index, id)
        return
      }
      const
        receiveTasks = getFlowElements(getBusinessObject(this.element).$parent, 'bpmn:ReceiveTask'),
        task = receiveTasks.find(rt => getBusinessObject(rt).messageRef?.id === id)
      if (task) { // 如果是其他ReceiveTask的messageRef
        this.$message.warning(
          this.$customTranslate('Can not remove the message which used by other ReceiveTask:') +
          'activityId=' + task.id)
        return
      }
      this.delete(index, id)
    },
    delete(index, id) {
      const root = getRoot(this.element)
      root.rootElements = root.rootElements.filter(ele => ele.id !== id) // 移除对应id的Message
      this.messages.splice(index, 1)
    },
    changeVisible(show) {
      if (show) {
        this.messages = findRootElementsByType(this.element, BPMN_MESSAGE)
      }
    }
  }
}
</script>
