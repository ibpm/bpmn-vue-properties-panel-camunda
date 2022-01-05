import { getBusinessObject, is } from 'bpmn-js/lib/util/ModelUtil'
import { isAny } from 'bpmn-js/lib/features/modeling/util/ModelingUtil'
import { CONDITIONAL_SOURCES, ENGINE } from '@/utils/constants'

export const
  typeMatch = (type, suffix) => {
    return type === customize(suffix)
  },
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
  createFormalExpression = (moddle, props) => {
    return moddle.create('bpmn:FormalExpression', props)
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
