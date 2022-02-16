<!-- https://docs.camunda.org/manual/latest/reference/bpmn20/tasks/business-rule-task/ -->
<template>
  <Activity :moddle="moddle" :form="form" @write="write">
    <template #detail>
      <FormItemInput v-model="form.decisionRef" :label="$customTranslate('Decision Ref')" prop="decisionRef" />
      <el-form-item :label="$customTranslate('Binding')" prop="decisionRefBinding">
        <el-select v-model="form.decisionRefBinding">
          <el-option
            v-for="(item, index) in bindings"
            :key="index"
            :label="$customTranslate(item)"
            :value="item"
          />
        </el-select>
      </el-form-item>
      <FormItemInput
        v-if="form.decisionRefBinding === 'version'"
        v-model="form.decisionRefVersion"
        :label="$customTranslate('Version')"
        prop="decisionRefVersion"
      />
      <FormItemInput
        v-if="form.decisionRefBinding === 'versionTag'"
        v-model="form.decisionRefVersionTag"
        :label="$customTranslate('Version Tag')"
        prop="decisionRefVersionTag"
      />
      <FormItemInput
        v-model="form.decisionRefTenantId"
        :label="$customTranslate('Tenant Id')"
        prop="decisionRefTenantId"
      />
      <FormItemInput v-model="form.resultVariable" :label="$customTranslate('Result Variable')" prop="resultVariable" />
      <el-form-item v-if="form.resultVariable" :label="$customTranslate('Map Decision Result')" prop="mapDecisionResult">
        <el-select v-model="form.mapDecisionResult">
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
import Activity from '@/components/embbed/Activity'
import FormItemInput from '@/components/ui/FormItemInput'
import elementHelper from '@/mixins/elementHelper'
import { BINDINGS, MAP_DECISION_RESULTS } from '@/utils/constants'

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
    'form.decisionRef'(val) {
      this.write({ decisionRef: val })
    },
    'form.decisionRefBinding'(val) {
      this.write({ decisionRefBinding: val })
    },
    'form.decisionRefVersion'(val) {
      this.write({ decisionRefVersion: val })
    },
    'form.decisionRefVersionTag'(val) {
      this.write({ decisionRefVersionTag: val })
    },
    'form.decisionRefTenantId'(val) {
      this.write({ decisionRefTenantId: val })
    },
    'form.resultVariable'(val) {
      if (!val) {
        this.write({ mapDecisionResult: undefined })
      }
      this.write({ resultVariable: val })
    },
    'form.mapDecisionResult'(val) {
      this.write({ mapDecisionResult: val })
    }
  }
}
</script>
