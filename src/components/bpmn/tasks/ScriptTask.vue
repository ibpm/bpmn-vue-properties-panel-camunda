<template>
  <Activity :moddle="moddle" :form="form" @write="write">
    <template #detail>
      <Condition :form="form" @writeSub="writeSub" />
    </template>
  </Activity>
</template>

<script>
import Activity from '@/components/embbed/Activity'
import Condition from '@/components/part/detail/Condition'
import elementHelper from '@/mixins/elementHelper'
import { customize } from '@/utils/helper'

export default {
  name: 'ScriptTask',
  components: {
    Activity,
    Condition
  },
  mixins: [elementHelper],
  created() {
    this.readSub()
  },
  methods: {
    readSub() {
      this.form.conditionType = 'script'
      if ('script' in this.form) {
        this.form.scriptType = 'script'
        this.form.config = this.form.script
      } else if ('resource' in this.form) {
        this.form.scriptType = 'resource'
        this.form.config = this.form.resource
      }
    },
    writeSub(obj) {
      if (obj.scriptFormat) {
        if ('script' in obj && obj.script) {
          this.write({
            scriptFormat: obj.scriptFormat,
            script: obj.script,
            [ customize('resource') ]: null
          })
        } else if ('resource' in obj && obj.resource) {
          this.write({
            scriptFormat: obj.scriptFormat,
            script: null,
            [ customize('resource') ]: obj.resource
          })
        }
      }
    }
  }
}
</script>
