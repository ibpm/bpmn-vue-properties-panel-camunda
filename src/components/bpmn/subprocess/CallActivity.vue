<!-- https://docs.camunda.org/manual/latest/reference/bpmn20/subprocesses/call-activity/ -->
<template>
  <div>
    <Activity :element="element" :moddle="moddle" :bo="bo" @sync="sync" @write="write">
      <template #detail>
        <FormItemInput
          v-if="propertyVisible('calledElement')"
          v-model="bo.calledElement"
          label="Called Element"
          prop="calledElement"
          :rules="[{ required: true, message: $customTranslate('Must provide a value'), trigger: 'blur' }]"
        />
        <FormItemSelect
          v-if="propertyVisible('calledElementBinding')"
          v-model="bo.calledElementBinding"
          :options="bindings"
          label="Binding"
        />
        <FormItemInput
          v-if="propertyVisible('calledElementVersion') && bo.calledElementBinding === 'version'"
          v-model="bo.calledElementVersion"
          label="Version"
        />
        <FormItemInput
          v-if="propertyVisible('calledElementVersionTag') && bo.calledElementBinding === 'versionTag'"
          v-model="bo.calledElementVersionTag"
          label="Version Tag"
        />
        <FormItemInput
          v-if="propertyVisible('calledElementTenantId')"
          v-model="bo.calledElementTenantId"
          label="Tenant Id"
        />
        <FormItemInput
          v-if="propertyVisible('businessKeyExpression')"
          v-model="businessKeyExpression"
          label="Business Key Expression"
        />
        <FormItemSelect
          v-if="propertyVisible('delegateVariableMapping')"
          v-model="delegateVariableMapping"
          :options="variableMappings"
          label="Delegate Variable Mapping"
        />
        <FormItemInput
          v-if="propertyVisible('variableMapping')"
          v-model="variableMapping"
          :label="delegateVariableMapping === 'variableMappingDelegateExpression' ? 'Delegate Expression' : 'Class'"
        />
        <el-form-item :label="$customTranslate('Variables')">
          <el-badge :value="variableLength">
            <el-button @click="showVariable = true">
              {{ $customTranslate('Update') }}
            </el-button>
          </el-badge>
        </el-form-item>
      </template>
    </Activity>
    <Variable v-if="showVariable" :moddle="moddle" :bo="bo" @write="write" @close="finishVariable" />
  </div>
</template>

<script>
import Activity from '../../embbed/Activity'
import Variable from '../../part/detail/Variable'
import FormItemInput from '../../ui/FormItemInput'
import FormItemSelect from '../../ui/FormItemSelect'
import elementHelper from '../../../mixins/elementHelper'
import { BINDINGS, VARIABLE_MAPPINGS } from '../../../utils/constants'
import { is } from 'bpmn-js/lib/util/ModelUtil'
import { addAndRemoveElementsFromExtensionElements, createCamundaInWithBusinessKey } from '../../../utils/creators'
import { customize } from '../../../utils'

export default {
  name: 'CallActivity',
  components: {
    Activity,
    Variable,
    FormItemInput,
    FormItemSelect
  },
  mixins: [elementHelper],
  data() {
    return {
      bindings: BINDINGS,
      variableMappings: VARIABLE_MAPPINGS,
      showVariable: false,
      variableLength: 0,
      businessKeyExpression: '#{execution.processBusinessKey}',
      delegateVariableMapping: null,
      variableMapping: null
    }
  },
  watch: {
    'bo.callActivityType'() {
      this.updateCalledElement(this.bo.calledElement)
      this.updateCalledElementBinding(this.bo.calledElementBinding)
      this.updateCalledElementVersion(this.bo.calledElementVersion)
      this.updateCalledElementTenantId(this.bo.calledElementTenantId)
      this.updateCalledElementVersionTag(this.bo.calledElementVersionTag)
      this.updateVariableMapping(this.delegateVariableMapping, this.variableMapping)
    },
    'bo.calledElement'() {
      this.updateCalledElement(this.bo.calledElement)
    },
    'bo.calledElementBinding'() {
      this.updateCalledElementBinding(this.bo.calledElementBinding)
    },
    'bo.calledElementVersion'() {
      this.updateCalledElementVersion(this.bo.calledElementVersion)
    },
    'bo.calledElementVersionTag'() {
      this.updateCalledElementVersionTag(this.bo.calledElementVersionTag)
    },
    'bo.calledElementTenantId'() {
      this.updateCalledElementTenantId(this.bo.calledElementTenantId)
    },
    'businessKeyExpression'(val) {
      const
        matcher = item => !(is(item, customize('In')) && 'businessKey' in item),
        objectsToAdd = val ? [createCamundaInWithBusinessKey(this.moddle, undefined, val)] : undefined
      this.write({ extensionElements:
          this.bo.extensionElements = addAndRemoveElementsFromExtensionElements(this.moddle, this.bo, objectsToAdd, matcher)
      })
    },
    'delegateVariableMapping'() {
      this.updateVariableMapping(this.delegateVariableMapping, this.variableMapping)
    },
    'variableMapping'() {
      this.updateVariableMapping(this.delegateVariableMapping, this.variableMapping)
    }
  },
  created() {
    this.sync()
  },
  methods: {
    sync() {
      this.computeLength()
      this.businessKeyExpression = this.bo.extensionElements?.values?.find(
        item => is(item, customize('In')) && 'businessKey' in item)?.businessKey || '#{execution.processBusinessKey}'
      if ('variableMappingClass' in this.bo) {
        this.delegateVariableMapping = 'variableMappingClass'
        this.variableMapping = this.bo.variableMappingClass
      } else if ('variableMappingDelegateExpression' in this.bo) {
        this.delegateVariableMapping = 'variableMappingDelegateExpression'
        this.variableMapping = this.bo.variableMappingDelegateExpression
      }
    },
    updateCalledElement(val) {
      this.write({ calledElement: val })
    },
    updateCalledElementBinding(val) {
      this.write({ calledElementBinding: val })
    },
    updateCalledElementVersion(val) {
      this.write({ calledElementVersion: val })
    },
    updateCalledElementVersionTag(val) {
      this.write({ calledElementVersionTag: val })
    },
    updateCalledElementTenantId(val) {
      this.write({ calledElementTenantId: val })
    },
    updateVariableMapping(delegateVariableMapping, variableMapping) {
      if (delegateVariableMapping) {
        this.write({ [delegateVariableMapping]: variableMapping })
      }
    },
    finishVariable() {
      this.computeLength()
      this.showVariable = false
    },
    computeLength() {
      this.variableLength = this.bo.extensionElements?.values
        ?.filter(item => (is(item, customize('In')) && !('businessKey' in item)) || is(item, customize('Out'))).length ?? 0
    }
  }
}
</script>
