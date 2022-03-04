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
      <el-form-item
        v-for="(item, index) in templateProperties"
        :key="index"
        :label="$customTranslate(item.label)"
      >
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
  </el-form>
</template>
// TODO 因为el-select的value-key只能指定单一属性，无法组合多个属性，所以暂不支持template的version
<script>
import areaHelper from '@/mixins/areaHelper'
import { is } from 'bpmn-js/lib/util/ModelUtil'
import { customize } from '@/utils/helper'
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
  CAMUNDA_ERROR_EVENT_DEFINITION = 'camunda:errorEventDefinition',
  EXTENSION_BINDING_TYPES = [
    CAMUNDA_PROPERTY_TYPE,
    CAMUNDA_INPUT_PARAMETER_TYPE,
    CAMUNDA_OUTPUT_PARAMETER_TYPE,
    CAMUNDA_IN_TYPE,
    CAMUNDA_OUT_TYPE,
    CAMUNDA_IN_BUSINESS_KEY_TYPE,
    CAMUNDA_FIELD,
    CAMUNDA_ERROR_EVENT_DEFINITION
  ],
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
        const updateProperties = {
          extensionElements: this.form.extensionElements
        }
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
        if (property.binding.type === CAMUNDA_PROPERTY_TYPE) {
          if (this.form.extensionElements?.values) {
            const propertiesElement = this.form.extensionElements.values?.find(item => is(item, customize('Properties')))
            if (propertiesElement?.values) {
              const propertyElement = propertiesElement.values?.find(item => item.name === property.binding.name)
              if (propertyElement) {
                property.value = propertyElement.value
              }
            }
          }
        } else if (IO_BINDING_TYPES.indexOf(property.binding.type) !== -1) {
          if (this.form.extensionElements?.values) {
            const ioElement = this.form.extensionElements.values?.find(item => is(item, customize('InputOutput')))
            if (ioElement?.inputParameters) {
              const parameterElement = ioElement.inputParameters?.find(item => item.name === property.binding.name)
              if (parameterElement) {
                if (parameterElement.definition) {
                  property.definition.value = parameterElement.definition.value
                } else {
                  property.value = parameterElement.value
                }
              }
            }
            // TODO OutputParameter先跳过
          }
        }
      })
    },
    handleProperty(updateProperties, property, value) {
      if (property.binding.type === PROPERTY_TYPE) {
        let propertyValue
        if (property.binding.name === 'conditionExpression') {
          propertyValue = this.moddle.createElement('bpmn:FormalExpression', {
            body: value,
            language: property.binding.scriptFormat
          })
        } else {
          propertyValue = value
        }
        updateProperties[property.binding.name] = propertyValue
      } else if (property.binding.type === CAMUNDA_PROPERTY_TYPE) {
        let extensionElements, propertiesElement, propertyElement
        extensionElements = updateProperties.extensionElements || this.moddle.create('bpmn:ExtensionElements', {
          values: []
        })
        propertiesElement = extensionElements.values?.find(item => is(item, customize('Properties')))
        if (!propertiesElement) {
          propertiesElement = this.moddle.create(customize('Properties'))
          propertiesElement.values = []
          extensionElements.values.push(propertiesElement)
        }
        propertyElement = propertiesElement.values?.find(item => item.name === property.binding.name)
        if (propertyElement) {
          if (value) {
            propertyElement.value = value
          } else {
            propertiesElement.values = propertiesElement.values.filter(item => item.name !== property.binding.name)
          }
        } else if (value) {
          propertyElement = this.moddle.create(customize('Property'), {
            name: property.binding.name,
            value: value
          })
          propertiesElement.values.push(propertyElement)
        }
        if (!propertiesElement.values.length) {
          extensionElements.values = extensionElements.values.filter(item => !is(item, customize('Properties')))
          if (!extensionElements.values.length) {
            extensionElements = null
          }
        }
        updateProperties.extensionElements = extensionElements
      } else if (IO_BINDING_TYPES.indexOf(property.binding.type) !== -1) {
        let extensionElements, ioElement, parameterElement, parameterValue, parameterDefinition
        extensionElements = updateProperties.extensionElements || this.moddle.create('bpmn:ExtensionElements', {
          values: []
        })
        ioElement = extensionElements.values?.find(item => is(item, customize('InputOutput')))
        if (!ioElement) {
          ioElement = this.moddle.create(customize('InputOutput'))
          extensionElements.values.push(ioElement)
        }
        if (property.binding.type === CAMUNDA_INPUT_PARAMETER_TYPE) {
          if (!ioElement.inputParameters) {
            ioElement.inputParameters = []
          }
          parameterElement = ioElement.inputParameters.find(item => item.name === property.binding.name)
          if (parameterElement) {
            if (value) {
              if (property.binding.scriptFormat) {
                parameterElement.definition.value = value
              } else {
                parameterElement.value = value
              }
            } else {
              ioElement.inputParameters = ioElement.inputParameters.filter(item => item.name !== property.binding.name)
            }
          } else if (value) {
            if (property.binding.scriptFormat) {
              parameterDefinition = this.moddle.create(customize('Script'), {
                scriptFormat: property.binding.scriptFormat,
                value: value
              })
            } else {
              parameterValue = value
            }
            parameterElement = this.moddle.create(customize('InputParameter'), {
              name: property.binding.name,
              value: parameterValue,
              definition: parameterDefinition
            })
            ioElement.inputParameters.push(parameterElement)
          }
          if (!ioElement.inputParameters.length) {
            extensionElements.values = extensionElements.values.filter(item => !is(item, customize('InputOutput')))
          }
        } else {
          if (!ioElement.outputParameters) {
            ioElement.outputParameters = []
          }
          parameterElement = ioElement.outputParameters.find(item => item.name === property.binding.value)
          if (parameterElement) {
            if (value) {
              parameterElement.name = value
            } else {
              ioElement.outputParameters = ioElement.outputParameters.filter(item => item.name !== value)
            }
          } else if (value) {
            if (property.binding.scriptFormat) {
              parameterDefinition = this.moddle.create(customize('Script'), {
                scriptFormat: property.binding.scriptFormat,
                value: property.binding.source
              })
            } else {
              parameterValue = property.binding.source
            }
            parameterElement = this.moddle.create(customize('OutputParameter'), {
              name: value,
              value: parameterValue,
              definition: parameterDefinition
            })
            ioElement.outputParameters.push(parameterElement)
          }
          if (!ioElement.outputParameters.length) {
            extensionElements.values = extensionElements.values.filter(item => !is(item, customize('InputOutput')))
          }
        }
        if (!extensionElements.values.length) {
          extensionElements = null
        }
        updateProperties.extensionElements = extensionElements
      }
    }
  }
}
</script>
