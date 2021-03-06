import { customize } from './index'
import eventBus, { ExtensionElements_Changed } from './eventBus'

export const
  createElement = (moddle, elementType, parent, properties) => {
    const element = moddle.create(elementType, properties)
    element.$parent = parent
    return element
  },
  createExtensionElements = (moddle, parent) => {
    return parent.extensionElements ||
      createElement(moddle, 'bpmn:ExtensionElements', parent, { values: [] })
  },
  createFormalExpression = (moddle, props) => {
    return moddle.create('bpmn:FormalExpression', props)
  },
  createCamundaProperty = (moddle, binding, value) => {
    return moddle.create(customize('Property'), {
      name: binding.name,
      value: value || ''
    })
  },
  createInputParameter = (moddle, binding, value) => {
    return createParameter(moddle, binding.name, value, binding.scriptFormat, 'InputParameter')
  },
  createOutputParameter = (moddle, binding, value) => {
    return createParameter(moddle, value, binding.source, binding.scriptFormat, 'OutputParameter')
  },
  createCamundaIn = (moddle, binding, value) => {
    const properties = createCamundaInOutAttrs(binding, value)
    return moddle.create(customize('In'), properties)
  },
  createCamundaOut = (moddle, binding, value) => {
    const properties = createCamundaInOutAttrs(binding, value)
    return moddle.create(customize('Out'), properties)
  },
  createCamundaInWithBusinessKey = (moddle, binding, value) => {
    return moddle.create(customize('In'), {
      businessKey: value
    })
  },
  createCamundaFieldInjection = (moddle, binding, value) => {
    const props = { name: binding.name }
    if (!binding.expression) {
      props.string = value
    } else {
      props.expression = value
    }
    return moddle.create(customize('Field'), props)
  },
  createCamundaExecutionListenerScript = (moddle, binding, value) => {
    const scriptFormat = binding.scriptFormat
    let parameterValue,
      parameterDefinition

    if (scriptFormat) {
      parameterDefinition = moddle.create(customize('Script'), {
        scriptFormat: scriptFormat,
        value: value
      })
    } else {
      parameterValue = value
    }

    return moddle.create(customize('ExecutionListener'), {
      event: binding.event,
      value: parameterValue,
      script: parameterDefinition
    })
  },
  createParameter = (moddle, name, value, scriptFormat, elementName) => {
    let parameterValue,
      parameterDefinition

    if (scriptFormat) {
      parameterDefinition = moddle.create(customize('Script'), {
        scriptFormat: scriptFormat,
        value: value
      })
    } else {
      parameterValue = value
    }

    return moddle.create(customize(elementName), {
      name: name,
      value: parameterValue,
      definition: parameterDefinition
    })
  },
  createCamundaInOutAttrs = (binding, value) => {
    const properties = {}

    // Explicitly cover all conditions as specified here:
    // https://github.com/camunda/camunda-modeler/blob/develop/docs/element-templates/README.md#camundain
    if (binding.type === 'camunda:in') {
      if (binding.target && !binding.expression && !binding.variables) {
        properties.target = binding.target
        properties.source = value
      } else if (binding.target && binding.expression === true && !binding.variables) {
        properties.target = binding.target
        properties.sourceExpression = value
      } else if (!binding.target && !binding.expression && binding.variables === 'local') {
        properties.local = true
        properties.variables = 'all'
      } else if (binding.target && !binding.expression && binding.variables === 'local') {
        properties.local = true
        properties.source = value
        properties.target = binding.target
      } else if (binding.target && binding.expression && binding.variables === 'local') {
        properties.local = true
        properties.sourceExpression = value
        properties.target = binding.target
      } else if (!binding.target && !binding.expression && binding.variables === 'all') {
        properties.variables = 'all'
      } else {
        throw new Error('invalid configuration for camunda:in element template binding')
      }
    }

    // Explicitly cover all conditions as specified here:
    // https://github.com/camunda/camunda-modeler/blob/develop/docs/element-templates/README.md#camundaout
    if (binding.type === 'camunda:out') {
      if (binding.source && !binding.sourceExpression && !binding.variables) {
        properties.target = value
        properties.source = binding.source
      } else if (!binding.source && binding.sourceExpression && !binding.variables) {
        properties.target = value
        properties.sourceExpression = binding.sourceExpression
      } else if (!binding.source && !binding.sourceExpression && binding.variables === 'all') {
        properties.variables = 'all'
      } else if (binding.source && !binding.sourceExpression && binding.variables === 'local') {
        properties.local = true
        properties.source = binding.source
        properties.target = value
      } else if (!binding.source && binding.sourceExpression && binding.variables === 'local') {
        properties.local = true
        properties.sourceExpression = binding.sourceExpression
        properties.target = value
      } else if (!binding.source && !binding.sourceExpression && binding.variables === 'local') {
        properties.local = true
        properties.variables = 'all'
      } else {
        throw new Error('invalid configuration for camunda:out element template binding')
      }
    }

    return properties
  },
  addAndRemoveElementsFromExtensionElements = (moddle, parent, objectsToAdd, matcher) => {
    let currentObject = createExtensionElements(moddle, parent)
    const listCopy = objectsToAdd || [] // add all objects which should be added

    // remove all objects which should be removed
    if (matcher) {
      listCopy.push(...currentObject['values'].filter(matcher))
    } else {
      listCopy.push(...currentObject['values'])
    }
    // set property to new list
    if (listCopy.length > 0) {
      // as long as there are elements in the list update the list
      currentObject.values = listCopy
    } else {
      // remove the list when it is empty
      if (currentObject.$parent.extensionElements) {
        currentObject.$parent.extensionElements = undefined
      }
      currentObject = undefined
    }
    eventBus.$emit(ExtensionElements_Changed)
    return currentObject
  }
