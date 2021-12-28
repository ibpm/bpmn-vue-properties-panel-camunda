<!-- https://docs.camunda.org/manual/latest/reference/bpmn20/tasks/business-rule-task/ -->
<template>
  <Activity :moddle="moddle" :form="form" @write="write">
    <template #detail>
      <FormItemInput v-model="form.decisionRef" :label="$customTranslate('Decision Ref')" prop="decisionRef" />
      <el-form-item :label="$customTranslate('Binding')" prop="binding">
        <el-select v-model="form.binding">
          <el-option :label="$customTranslate('latest')" value="latest" />
          <el-option :label="$customTranslate('deployment')" value="deployment" />
          <el-option :label="$customTranslate('version')" value="version" />
          <el-option :label="$customTranslate('versionTag')" value="versionTag" />
        </el-select>
        <FormItemInput v-model="form.tenantId" :label="$customTranslate('Tenant Id')" prop="tenantId" />
        <FormItemInput v-model="form.resultVariable" :label="$customTranslate('Result Variable')" prop="resultVariable" />
      </el-form-item>
    </template>
  </Activity>
</template>

<script>
import Activity from '@/components/embbed/Activity'
import FormItemInput from '@/components/ui/FormItemInput'
import elementHelper from '@/mixins/elementHelper'
import { customize } from '@/utils/helper'

export default {
  name: 'BusinessRuleTask',
  components: {
    Activity,
    FormItemInput
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
