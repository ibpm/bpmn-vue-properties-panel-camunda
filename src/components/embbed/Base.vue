<template>
  <div>
    <el-form ref="form" :model="bo" label-width="100px" size="mini">
      <FormItemInput
        v-if="propertyVisible('id')"
        v-model="bo.id"
        label="Id"
        :rules="[
          { message: $customTranslate('Element must have an unique id.'), trigger: 'blur', required: true},
          { message: $customTranslate('Length not more than {max}', { max: 255 }), trigger: 'blur', max: 255 }
        ]"
        prop="id"
      />
      <FormItemTextArea
        v-if="propertyVisible('name')"
        v-model="bo.name"
        label="Name"
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
          <component
            :is="propertyComponents[item.type]"
            v-if="item.type !== 'Hidden'"
            :key="index"
            v-model="item.value"
            :options="item.choices"
            :label="item.label"
            :disabled="item.editable === false"
            @change="change($event, item)"
          />
        </template>
      </template>
      <slot name="custom" />
      <el-form-item v-if="propertiesVisible" :label="$customTranslate('Properties')">
        <el-badge :value="properties.length">
          <el-button @click="showProperty = true">
            {{ $customTranslate('Update') }}
          </el-button>
        </el-badge>
      </el-form-item>
      <FormItemTextArea
        v-if="propertyVisible('documentation')"
        v-model="bo.doc"
        label="Documentation"
        :placeholder="$customTranslate('Element Documentation')"
        :rules="[{ message: $customTranslate('Length not more than {max}', { max: 4000 }), trigger: 'blur', max: 4000 }]"
        prop="documentation"
      />
    </el-form>
    <Property
      v-if="showProperty && propertiesVisible"
      v-model="properties"
      :moddle="moddle"
      :is-form="false"
      @save-properties="writeProperties"
      @close="showProperty = false"
    />
  </div>
</template>
<script>
import Property from '../part/detail/Property'
import FormItemInput from '../ui/FormItemInput'
import FormItemSelect from '../ui/FormItemSelect'
import FormItemSwitch from '../ui/FormItemSwitch'
import FormItemTextArea from '../ui/FormItemTextArea'
import areaHelper from '../../mixins/areaHelper'
import { is } from 'bpmn-js/lib/util/ModelUtil'
import { customize, findOutputParameter, isInOut } from '../../utils'
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
  createExtensionElements,
  createCamundaExecutionListenerScript
} from '../../utils/creators'
import { splitColon } from '../../utils/tools'
import store from '../../store'
import eventBus, { ExtensionElements_Changed } from '../../utils/eventBus'

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
    Property,
    FormItemInput,
    FormItemSelect,
    FormItemSwitch,
    FormItemTextArea
  },
  mixins: [areaHelper],
  data() {
    return {
      propertyComponents: {
        'String': 'FormItemInput',
        'Text': 'FormItemTextArea',
        'Dropdown': 'FormItemSelect',
        'Boolean': 'FormItemSwitch'
      },
      templates: store.getters.getTemplates(this.bo?.$type),
      showProperty: false,
      properties: [],
      selectedTemplate: undefined,
      templateProperties: []
    }
  },
  computed: {
    propertiesVisible() {
      return this.propertyVisible('properties')
    }
  },
  watch: {
    'bo.id'(val) {
      this.setTitle()
      this.write({ id: val })
    },
    'bo.name'(val) {
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
      const updateProperties = {}
      this.templateProperties.forEach(property => {
        this.handleProperty(updateProperties, property)
      })
      this.templateProperties = []
      if (this.selectedTemplate?.properties) {
        this.selectedTemplate.properties.forEach(item => {
          const property = {
            ...item,
            value: this.readProperty(item) || item.value
          }
          this.handleProperty(updateProperties, item, property.value)
          this.templateProperties.push(property)
        })
      }
      this.bo.modelerTemplate = this.selectedTemplate?.id
      updateProperties.modelerTemplate = this.selectedTemplate?.id
      this.write(updateProperties)
      this.refresh()
    }
  },
  created() {
    this.init()
    this.load()
  },
  beforeDestroy() {
    eventBus.$off(ExtensionElements_Changed)
  },
  methods: {
    init() {
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
    setTitle() {
      store.commit('SET_NODE_TITLE', this.bo.name || this.bo.id)
    },
    load() {
      if (this.bo.modelerTemplate) {
        this.selectedTemplate = this.templates.find(template => template.id === this.bo.modelerTemplate)
      } else {
        this.selectedTemplate = this.templates.find(template => template.isDefault)
      }
      // 当extensionElements发生变更时，刷新模板的配置项
      eventBus.$on(ExtensionElements_Changed, () => {
        this.templateProperties.forEach(property => {
          property.value = this.readProperty(property) || property.value
        })
      })
    },
    readProperty(property) {
      const binding = property['binding'],
        bindingType = binding.type
      let value, values
      if (bindingType === PROPERTY_TYPE) {
        if (binding.name === 'conditionExpression') {
          value = this.bo.conditionExpression?.body
        } else {
          value = this.bo[splitColon(binding.name)]
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
          if (ioElement) {
            if (bindingType === CAMUNDA_INPUT_PARAMETER_TYPE) {
              const inputParameterElement = ioElement.get('inputParameters')?.find(item => item.name === binding.name)
              if (inputParameterElement) {
                value = (inputParameterElement.definition || inputParameterElement).value
              }
            }
            if (bindingType === CAMUNDA_OUTPUT_PARAMETER_TYPE) {
              const outputParameterElement = findOutputParameter(ioElement, binding)
              if (outputParameterElement) {
                value = outputParameterElement.name
              }
            }
          }
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
      const binding = property['binding'],
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
        if (propertyValue || binding.name !== 'id') { // id是必填项，需要做特殊处理
          updateProperties[binding.name] = propertyValue
        }
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
    change(value, property) {
      const updateProperties = { extensionElements: this.bo.extensionElements }
      this.handleProperty(updateProperties, property, value)
      this.write(updateProperties)
    },
    refresh() {
      this.$nextTick(() => {
        this.init()
        this.$emit('sync')
      })
    }
  }
}
</script>
