<template>
  <Base :form="form" @serialize="serialize">
    <template v-if="visible" #custom>
      <el-form-item :label="$customTranslate('Expression')" prop="expression">
        <el-input v-model="form.expression" />
      </el-form-item>
      <!--
      <el-form-item :label="$customTranslate('Condition Type')" prop="conditionType">
        <el-select v-model="form.conditionType">
          <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item v-if="showExpression" :label="$customTranslate('Expression')" prop="expression">
        <el-input v-model="form.expression" />
      </el-form-item>
      <template v-if="showScript">
        <el-form-item :label="$customTranslate('Script Format')" prop="scriptFormat">
          <el-input v-model="form.scriptFormat" />
        </el-form-item>
        <el-form-item :label="$customTranslate('Script Type')" prop="scriptType">
          <el-select v-model="form.scriptType" @change="changeScriptType">
            <el-option :label="$customTranslate('Inline Script')" value="inlineScript" />
            <el-option :label="$customTranslate('External Resource')" value="externalResource" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="!showResource" :label="$customTranslate('Script')" prop="script">
          <el-input v-model="form.script" />
        </el-form-item>
        <el-form-item v-else :label="$customTranslate('Resource')" prop="resource">
          <el-input v-model="form.resource" />
        </el-form-item>
      </template> -->
      <!-- <ConditionType :form="form" /> -->
    </template>
  </Base>
</template>

<script>
import Base from '@/components/embbed/Base'
import ConditionType from '@/components/part/detail/ConditionType'
import elementHelper from '@/mixins/elementHelper'
import { isConditionalSource, isExpression, isResource, isScript } from '@/utils/helper'

export default {
  name: 'SequenceFlow',
  components: {
    Base,
    ConditionType
  },
  mixins: [elementHelper],
  computed: {
    visible() {
      return isConditionalSource(this.element.source)
    },
    showExpression() {
      return isExpression(this.form.conditionType)
    },
    showScript() {
      return isScript(this.form.conditionType)
    },
    showResource() {
      return isResource(this.form.scriptType)
    }
  },
  methods: {
    changeConditionType(val) {
      if (this.showExpression) {
        delete this.form.script
        delete this.form.resource
        delete this.form.scriptType
        delete this.form.scriptFormat
      } else if (this.showScript) {
        delete this.form.expression
      } else {
        delete this.form.script
        delete this.form.resource
        delete this.form.scriptType
        delete this.form.scriptFormat
        delete this.form.expression
      }
    },
    changeScriptType() {
      if (this.showResource) {
        delete this.form.script
      } else {
        delete this.form.resource
      }
    }
  }
}
</script>

<style scoped>

</style>
