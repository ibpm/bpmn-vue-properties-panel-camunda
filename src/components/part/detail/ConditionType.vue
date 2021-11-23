<template>
  <div>
    <el-form-item :label="$customTranslate('Condition Type')" prop="conditionType">
      <el-select v-model="form_.conditionType" @change="changeConditionType">
        <el-option :label="$customTranslate('Expression')" value="expression" />
        <el-option :label="$customTranslate('Script')" value="script" />
        <el-option label="" value="" />
      </el-select>
    </el-form-item>
    <el-form-item v-if="showExpression" :label="$customTranslate('Expression')" prop="expression">
      <el-input v-model="form_.expression" />
    </el-form-item>
    <template v-if="showScript">
      <el-form-item :label="$customTranslate('Script Format')" prop="scriptFormat">
        <el-input v-model="form_.scriptFormat" />
      </el-form-item>
      <el-form-item :label="$customTranslate('Script Type')" prop="scriptType">
        <el-select v-model="form_.scriptType" @change="changeScriptType">
          <el-option :label="$customTranslate('Inline Script')" value="inlineScript" />
          <el-option :label="$customTranslate('External Resource')" value="externalResource" />
        </el-select>
      </el-form-item>
      <el-form-item v-if="!showResource" :label="$customTranslate('Script')" prop="script">
        <el-input v-model="form_.script" />
      </el-form-item>
      <el-form-item v-else :label="$customTranslate('Resource')" prop="resource">
        <el-input v-model="form_.resource" />
      </el-form-item>
    </template>
  </div>
</template>
<script>
import areaHelper from '@/mixins/areaHelper'
import { isExpression, isScript, isResource } from '@/utils/helper'

export default {
  name: 'ConditionType',
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
  methods: {
    changeConditionType(val) {
      if (this.showExpression) {
        delete this.form_.script
        delete this.form_.resource
        delete this.form_.scriptType
        delete this.form_.scriptFormat
      } else if (this.showScript) {
        delete this.form_.expression
      } else {
        delete this.form_.script
        delete this.form_.resource
        delete this.form_.scriptType
        delete this.form_.scriptFormat
        delete this.form_.expression
      }
    },
    changeScriptType() {
      if (this.showResource) {
        delete this.form_.script
      } else {
        delete this.form_.resource
      }
    }
  }
}
</script>

<style scoped>

</style>
