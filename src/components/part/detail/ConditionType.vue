<template>
  <div>
    <el-form-item :label="$customTranslate('Condition Type')" prop="conditionType">
      <el-select v-model="form_.conditionType">
        <el-option :label="$customTranslate('Expression')" value="expression" />
        <el-option :label="$customTranslate('Script')" value="script" />
        <el-option label="" value="" />
      </el-select>
    </el-form-item>
    <FormItemInput v-if="showExpression" v-model="form_.expression" :label="$customTranslate('Expression')" prop="expression" />
    <template v-if="showScript">
      <FormItemInput v-model="form_.scriptFormat" :label="$customTranslate('Script Format')" prop="scriptFormat" />
      <el-form-item :label="$customTranslate('Script Type')" prop="scriptType">
        <el-select v-model="form_.scriptType">
          <el-option :label="$customTranslate('Inline Script')" value="inlineScript" />
          <el-option :label="$customTranslate('External Resource')" value="externalResource" />
        </el-select>
      </el-form-item>
      <FormItemTextArea v-if="!showResource" v-model="form_.script" :label="$customTranslate('Script')" prop="script" />
      <FormItemInput v-else v-model="form_.resource" :label="$customTranslate('Resource')" prop="resource" />
    </template>
  </div>
</template>
<script>
import FormItemInput from '@/components/ui/FormItemInput'
import FormItemTextArea from '@/components/ui/FormItemTextArea'
import areaHelper from '@/mixins/areaHelper'
import { isExpression, isScript, isResource } from '@/utils/helper'

export default {
  name: 'ConditionType',
  components: { FormItemInput, FormItemTextArea },
  mixins: [areaHelper],
  computed: {
    showExpression() {
      return isExpression(this.form_.conditionType)
    },
    showScript() {
      return isScript(this.form_.conditionType)
    },
    showResource() {
      return isResource(this.form_.scriptType)
    }
  },
  watch: {
    'form_.expression'(val) {
      const props = val ? this.moddle.create('bpmn:FormalExpression', { body: val }) : null
      this.write({ conditionExpression: props })
    },
    'form_.script'(val) {
      const props = val ? this.moddle.create('bpmn:FormalExpression', {
        body: this.form_.script,
        language: this.form_.scriptFormat
      }) : null
      this.write({ conditionExpression: props })
    },
    'form_.resource'(val) {
      const props = val ? this.moddle.create('bpmn:FormalExpression', {
        'camunda:resource': this.form_.resource,
        language: this.form_.scriptFormat
      }) : null
      this.write({ conditionExpression: props })
    },
    'form_.conditionType'() {
      if (this.showExpression && !this.showResource) {
        this.form_.scriptType = 'inlineScript'
      }
    }
  },
  created() {
    this.read()
  },
  methods: {
    read() {
      if (this.form.conditionExpression) {
        if (this.form.conditionExpression.language) {
          this.form_.conditionType = 'script'
          this.form_.scriptFormat = this.form.conditionExpression.language
          if (this.form.conditionExpression.body) {
            this.form_.script = this.form.conditionExpression.body
            this.form_.scriptType = 'inlineScript'
          } else {
            this.form_.resource = this.form.conditionExpression.resource
            this.form_.scriptType = 'externalResource'
          }
        } else {
          this.form_.conditionType = 'expression'
          this.form_.expression = this.form.conditionExpression.body
        }
      }
    }
  }
}
</script>
