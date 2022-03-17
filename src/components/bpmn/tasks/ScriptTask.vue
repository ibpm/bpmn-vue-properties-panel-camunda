<!-- https://docs.camunda.org/manual/latest/reference/bpmn20/tasks/script-task/ -->
<template>
  <Activity :moddle="moddle" :business-object="businessObject" :templates="templates" @sync="sync" @write="write">
    <template #detail>
      <Condition v-model="businessObject" @update="update" />
    </template>
  </Activity>
</template>

<script>
import Activity from '../../embbed/Activity'
import Condition from '../../part/detail/Condition'
import elementHelper from '../../../mixins/elementHelper'
import { customize } from '../../../utils/utils'

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
      this.businessObject.conditionType = 'script'
      if ('script' in this.businessObject) {
        this.businessObject.scriptType = 'script'
        this.businessObject.config = this.businessObject.script
      } else if ('resource' in this.businessObject) {
        this.businessObject.scriptType = 'resource'
        this.businessObject.config = this.businessObject.resource
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
