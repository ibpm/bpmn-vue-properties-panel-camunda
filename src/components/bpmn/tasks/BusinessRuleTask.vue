<!-- https://docs.camunda.org/manual/latest/reference/bpmn20/tasks/business-rule-task/ -->
<template>
  <Activity :element="element" :moddle="moddle" :bo="bo" :templates="templates" @write="write">
    <template #detail>
      <FormItemInput v-model="bo.decisionRef" :label="$customTranslate('Decision Ref')" prop="decisionRef" />
      <el-form-item :label="$customTranslate('Binding')" prop="decisionRefBinding">
        <el-select v-model="bo.decisionRefBinding">
          <el-option
            v-for="(item, index) in bindings"
            :key="index"
            :label="$customTranslate(item)"
            :value="item"
          />
        </el-select>
      </el-form-item>
      <FormItemInput
        v-if="bo.decisionRefBinding === 'version'"
        v-model="bo.decisionRefVersion"
        :label="$customTranslate('Version')"
        prop="decisionRefVersion"
      />
      <FormItemInput
        v-if="bo.decisionRefBinding === 'versionTag'"
        v-model="bo.decisionRefVersionTag"
        :label="$customTranslate('Version Tag')"
        prop="decisionRefVersionTag"
      />
      <FormItemInput
        v-model="bo.decisionRefTenantId"
        :label="$customTranslate('Tenant Id')"
        prop="decisionRefTenantId"
      />
      <FormItemInput v-model="bo.resultVariable" :label="$customTranslate('Result Variable')" prop="resultVariable" />
      <el-form-item v-if="bo.resultVariable" :label="$customTranslate('Map Decision Result')" prop="mapDecisionResult">
        <el-select v-model="bo.mapDecisionResult">
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
    'bo.decisionRef'(val) {
      this.write({ decisionRef: val })
    },
    'bo.decisionRefBinding'(val) {
      this.write({ decisionRefBinding: val })
    },
    'bo.decisionRefVersion'(val) {
      this.write({ decisionRefVersion: val })
    },
    'bo.decisionRefVersionTag'(val) {
      this.write({ decisionRefVersionTag: val })
    },
    'bo.decisionRefTenantId'(val) {
      this.write({ decisionRefTenantId: val })
    },
    'bo.resultVariable'(val) {
      if (!val) {
        this.write({ mapDecisionResult: undefined })
      }
      this.write({ resultVariable: val })
    },
    'bo.mapDecisionResult'(val) {
      this.write({ mapDecisionResult: val })
    }
  }
}
</script>
