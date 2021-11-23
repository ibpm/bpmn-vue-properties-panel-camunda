import { getBusinessObject, is } from 'bpmn-js/lib/util/ModelUtil'
import { isAny } from 'bpmn-js/lib/features/modeling/util/ModelingUtil'

export const
  CONDITIONAL_SOURCES = [
    'bpmn:Activity',
    'bpmn:ExclusiveGateway',
    'bpmn:InclusiveGateway',
    'bpmn:ComplexGateway'
  ],
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
    return scriptType && scriptType === 'externalResource'
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
  }
