import { customize } from './utils'

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
    return addAndRemoveElementsFromList(createExtensionElements(moddle, parent), 'values', 'extensionElements', objectsToAdd, matcher)
  },
  /**
   *
   * @param currentObject 当前操作的对象，比如root/extensionElements/Properties/InputOutput
   * @param propertyName 当前对象的某个数组属性，比如'rootElements'/'values'/inputParameters/outputParameters
   * @param currentPropertyName 当前对象自身在父对象中的属性名称，比如'extensionElements'
   * @param objectsToAdd 需向集合中添加的元素
   * @param matcher 需从集合里删除的元素的匹配函数
   */
  addAndRemoveElementsFromList = (currentObject, propertyName, currentPropertyName, objectsToAdd, matcher) => {
    const listCopy = objectsToAdd || [] // add all objects which should be added

    // remove all objects which should be removed
    if (matcher) {
      listCopy.push(...currentObject[propertyName].filter(matcher))
    } else {
      listCopy.push(...currentObject[propertyName])
    }
    /* if (objectsToRemove?.length) {
      currentObject[propertyName].forEach(object => {
        if (objectsToRemove.indexOf(object) === -1) {
          listCopy.push(object)
        }
      })
    } */

    // set property to new list
    if (listCopy.length > 0 || !currentPropertyName) {
      // as long as there are elements in the list update the list
      currentObject[propertyName] = listCopy
    } else if (currentPropertyName) {
      // remove the list when it is empty
      currentObject.$parent.set(currentPropertyName, undefined)
      currentObject = undefined
    }
    return currentObject
  }
