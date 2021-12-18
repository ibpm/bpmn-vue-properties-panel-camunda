export const
  ENGINE = 'camunda',
  CONDITIONAL_SOURCES = [
    'bpmn:Activity',
    'bpmn:ExclusiveGateway',
    'bpmn:InclusiveGateway',
    'bpmn:ComplexGateway'
  ],
  EVENTS_TASK = [
    'create',
    'assignment',
    'complete',
    'delete',
    'update',
    'timeout'// https://docs.camunda.org/manual/latest/reference/bpmn20/events/timer-events/#defining-a-timer
  ],
  LISTENER_TYPES_TASK = [
    {
      value: 'class',
      name: 'Java Class'
    },
    {
      value: 'expression',
      name: 'Expression'
    },
    {
      value: 'delegateExpression',
      name: 'Delegate Expression'
    },
    {
      value: 'script',
      name: 'Script'
    }
  ],
  TIMER_DEFINITION_TYPES = [
    {
      value: 'timeDate',
      name: 'Date'
    },
    {
      value: 'timeDuration',
      name: 'Duration'
    },
    {
      value: 'timeCycle',
      name: 'Cycle'
    }
  ],
  FIELD_TYPES = [
    {
      value: 'string',
      name: 'String'
    },
    {
      value: 'expression',
      name: 'Expression'
    }
  ]
