<!-- https://docs.camunda.org/manual/latest/reference/bpmn20/tasks/business-rule-task/ -->
<template>
  <Activity :moddle="moddle" :business-object="businessObject" :templates="templates" @write="write">
    <template #detail>
      <FormItemInput v-model="businessObject.decisionRef" :label="$customTranslate('Decision Ref')" prop="decisionRef" />
      <el-form-item :label="$customTranslate('Binding')" prop="decisionRefBinding">
        <el-select v-model="businessObject.decisionRefBinding">
          <el-option
            v-for="(item, index) in bindings"
            :key="index"
            :label="$customTranslate(item)"
            :value="item"
          />
        </el-select>
      </el-form-item>
      <FormItemInput
        v-if="businessObject.decisionRefBinding === 'version'"
        v-model="businessObject.decisionRefVersion"
        :label="$customTranslate('Version')"
        prop="decisionRefVersion"
      />
      <FormItemInput
        v-if="businessObject.decisionRefBinding === 'versionTag'"
        v-model="businessObject.decisionRefVersionTag"
        :label="$customTranslate('Version Tag')"
        prop="decisionRefVersionTag"
      />
      <FormItemInput
        v-model="businessObject.decisionRefTenantId"
        :label="$customTranslate('Tenant Id')"
        prop="decisionRefTenantId"
      />
      <FormItemInput v-model="businessObject.resultVariable" :label="$customTranslate('Result Variable')" prop="resultVariable" />
      <el-form-item v-if="businessObject.resultVariable" :label="$customTranslate('Map Decision Result')" prop="mapDecisionResult">
        <el-select v-model="businessObject.mapDecisionResult">
          <el-option
            v-for="(item, index) in mapDecisionResults"
            :key="index"
            :label="$customTranslate(item.name)"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
    </template>
  </Activity>
</template>

<script>
import Activity from '../../embbed/Activity'
import FormItemInput from '../../ui/FormItemInput'
import elementHelper from '../../../mixins/elementHelper'
import { BINDINGS, MAP_DECISION_RESULTS } from '../../../utils/constants'

export default {
  name: 'BusinessRuleTask',
  components: {
    Activity,
    FormItemInput
  },
  mixins: [elementHelper],
  data() {
    return {
      mapDecisionResults: MAP_DECISION_RESULTS,
      bindings: BINDINGS
    }
  },
  watch: {
    'businessObject.decisionRef'(val) {
      this.write({ decisionRef: val })
    },
    'businessObject.decisionRefBinding'(val) {
      this.write({ decisionRefBinding: val })
    },
    'businessObject.decisionRefVersion'(val) {
      this.write({ decisionRefVersion: val })
    },
    'businessObject.decisionRefVersionTag'(val) {
      this.write({ decisionRefVersionTag: val })
    },
    'businessObject.decisionRefTenantId'(val) {
      this.write({ decisionRefTenantId: val })
    },
    'businessObject.resultVariable'(val) {
      if (!val) {
        this.write({ mapDecisionResult: undefined })
      }
      this.write({ resultVariable: val })
    },
    'businessObject.mapDecisionResult'(val) {
      this.write({ mapDecisionResult: val })
    }
  }
}
</script>
