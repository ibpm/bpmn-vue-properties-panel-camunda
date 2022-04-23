<!-- https://docs.camunda.org/manual/latest/reference/bpmn20/tasks/business-rule-task/ -->
<template>
  <Activity :element="element" :moddle="moddle" :bo="bo" @write="write">
    <template #detail>
      <FormItemInput
        v-if="propertyVisible('decisionRef')"
        v-model="bo.decisionRef"
        label="Decision Ref"
        prop="decisionRef"
      />
      <FormItemSelect
        v-if="propertyVisible('decisionRefBinding')"
        v-model="bo.decisionRefBinding"
        :options="bindings"
        label="Binding"
      />
      <FormItemInput
        v-if="propertyVisible('decisionRefVersion') && bo.decisionRefBinding === 'version'"
        v-model="bo.decisionRefVersion"
        label="Version"
        prop="decisionRefVersion"
      />
      <FormItemInput
        v-if="propertyVisible('decisionRefVersionTag') && bo.decisionRefBinding === 'versionTag'"
        v-model="bo.decisionRefVersionTag"
        label="Version Tag"
        prop="decisionRefVersionTag"
      />
      <FormItemInput
        v-if="propertyVisible('decisionRefTenantId')"
        v-model="bo.decisionRefTenantId"
        label="Tenant Id"
        prop="decisionRefTenantId"
      />
      <FormItemInput
        v-if="propertyVisible('resultVariable')"
        v-model="bo.resultVariable"
        label="Result Variable"
        prop="resultVariable"
      />
      <FormItemSelect
        v-if="propertyVisible('mapDecisionResult') && bo.resultVariable"
        v-model="bo.mapDecisionResult"
        :options="mapDecisionResults"
        label="Map Decision Result"
      />
    </template>
  </Activity>
</template>

<script>
import Activity from '../../embbed/Activity'
import FormItemInput from '../../ui/FormItemInput'
import FormItemSelect from '../../ui/FormItemSelect'
import elementHelper from '../../../mixins/elementHelper'
import { BINDINGS, MAP_DECISION_RESULTS } from '../../../utils/constants'

export default {
  name: 'BusinessRuleTask',
  components: {
    Activity,
    FormItemInput,
    FormItemSelect
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
