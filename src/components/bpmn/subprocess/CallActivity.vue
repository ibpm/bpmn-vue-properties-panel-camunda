<!-- https://docs.camunda.org/manual/latest/reference/bpmn20/subprocesses/call-activity/ -->
<template>
  <div>
    <Activity :moddle="moddle" :form="form" :templates="templates" @sync="sync" @write="write">
      <template #detail>
        <el-form-item :label="$customTranslate('CallActivity Type')">
          <el-select v-model="form.callActivityType">
            <el-option
              v-for="(item, index) in callActivityTypes"
              :key="index"
              :label="$customTranslate(item)"
              :value="item"
            />
          </el-select>
        </el-form-item>
        <FormItemInput
          v-model="form.calledRef"
          :label="$customTranslate(isCMMN ? 'Case Ref' : 'Called Element')"
          prop="calledRef"
          :rules="[{ required: true, message: $customTranslate('Must provide a value'), trigger: 'blur' }]"
        />
        <el-form-item :label="$customTranslate('Binding')">
          <el-select v-model="form.calledBinding">
            <el-option
              v-for="(item, index) in (isCMMN ? bindingsCmmn : bindings)"
              :key="index"
              :label="$customTranslate(item)"
              :value="item"
            />
          </el-select>
        </el-form-item>
        <FormItemInput
          v-if="form.calledBinding === 'version'"
          v-model="form.calledVersion"
          :label="$customTranslate('Version')"
        />
        <FormItemInput
          v-if="form.calledBinding === 'versionTag'"
          v-model="form.calledElementVersionTag"
          :label="$customTranslate('Version Tag')"
        />
        <FormItemInput
          v-model="form.calledTenantId"
          :label="$customTranslate('Tenant Id')"
        />
        <FormItemInput
          v-model="form.businessKeyExpression"
          :label="$customTranslate('Business Key Expression')"
          placeholder="#{execution.processBusinessKey}"
        />
        <template v-if="!isCMMN">
          <el-form-item :label="$customTranslate('Delegate Variable Mapping')">
            <el-select v-model="form.delegateVariableMapping">
              <el-option
                v-for="(item, index) in variableMappings"
                :key="index"
                :label="$customTranslate(item)"
                :value="item"
              />
            </el-select>
          </el-form-item>
          <FormItemInput
            v-model="form.variableMapping"
            :label="$customTranslate(form.delegateVariableMapping === 'variableMappingDelegateExpression' ? 'Delegate Expression' : 'Class')"
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
    <Variable v-if="showVariable" :moddle="moddle" :form="form" @close="finishVariable" />
  </div>
</template>

<script>
import Activity from '@/components/embbed/Activity'
import Variable from '@/components/part/detail/Variable'
import FormItemInput from '@/components/ui/FormItemInput'
import elementHelper from '@/mixins/elementHelper'
import { CALL_ACTIVITY_TYPES, BINDINGS, BINDINGS_CMMN, VARIABLE_MAPPINGS } from '@/utils/constants'
import { is } from 'bpmn-js/lib/util/ModelUtil'
import { addAndRemoveElementsFromExtensionElements, createCamundaInWithBusinessKey } from '@/utils/creators'
import { customize } from '@/utils/utils'

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
      return this.form.callActivityType === 'CMMN'
    }
  },
  watch: {
    'form.callActivityType'() {
      this.updateCalledRef(this.form.calledRef)
      this.updateCalledBinding(this.form.calledBinding)
      this.updateCalledVersion(this.form.calledVersion)
      this.updateCalledTenantId(this.form.calledTenantId)
      this.updateCalledElementVersionTag(this.form.calledElementVersionTag)
      this.updateVariableMapping(this.form.delegateVariableMapping, this.form.variableMapping)
    },
    'form.calledRef'() {
      this.updateCalledRef(this.form.calledRef)
    },
    'form.calledBinding'() {
      this.updateCalledBinding(this.form.calledBinding)
    },
    'form.calledVersion'() {
      this.updateCalledVersion(this.form.calledVersion)
    },
    'form.calledElementVersionTag'() {
      this.updateCalledElementVersionTag(this.form.calledElementVersionTag)
    },
    'form.calledTenantId'() {
      this.updateCalledTenantId(this.form.calledTenantId)
    },
    'form.businessKeyExpression'(val) {
      const
        matcher = item => !(is(item, customize('In')) && 'businessKey' in item),
        objectsToAdd = val ? [createCamundaInWithBusinessKey(this.moddle, undefined, val)] : undefined
      this.form.extensionElements = addAndRemoveElementsFromExtensionElements(this.moddle, this.form, objectsToAdd, matcher)
    },
    'form.delegateVariableMapping'() {
      this.updateVariableMapping(this.form.delegateVariableMapping, this.form.variableMapping)
    },
    'form.variableMapping'() {
      this.updateVariableMapping(this.form.delegateVariableMapping, this.form.variableMapping)
    }
  },
  created() {
    this.sync()
  },
  methods: {
    sync() {
      this.computeLength()
      if (!this.form.caseRef && !this.form.calledElement) {
        // this.form.businessKeyExpression = '#{execution.processBusinessKey}'
        return
      }
      this.form.callActivityType = this.form.caseRef ? 'CMMN' : 'BPMN'
      this.form.calledRef = this.form.caseRef ? this.form.caseRef : this.form.calledElement
      this.form.calledBinding = this.form.caseRef ? this.form.caseBinding : this.form.calledElementBinding
      this.form.calledVersion = this.form.caseRef ? this.form.caseVersion : this.form.calledElementVersion
      this.form.calledTenantId = this.form.caseRef ? this.form.caseTenantId : this.form.calledElementTenantId
      this.form.businessKeyExpression = this.form
        .extensionElements?.values?.find(item => is(item, customize('In')) && 'businessKey' in item)?.businessKey
      if (this.form.calledElement) {
        if ('variableMappingClass' in this.form) {
          this.form.delegateVariableMapping = 'variableMappingClass'
          this.form.variableMapping = this.form.variableMappingClass
        } else if ('variableMappingDelegateExpression' in this.form) {
          this.form.delegateVariableMapping = 'variableMappingDelegateExpression'
          this.form.variableMapping = this.form.variableMappingDelegateExpression
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
      this.variableLength = this.form.extensionElements?.values
        ?.filter(item => (is(item, customize('In')) && !('businessKey' in item)) || is(item, customize('Out'))).length ?? 0
    }
  }
}
</script>
