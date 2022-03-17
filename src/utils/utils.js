import { getBusinessObject, is, isAny } from 'bpmn-js/lib/util/ModelUtil'
import { CONDITIONAL_SOURCES, ENGINE } from './constants'

export const
  customize = (suffix) => {
    return ENGINE + ':' + suffix
  },
  isConditionalSource = (element) => {
    return isAny(element, CONDITIONAL_SOURCES)
  },
  isExpression = (conditionType) => {
    return conditionType && conditionType === 'expression'
  },
  isScript = (conditionType) => {
    return conditionType && conditionType === 'script'
  },
  isResource = (scriptType) => {
    return scriptType && scriptType === 'resource'
  },
  getRoot = (element) => {
    let parent = getBusinessObject(element)
    while (parent.$parent) {
      parent = parent.$parent
    }
    return parent
  },
  filterElementsByType = (objectList, type) => {
    return objectList ? objectList.filter(obj => is(obj, type)) : []
  },
  findRootElementsByType = (element, referencedType) => {
    const root = getRoot(element)
    return filterElementsByType(root.rootElements, referencedType)
  },
  getFlowElements = (element, type) => {
    return filterElementsByType(element.flowElements, type)
  },
  isInOut = (element, binding) => {
    if (binding.type === 'camunda:in') {
      // find based on target attribute
      if (binding.target) {
        return element.target === binding.target
      }
    }

    if (binding.type === 'camunda:out') {
      // find based on source / sourceExpression
      if (binding.source) {
        return element.source === binding.source
      }

      if (binding.sourceExpression) {
        return element.sourceExpression === binding.sourceExpression
      }
    }

    // find based variables / local combination
    if (binding.variables) {
      return element.variables === 'all' && (
        binding.variables !== 'local' || element.local
      )
    }
  }
  /*
  ,findElementById = (element, type, id) => {
    const elements = findRootElementsByType(element, type)
    return elements.find(ele => ele.id === id)
  },
  getEventDefinition = (element, eventType) => {
    const bo = getBusinessObject(element)
    let eventDefinition = null

    if (bo.eventDefinitions) {
      bo.eventDefinitions.forEach(event => {
        if (is(event, eventType)) {
          eventDefinition = event
        }
      })
    }

    return eventDefinition
  }*/
