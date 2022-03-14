<!-- https://docs.camunda.org/manual/latest/reference/bpmn20/tasks/script-task/ -->
<template>
  <Activity :moddle="moddle" :form="form" :templates="templates" @sync="sync" @write="write">
    <template #detail>
      <Condition v-model="form" @update="update" />
    </template>
  </Activity>
</template>

<script>
import Activity from '@/components/embbed/Activity'
import Condition from '@/components/part/detail/Condition'
import elementHelper from '@/mixins/elementHelper'
import { customize } from '@/utils/utils'

export default {
  name: 'ScriptTask',
  components: {
    Activity,
    Condition
  },
  mixins: [elementHelper],
  created() {
    this.sync()
  },
  methods: {
    sync() {
      this.form.conditionType = 'script'
      if ('script' in this.form) {
        this.form.scriptType = 'script'
        this.form.config = this.form.script
      } else if ('resource' in this.form) {
        this.form.scriptType = 'resource'
        this.form.config = this.form.resource
      }
    },
    update(obj) {
      if (obj.scriptFormat) {
        this.write({
          scriptFormat: obj.scriptFormat,
          script: obj.script,
          [ customize('resource') ]: obj.resource
        })
      }
    }
  }
}
</script>
