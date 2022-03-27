<!-- https://docs.camunda.org/manual/latest/reference/bpmn20/tasks/script-task/ -->
<template>
  <Activity :moddle="moddle" :bo="bo" :templates="templates" @sync="sync" @write="write">
    <template #detail>
      <Condition v-model="bo" :condition-type="conditionType" @save-condition="writeCondition" />
    </template>
  </Activity>
</template>

<script>
import Activity from '../../embbed/Activity'
import Condition from '../../part/detail/Condition'
import elementHelper from '../../../mixins/elementHelper'
import { customize } from '../../../utils'

export default {
  name: 'ScriptTask',
  components: {
    Activity,
    Condition
  },
  mixins: [elementHelper],
  data() {
    return {
      conditionType: 'script'
    }
  },
  created() {
    this.sync()
  },
  methods: {
    sync() {
      if ('script' in this.bo) {
        this.bo.scriptType = 'script'
        this.bo.config = this.bo.script
      } else if ('resource' in this.bo) {
        this.bo.scriptType = 'resource'
        this.bo.config = this.bo.resource
      }
    },
    writeCondition(obj) {
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
