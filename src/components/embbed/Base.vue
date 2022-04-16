<template>
  <div>
    <el-form ref="form" :model="bo" label-width="100px" size="mini">
      <FormItemInput
        v-model="bo.id"
        :label="$customTranslate('Id')"
        :rules="[
          { message: $customTranslate('Element must have an unique id.'), trigger: 'blur', required: true},
          { message: $customTranslate('Length not more than {max}', { max: 255 }), trigger: 'blur', max: 255 }
        ]"
        prop="id"
      />
      <FormItemTextArea
        v-model="bo.name"
        :label="$customTranslate('Name')"
        :rules="[{ message: $customTranslate('Length not more than {max}', { max: 255 }), trigger: 'blur', max: 255 }]"
        prop="name"
      />
      <el-form-item v-if="templates.length" :label="$customTranslate('Template')">
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
      <slot name="custom" />
      <el-form-item :label="$customTranslate('Properties')">
        <el-badge :value="properties.length">
          <el-button @click="showProperty = true">
            {{ $customTranslate('Update') }}
          </el-button>
        </el-badge>
      </el-form-item>
      <FormItemTextArea
        v-model="bo.doc"
        :label="$customTranslate('Documentation')"
        :placeholder="$customTranslate('Element Documentation')"
        :rules="[{ message: $customTranslate('Length not more than {max}', { max: 4000 }), trigger: 'blur', max: 4000 }]"
        prop="documentation"
      />
    </el-form>
    <Properties
      v-if="showProperty"
      v-model="properties"
      :moddle="moddle"
      :is-form="false"
      @save-properties="writeProperties"
      @close="showProperty = false"
    />
  </div>
</template>
<script>
import Properties from '../../components/part/detail/Properties'
import FormItemInput from '../../components/ui/FormItemInput'
import FormItemTextArea from '../../components/ui/FormItemTextArea'
import areaHelper from '../../mixins/areaHelper'
import { is } from 'bpmn-js/lib/util/ModelUtil'
import { customize, isInOut } from '../../utils'
import { addAndRemoveElementsFromExtensionElements } from '../../utils/creators'
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
} from '../../utils/creators'
import { splitColon } from '@/utils/tools'

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
  name: 'Base',
  components: {
    Properties,
    FormItemInput,
    FormItemTextArea
  },
  mixins: [areaHelper],
  data() {
    return {
      templates: this.$store.state.templateMap[this.bo?.$type],
      showProperty: false,
      properties: [],
      tabName: 'general',
      selectedTemplate: undefined,
      templateProperties: []
    }
  },
  watch: {
    'bo.id': function(val) {
      this.setTitle()
      this.write({ id: val })
    },
    'bo.name': function(val) {
      this.setTitle()
      this.write({ name: val })
    },
    'bo.doc'(val) {
      this.write({
        documentation: val ? [this.moddle.create('bpmn:Documentation', { text: val })] : []
      })
    },
    selectedTemplate(newVal, oldVal) {
      if (oldVal === newVal) return
      this.templateProperties = []
      if (this.selectedTemplate?.properties) {
        this.selectedTemplate.properties.forEach(property => {
          this.templateProperties.push({
            ...property
          })
        })
      }
      // this.bo.modelerTemplate = this.selectedTemplate?.id
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
      },
      deep: true
    }
  },
  created() {
    this.read()
    this.init()
  },
  methods: {
    read() {
      if (this.bo.documentation?.length) {
        this.bo.doc = this.bo.documentation[0].text
      }
      this.properties =
        this.bo.extensionElements?.values.find(item => is(item, customize('Properties')))?.values ?? []
    },
    writeProperties(propertiesElement) {
      this.showProperty = false
      this.properties = propertiesElement?.values || []
      const
        matcher = item => !is(item, customize('Properties')),
        objectsToAdd = propertiesElement ? [propertiesElement] : undefined
      this.write({ extensionElements:
          this.bo.extensionElements = addAndRemoveElementsFromExtensionElements(this.moddle, this.bo, objectsToAdd, matcher)
      })
    },
    /* clickTab(tab) {
      if (tab.name === 'general') {
        this.$emit('sync')
        this.read()
      } else if (tab.name === 'templates') {
        this.read1()
      }
    }, */
    init() {
      if (this.bo.modelerTemplate) {
        this.selectedTemplate = this.templates.find(template => template.id === this.bo.modelerTemplate)
      } else {
        this.selectedTemplate = this.templates.find(template => template.isDefault)
      }
    },
    // 当General面板变更时，调用本方法同步数据
    read1() {
      this.templateProperties.forEach(property => {
        let value
        if ((value = this.readOne(property)) !== undefined) {
          property.value = value
        }
      })
    },
    readOne(property) {
      const binding = property.binding,
        bindingType = binding.type
      let value, values
      if (bindingType === PROPERTY_TYPE) {
        const key = splitColon(binding.name)
        if (key in this.bo) {
          value = this.bo[key]
        }
      } else if ((values = this.bo.extensionElements?.values)?.length) {
        if (bindingType === CAMUNDA_PROPERTY_TYPE) {
          const propertiesElement = values.find(item => is(item, customize('Properties')))
          if (propertiesElement?.values) {
            const propertyElement = propertiesElement.values?.find(item => item.name === binding.name)
            if (propertyElement) {
              value = propertyElement.value
            }
          }
        } else if (IO_BINDING_TYPES.indexOf(bindingType) !== -1) {
          const ioElement = values.find(item => is(item, customize('InputOutput')))
          if (ioElement?.inputParameters) {
            const parameterElement = ioElement.inputParameters?.find(item => item.name === binding.name)
            if (parameterElement) {
              value = (parameterElement.definition || parameterElement).value
            }
          }
          // TODO OutputParameter先跳过
        } else if (IN_OUT_BINDING_TYPES.indexOf(bindingType) !== -1) {
          let matcher, ioElement
          if (bindingType === CAMUNDA_IN_TYPE) {
            matcher = item => is(item, customize('In')) && isInOut(item, binding)
            if ((ioElement = values.find(matcher)) !== undefined) {
              value = 'sourceExpression' in property ? ioElement.sourceExpression : ioElement.source
            }
          } else if (bindingType === CAMUNDA_OUT_TYPE) {
            matcher = item => is(item, customize('Out')) && isInOut(item, binding)
            if ((ioElement = values.find(matcher)) !== undefined) {
              value = ioElement.target
            }
          } else {
            matcher = item => is(item, customize('In')) && 'businessKey' in item
            if ((ioElement = values.find(matcher)) !== undefined) {
              value = ioElement.businessKey
            }
          }
        }
      }
      return value
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
    resolveList(bo, propertyName, value, createFunction, binding, matcher) {
      bo[propertyName] = bo[propertyName]?.filter(matcher) ?? [] // delete
      if (value) { // create & update
        bo[propertyName].push(createFunction(this.moddle, binding, value))
      }
    },
    setTitle() {
      this.$store.commit('SET_NODE_TITLE', this.bo.name || this.bo.id)
    }
  }
}
</script>
