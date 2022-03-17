<!-- https://docs.camunda.org/manual/latest/reference/bpmn20/subprocesses/call-activity/ -->
<template>
  <div>
    <Activity :moddle="moddle" :business-object="businessObject" :templates="templates" @sync="sync" @write="write">
      <template #detail>
        <el-form-item :label="$customTranslate('CallActivity Type')">
          <el-select v-model="businessObject.callActivityType">
            <el-option
              v-for="(item, index) in callActivityTypes"
              :key="index"
              :label="$customTranslate(item)"
              :value="item"
            />
          </el-select>
        </el-form-item>
        <FormItemInput
          v-model="businessObject.calledRef"
          :label="$customTranslate(isCMMN ? 'Case Ref' : 'Called Element')"
          prop="calledRef"
          :rules="[{ required: true, message: $customTranslate('Must provide a value'), trigger: 'blur' }]"
        />
        <el-form-item :label="$customTranslate('Binding')">
          <el-select v-model="businessObject.calledBinding">
            <el-option
              v-for="(item, index) in (isCMMN ? bindingsCmmn : bindings)"
              :key="index"
              :label="$customTranslate(item)"
              :value="item"
            />
          </el-select>
        </el-form-item>
        <FormItemInput
          v-if="businessObject.calledBinding === 'version'"
          v-model="businessObject.calledVersion"
          :label="$customTranslate('Version')"
        />
        <FormItemInput
          v-if="businessObject.calledBinding === 'versionTag'"
          v-model="businessObject.calledElementVersionTag"
          :label="$customTranslate('Version Tag')"
        />
        <FormItemInput
          v-model="businessObject.calledTenantId"
          :label="$customTranslate('Tenant Id')"
        />
        <FormItemInput
          v-model="businessObject.businessKeyExpression"
          :label="$customTranslate('Business Key Expression')"
          placeholder="#{execution.processBusinessKey}"
        />
        <template v-if="!isCMMN">
          <el-form-item :label="$customTranslate('Delegate Variable Mapping')">
            <el-select v-model="businessObject.delegateVariableMapping">
              <el-option
                v-for="(item, index) in variableMappings"
                :key="index"
                :label="$customTranslate(item)"
                :value="item"
              />
            </el-select>
          </el-form-item>
          <FormItemInput
            v-model="businessObject.variableMapping"
            :label="$customTranslate(businessObject.delegateVariableMapping === 'variableMappingDelegateExpression' ? 'Delegate Expression' : 'Class')"
          />
        </template>
        <el-form-item :label="$customTranslate('Variables')">
          <el-badge :value="variableLength">
            <el-button @click="showVariable = true">
              {{ $customTranslate('Update') }}
            </el-button>
          </el-badge>
        </el-form-item>
      </template>
    </Activity>
    <Variable v-if="showVariable" :moddle="moddle" :business-object="businessObject" @close="finishVariable" />
  </div>
</template>

<script>
import Activity from '../../embbed/Activity'
import Variable from '../../part/detail/Variable'
import FormItemInput from '../../ui/FormItemInput'
import elementHelper from '../../../mixins/elementHelper'
import { CALL_ACTIVITY_TYPES, BINDINGS, BINDINGS_CMMN, VARIABLE_MAPPINGS } from '../../../utils/constants'
import { is } from 'bpmn-js/lib/util/ModelUtil'
import { addAndRemoveElementsFromExtensionElements, createCamundaInWithBusinessKey } from '../../../utils/creators'
import { customize } from '../../../utils/utils'

export default {
  name: 'CallActivity',
  components: {
    Activity,
    Variable,
    FormItemInput
  },
  mixins: [elementHelper],
  data() {
    return {
      callActivityTypes: CALL_ACTIVITY_TYPES,
      bindings: BINDINGS,
      bindingsCmmn: BINDINGS_CMMN,
      variableMappings: VARIABLE_MAPPINGS,
      showVariable: false,
      variableLength: 0
    }
  },
  computed: {
    isCMMN() {
      return this.businessObject.callActivityType === 'CMMN'
    }
  },
  watch: {
    'businessObject.callActivityType'() {
      this.updateCalledRef(this.businessObject.calledRef)
      this.updateCalledBinding(this.businessObject.calledBinding)
      this.updateCalledVersion(this.businessObject.calledVersion)
      this.updateCalledTenantId(this.businessObject.calledTenantId)
      this.updateCalledElementVersionTag(this.businessObject.calledElementVersionTag)
      this.updateVariableMapping(this.businessObject.delegateVariableMapping, this.businessObject.variableMapping)
    },
    'businessObject.calledRef'() {
      this.updateCalledRef(this.businessObject.calledRef)
    },
    'businessObject.calledBinding'() {
      this.updateCalledBinding(this.businessObject.calledBinding)
    },
    'businessObject.calledVersion'() {
      this.updateCalledVersion(this.businessObject.calledVersion)
    },
    'businessObject.calledElementVersionTag'() {
      this.updateCalledElementVersionTag(this.businessObject.calledElementVersionTag)
    },
    'businessObject.calledTenantId'() {
      this.updateCalledTenantId(this.businessObject.calledTenantId)
    },
    'businessObject.businessKeyExpression'(val) {
      const
        matcher = item => !(is(item, customize('In')) && 'businessKey' in item),
        objectsToAdd = val ? [createCamundaInWithBusinessKey(this.moddle, undefined, val)] : undefined
      this.businessObject.extensionElements = addAndRemoveElementsFromExtensionElements(this.moddle, this.businessObject, objectsToAdd, matcher)
    },
    'businessObject.delegateVariableMapping'() {
      this.updateVariableMapping(this.businessObject.delegateVariableMapping, this.businessObject.variableMapping)
    },
    'businessObject.variableMapping'() {
      this.updateVariableMapping(this.businessObject.delegateVariableMapping, this.businessObject.variableMapping)
    }
  },
  created() {
    this.sync()
  },
  methods: {
    sync() {
      this.computeLength()
      if (!this.businessObject.caseRef && !this.businessObject.calledElement) {
        // this.businessObject.businessKeyExpression = '#{execution.processBusinessKey}'
        return
      }
      this.businessObject.callActivityType = this.businessObject.caseRef ? 'CMMN' : 'BPMN'
      this.businessObject.calledRef = this.businessObject.caseRef ? this.businessObject.caseRef : this.businessObject.calledElement
      this.businessObject.calledBinding = this.businessObject.caseRef ? this.businessObject.caseBinding : this.businessObject.calledElementBinding
      this.businessObject.calledVersion = this.businessObject.caseRef ? this.businessObject.caseVersion : this.businessObject.calledElementVersion
      this.businessObject.calledTenantId = this.businessObject.caseRef ? this.businessObject.caseTenantId : this.businessObject.calledElementTenantId
      this.businessObject.businessKeyExpression = this.businessObject
        .extensionElements?.values?.find(item => is(item, customize('In')) && 'businessKey' in item)?.businessKey
      if (this.businessObject.calledElement) {
        if ('variableMappingClass' in this.businessObject) {
          this.businessObject.delegateVariableMapping = 'variableMappingClass'
          this.businessObject.variableMapping = this.businessObject.variableMappingClass
        } else if ('variableMappingDelegateExpression' in this.businessObject) {
          this.businessObject.delegateVariableMapping = 'variableMappingDelegateExpression'
          this.businessObject.variableMapping = this.businessObject.variableMappingDelegateExpression
        }
      }
    },
    updateCalledRef(val) {
      let calledElement, caseRef
      if (this.isCMMN) {
        caseRef = val
      } else {
        calledElement = val
      }
      this.write({ calledElement: calledElement, caseRef: caseRef })
    },
    updateCalledBinding(val) {
      let calledElementBinding, caseBinding
      if (this.isCMMN) {
        caseBinding = val
      } else {
        calledElementBinding = val
      }
      this.write({ calledElementBinding: calledElementBinding, caseBinding: caseBinding })
    },
    updateCalledVersion(val) {
      let calledElementVersion, caseVersion
      if (this.isCMMN) {
        caseVersion = val
      } else {
        calledElementVersion = val
      }
      this.write({ calledElementVersion: calledElementVersion, caseVersion: caseVersion })
    },
    updateCalledElementVersionTag(val) {
      this.write({ calledElementVersionTag: this.isCMMN ? undefined : val })
    },
    updateCalledTenantId(val) {
      let calledElementTenantId, caseTenantId
      if (this.isCMMN) {
        caseTenantId = val
      } else {
        calledElementTenantId = val
      }
      this.write({ calledElementTenantId: calledElementTenantId, caseTenantId: caseTenantId })
    },
    updateVariableMapping(delegateVariableMapping, variableMapping) {
      if (delegateVariableMapping) {
        this.write({ [delegateVariableMapping]: this.isCMMN ? undefined : variableMapping })
      }
    },
    finishVariable() {
      this.computeLength()
      this.showVariable = false
    },
    computeLength() {
      this.variableLength = this.businessObject.extensionElements?.values
        ?.filter(item => (is(item, customize('In')) && !('businessKey' in item)) || is(item, customize('Out'))).length ?? 0
    }
  }
}
</script>
