<template>
  <el-form label-width="100px" size="mini">
    <el-form-item :label="$customTranslate('Template')">
      <el-select v-model="selectedTemplate" value-key="id" filterable clearable>
        <el-option
          v-for="(item, index) in templates"
          :key="index"
          :label="$customTranslate(item.name)"
          :value="item"
        />
      </el-select>
    </el-form-item>
    <template v-if="selectedTemplate">
      <el-form-item v-if="selectedTemplate.description">
        <span style="color: #8492a6;">{{ $customTranslate(selectedTemplate.description) }}</span>
      </el-form-item>
      <template v-for="(item, index) in templateProperties">
        <el-form-item v-if="item.type !== 'Hidden'" :key="index" :label="$customTranslate(item.label)">
          <el-input
            v-if="item.type === 'String'"
            v-model="item.value"
            clearable
            :disabled="item.editable === false"
          />
          <el-input
            v-if="item.type === 'Text'"
            v-model="item.value"
            type="textarea"
            clearable
            :disabled="item.editable === false"
            :autosize="{ maxRows: 5 }"
          />
          <el-select v-if="item.type === 'Dropdown'" v-model="item.value">
            <el-option
              v-for="(choice, idx) in item.choices"
              :key="idx"
              :label="$customTranslate(choice.name)"
              :value="choice.value"
            />
          </el-select>
          <el-switch
            v-if="item.type === 'Boolean'"
            v-model="item.value"
            :disabled="item.editable === false"
          />
        </el-form-item>
      </template>
    </template>
  </el-form>
</template>
// TODO 因为el-select的value-key只能指定单一属性，无法组合多个属性，所以暂不支持template的version
<script>
import areaHelper from '@/mixins/areaHelper'
import { is } from 'bpmn-js/lib/util/ModelUtil'
import { customize, isInOut } from '@/utils/utils'
import {
  createCamundaIn,
  createCamundaInWithBusinessKey,
  createCamundaOut,
  createCamundaFieldInjection,
  createOutputParameter,
  createInputParameter,
  createCamundaProperty,
  createFormalExpression,
  createExtensionElements, createCamundaExecutionListenerScript
} from '@/utils/creators'
const
  PROPERTY_TYPE = 'property',
  CAMUNDA_PROPERTY_TYPE = 'camunda:property',
  CAMUNDA_INPUT_PARAMETER_TYPE = 'camunda:inputParameter',
  CAMUNDA_OUTPUT_PARAMETER_TYPE = 'camunda:outputParameter',
  CAMUNDA_IN_TYPE = 'camunda:in',
  CAMUNDA_OUT_TYPE = 'camunda:out',
  CAMUNDA_IN_BUSINESS_KEY_TYPE = 'camunda:in:businessKey',
  CAMUNDA_EXECUTION_LISTENER_TYPE = 'camunda:executionListener',
  CAMUNDA_FIELD = 'camunda:field',
  // CAMUNDA_ERROR_EVENT_DEFINITION = 'camunda:errorEventDefinition',
  IO_BINDING_TYPES = [
    CAMUNDA_INPUT_PARAMETER_TYPE,
    CAMUNDA_OUTPUT_PARAMETER_TYPE
  ],
  IN_OUT_BINDING_TYPES = [
    CAMUNDA_IN_TYPE,
    CAMUNDA_OUT_TYPE,
    CAMUNDA_IN_BUSINESS_KEY_TYPE
  ]
export default {
  name: 'Templates',
  mixins: [areaHelper],
  data() {
    return {
      selectedTemplate: null,
      templateProperties: []
    }
  },
  watch: {
    selectedTemplate() {
      this.templateProperties = []
      if (this.selectedTemplate?.properties) {
        this.selectedTemplate.properties.forEach(property => {
          this.templateProperties.push({
            ...property
          })
        })
      }
      this.form.modelerTemplate = this.selectedTemplate?.id
      this.write({ modelerTemplate: this.selectedTemplate?.id })
    },
    templateProperties: {
      handler(newVal, oldVal) {
        const updateProperties = {}
        oldVal?.forEach(property => {
          this.handleProperty(updateProperties, property)
        })
        newVal?.forEach(property => {
          this.handleProperty(updateProperties, property, property.value)
        })
        this.write(updateProperties)
        this.$emit('sync')
      },
      deep: true
    }
  },
  created() {
    this.read()
  },
  methods: {
    read() {
      if (this.form.modelerTemplate) {
        this.selectedTemplate = this.templates.find(template => template.id === this.form.modelerTemplate)
      } else {
        this.selectedTemplate = this.templates.find(template => template.isDefault)
      }
    },
    // 当General面板变更时，调用本方法同步数据
    align() {
      this.templateProperties.forEach(property => {
        const binding = property.binding,
          bindingType = binding.type
        let values
        if ((values = this.form.extensionElements?.values)?.length) {
          if (bindingType === CAMUNDA_PROPERTY_TYPE) {
            const propertiesElement = values.find(item => is(item, customize('Properties')))
            if (propertiesElement?.values) {
              const propertyElement = propertiesElement.values?.find(item => item.name === binding.name)
              if (propertyElement) {
                property.value = propertyElement.value
              }
            }
          } else if (IO_BINDING_TYPES.indexOf(bindingType) !== -1) {
            const ioElement = values.find(item => is(item, customize('InputOutput')))
            if (ioElement?.inputParameters) {
              const parameterElement = ioElement.inputParameters?.find(item => item.name === binding.name)
              if (parameterElement) {
                property.value = (parameterElement.definition || parameterElement).value
              }
            }
            // TODO OutputParameter先跳过
          } else if (IN_OUT_BINDING_TYPES.indexOf(bindingType) !== -1) {
            let matcher, ioElement
            if (bindingType === CAMUNDA_IN_TYPE) {
              matcher = item => is(item, customize('In')) && isInOut(item, binding)
              if ((ioElement = values.find(matcher)) !== undefined) {
                property.value = 'sourceExpression' in property ? ioElement.sourceExpression : ioElement.source
              }
            } else if (bindingType === CAMUNDA_OUT_TYPE) {
              matcher = item => is(item, customize('Out')) && isInOut(item, binding)
              if ((ioElement = values.find(matcher)) !== undefined) {
                property.value = ioElement.target
              }
            } else {
              matcher = item => is(item, customize('In')) && 'businessKey' in item
              if ((ioElement = values.find(matcher)) !== undefined) {
                property.value = ioElement.businessKey
              }
            }
          }
        }
      })
    },
    handleProperty(updateProperties, property, value) {
      const binding = property.binding,
        bindingType = binding.type,
        extensionElements = createExtensionElements(this.moddle, updateProperties)
      if (bindingType === PROPERTY_TYPE) {
        let propertyValue
        if (binding.name === 'conditionExpression') {
          propertyValue = createFormalExpression(this.moddle, {
            body: value,
            language: binding.scriptFormat
          })
        } else {
          propertyValue = value
        }
        updateProperties[binding.name] = propertyValue
      } else if (bindingType === CAMUNDA_PROPERTY_TYPE) {
        let propertiesElement = extensionElements.values?.find(item => is(item, customize('Properties')))
        if (!propertiesElement) {
          propertiesElement = this.moddle.create(customize('Properties'))
          propertiesElement.values = []
          extensionElements.values.push(propertiesElement)
        }
        const matcher = item => item.name !== binding.name
        this.resolveList(propertiesElement, 'values', value, createCamundaProperty, binding, matcher)
        if (!propertiesElement.values.length) {
          extensionElements.values = extensionElements.values.filter(item => !is(item, customize('Properties')))
        }
      } else if (IO_BINDING_TYPES.indexOf(bindingType) !== -1) {
        let ioElement = extensionElements.values?.find(item => is(item, customize('InputOutput')))
        if (!ioElement) {
          ioElement = this.moddle.create(customize('InputOutput'))
          extensionElements.values.push(ioElement)
        }
        let matcher, propertyName, func
        if (bindingType === CAMUNDA_INPUT_PARAMETER_TYPE) {
          matcher = item => item.name !== binding.name
          propertyName = 'inputParameters'
          func = createInputParameter
        } else {
          matcher = item => item.name !== value
          propertyName = 'outputParameters'
          func = createOutputParameter
        }
        this.resolveList(ioElement, propertyName, value, func, binding, matcher)
        if (ioElement['inputParameters']?.length + ioElement['outputParameters']?.length === 0) {
          extensionElements.values = extensionElements.values.filter(item => !is(item, customize('InputOutput')))
        }
      } else if (IN_OUT_BINDING_TYPES.indexOf(bindingType) !== -1) {
        let func, matcher
        if (bindingType === CAMUNDA_IN_TYPE) {
          func = createCamundaIn
          matcher = item => !(is(item, customize('In')) && isInOut(item, binding))
        } else if (bindingType === CAMUNDA_OUT_TYPE) {
          func = createCamundaOut
          matcher = item => !(is(item, customize('Out')) && isInOut(item, binding))
        } else {
          func = createCamundaInWithBusinessKey
          matcher = item => !(is(item, customize('In')) && 'businessKey' in item)
        }
        this.resolveList(extensionElements, 'values', value, func, binding, matcher)
      } else if (bindingType === CAMUNDA_FIELD) {
        const matcher = item => !(is(item, customize('Field')) && item.name === binding.name)
        this.resolveList(extensionElements, 'values', value, createCamundaFieldInjection, binding, matcher)
      } else if (bindingType === CAMUNDA_EXECUTION_LISTENER_TYPE) {
        const matcher = item => !is(item, customize('ExecutionListener') && item.event !== binding.event)
        this.resolveList(extensionElements, 'values', value, createCamundaExecutionListenerScript, binding, matcher)
      }
      updateProperties.extensionElements = extensionElements.values.length ? extensionElements : undefined
    },
    resolveList(businessObject, propertyName, value, createFunction, binding, matcher) {
      businessObject[propertyName] = businessObject[propertyName]?.filter(matcher) ?? [] // delete
      if (value) { // create & update
        businessObject[propertyName].push(createFunction(this.moddle, binding, value))
      }
    }
  }
}
</script>
