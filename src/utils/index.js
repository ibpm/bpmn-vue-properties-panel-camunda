import { is, isAny } from 'bpmn-js/lib/util/ModelUtil'
import { CONDITIONAL_SOURCES, ENGINE } from './constants'
import store from '../store'
import { splitColon } from './tools'

export const
  customize = (suffix) => {
    return ENGINE + ':' + suffix
  },
  isConditionalSource = (bo) => {
    return isAny(bo, CONDITIONAL_SOURCES)
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
  getRoot = (bo) => {
    let parent = bo
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
    return filterElementsByType(element['flowElements'], type)
  },
  getProcessElement = (modeler) => {
    const rootElements = modeler.getDefinitions().rootElements
    for (let i = 0; i < rootElements.length; i++) {
      if (is(rootElements[i], 'bpmn:Process')) return rootElements[i]
    }
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
  },
  /**
   * 不使用value的IO variable
   * @param binding
   * @returns {boolean}
   */
  isInOutVariable = (binding) => {
    return (binding.variables === 'local' || binding.variables === 'all') &&
      ((binding.type === 'camunda:in' && !binding.target && !binding.expression) ||
        (binding.type === 'camunda:out' && !binding.source && !binding.sourceExpression))
  },
  isInputOutputSupported = (businessObject) => {
    return (
      is(businessObject, 'bpmn:FlowNode') && !(
        isAny(businessObject, ['bpmn:StartEvent', 'bpmn:BoundaryEvent', 'bpmn:Gateway']) ||
        is(businessObject, 'bpmn:SubProcess') && businessObject.get('triggeredByEvent')
      )
    )
  },
  isPropertyVisible = (entryId, bo) => {
    if (!bo || !bo['modelerTemplate']) {
      return true
    }
    const template = store.getters.getTemplates(bo.$type).find(t => t.id === bo['modelerTemplate'])
    if (template && template.properties) {
      const property = template.properties.find(property => {
        const binding = property['binding']
        return binding && binding.type === 'property' && splitColon(binding.name) === entryId
      })
      return property === undefined && isEntryVisible(entryId, template['entriesVisible'])
    }
    return true
  },
  isEntryVisible = (entryId, _entriesVisible) => {
    const
      entriesVisible = _entriesVisible || { _all: false },
      defaultVisible = entriesVisible._all,
      entryVisible = entriesVisible[ entryId ]

    if (typeof entriesVisible === 'boolean') {
      return entriesVisible
    }

    if (defaultVisible) {
      return entryVisible !== false
    } else {
      return entryVisible === true
    }
  },
  findOutputParameter = (inputOutput, binding) => {
    const outputParameters = inputOutput.get('outputParameters')
    return outputParameters && outputParameters.find(p => {
      if (!binding.scriptFormat) {
        return p.value === binding.source
      }
      if (!p.definition || binding.scriptFormat !== p.definition.scriptFormat) {
        return false
      }
      return p.definition.value === binding.source
    })
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
