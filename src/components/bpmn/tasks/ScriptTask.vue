<!-- https://docs.camunda.org/manual/latest/reference/bpmn20/tasks/script-task/ -->
<template>
  <Activity :element="element" :moddle="moddle" :bo="bo" @sync="sync" @write="write">
    <template #detail>
      <Condition
        v-if="conditionVisible"
        v-model="bo"
        :condition-type="conditionType"
        @save-condition="writeCondition"
      />
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
  computed: {
    conditionVisible() {
      return this.propertyVisible('conditionExpression')
    }
  },
  created() {
    this.sync()
  },
  methods: {
    sync() {
      if ('resource' in this.bo) {
        this.bo.scriptType = 'resource'
        this.bo.config = this.bo.resource
      } else {
        this.bo.scriptType = 'script'
        this.bo.config = this.bo.script
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
