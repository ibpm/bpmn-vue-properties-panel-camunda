<!-- https://docs.camunda.org/manual/latest/reference/bpmn20/subprocesses/call-activity/ -->
<template>
  <div>
    <Activity :element="element" :moddle="moddle" :bo="bo" @sync="sync" @write="write">
      <template #detail>
        <el-form-item :label="$customTranslate('CallActivity Type')">
          <el-select v-model="bo.callActivityType">
            <el-option
              v-for="(item, index) in callActivityTypes"
              :key="index"
              :label="$customTranslate(item)"
              :value="item"
            />
          </el-select>
        </el-form-item>
        <FormItemInput
          v-model="bo.calledRef"
          :label="$customTranslate(isCMMN ? 'Case Ref' : 'Called Element')"
          prop="calledRef"
          :rules="[{ required: true, message: $customTranslate('Must provide a value'), trigger: 'blur' }]"
        />
        <el-form-item :label="$customTranslate('Binding')">
          <el-select v-model="bo.calledBinding">
            <el-option
              v-for="(item, index) in (isCMMN ? bindingsCmmn : bindings)"
              :key="index"
              :label="$customTranslate(item)"
              :value="item"
            />
          </el-select>
        </el-form-item>
        <FormItemInput
          v-if="bo.calledBinding === 'version'"
          v-model="bo.calledVersion"
          :label="$customTranslate('Version')"
        />
        <FormItemInput
          v-if="bo.calledBinding === 'versionTag'"
          v-model="bo.calledElementVersionTag"
          :label="$customTranslate('Version Tag')"
        />
        <FormItemInput
          v-model="bo.calledTenantId"
          :label="$customTranslate('Tenant Id')"
        />
        <FormItemInput
          v-model="bo.businessKeyExpression"
          :label="$customTranslate('Business Key Expression')"
          placeholder="#{execution.processBusinessKey}"
        />
        <template v-if="!isCMMN">
          <el-form-item :label="$customTranslate('Delegate Variable Mapping')">
            <el-select v-model="bo.delegateVariableMapping">
              <el-option
                v-for="(item, index) in variableMappings"
                :key="index"
                :label="$customTranslate(item)"
                :value="item"
              />
            </el-select>
          </el-form-item>
          <FormItemInput
            v-model="bo.variableMapping"
            :label="$customTranslate(bo.delegateVariableMapping === 'variableMappingDelegateExpression' ? 'Delegate Expression' : 'Class')"
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
    <Variable v-if="showVariable" :moddle="moddle" :bo="bo" @write="write" @close="finishVariable" />
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
import { customize } from '../../../utils'

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
      return this.bo.callActivityType === 'CMMN'
    }
  },
  watch: {
    'bo.callActivityType'() {
      this.updateCalledRef(this.bo.calledRef)
      this.updateCalledBinding(this.bo.calledBinding)
      this.updateCalledVersion(this.bo.calledVersion)
      this.updateCalledTenantId(this.bo.calledTenantId)
      this.updateCalledElementVersionTag(this.bo.calledElementVersionTag)
      this.updateVariableMapping(this.bo.delegateVariableMapping, this.bo.variableMapping)
    },
    'bo.calledRef'() {
      this.updateCalledRef(this.bo.calledRef)
    },
    'bo.calledBinding'() {
      this.updateCalledBinding(this.bo.calledBinding)
    },
    'bo.calledVersion'() {
      this.updateCalledVersion(this.bo.calledVersion)
    },
    'bo.calledElementVersionTag'() {
      this.updateCalledElementVersionTag(this.bo.calledElementVersionTag)
    },
    'bo.calledTenantId'() {
      this.updateCalledTenantId(this.bo.calledTenantId)
    },
    'bo.businessKeyExpression'(val) {
      const
        matcher = item => !(is(item, customize('In')) && 'businessKey' in item),
        objectsToAdd = val ? [createCamundaInWithBusinessKey(this.moddle, undefined, val)] : undefined
      this.write({ extensionElements:
          this.bo.extensionElements = addAndRemoveElementsFromExtensionElements(this.moddle, this.bo, objectsToAdd, matcher)
      })
    },
    'bo.delegateVariableMapping'() {
      this.updateVariableMapping(this.bo.delegateVariableMapping, this.bo.variableMapping)
    },
    'bo.variableMapping'() {
      this.updateVariableMapping(this.bo.delegateVariableMapping, this.bo.variableMapping)
    }
  },
  created() {
    this.sync()
  },
  methods: {
    sync() {
      this.computeLength()
      if (!this.bo.caseRef && !this.bo.calledElement) {
        // this.bo.businessKeyExpression = '#{execution.processBusinessKey}'
        return
      }
      this.bo.callActivityType = this.bo.caseRef ? 'CMMN' : 'BPMN'
      this.bo.calledRef = this.bo.caseRef ? this.bo.caseRef : this.bo.calledElement
      this.bo.calledBinding = this.bo.caseRef ? this.bo.caseBinding : this.bo.calledElementBinding
      this.bo.calledVersion = this.bo.caseRef ? this.bo.caseVersion : this.bo.calledElementVersion
      this.bo.calledTenantId = this.bo.caseRef ? this.bo.caseTenantId : this.bo.calledElementTenantId
      this.bo.businessKeyExpression = this.bo
        .extensionElements?.values?.find(item => is(item, customize('In')) && 'businessKey' in item)?.businessKey
      if (this.bo.calledElement) {
        if ('variableMappingClass' in this.bo) {
          this.bo.delegateVariableMapping = 'variableMappingClass'
          this.bo.variableMapping = this.bo.variableMappingClass
        } else if ('variableMappingDelegateExpression' in this.bo) {
          this.bo.delegateVariableMapping = 'variableMappingDelegateExpression'
          this.bo.variableMapping = this.bo.variableMappingDelegateExpression
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
      this.variableLength = this.bo.extensionElements?.values
        ?.filter(item => (is(item, customize('In')) && !('businessKey' in item)) || is(item, customize('Out'))).length ?? 0
    }
  }
}
</script>
