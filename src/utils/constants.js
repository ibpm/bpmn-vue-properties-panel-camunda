export const
  ENGINE = 'camunda',
  BPMN_MESSAGE = 'bpmn:Message',
  CONDITIONAL_SOURCES = [
    'bpmn:Activity',
    'bpmn:ExclusiveGateway',
    'bpmn:InclusiveGateway',
    'bpmn:ComplexGateway'
  ],
  BPMN_IMPLEMENTATIONS = [
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
    }
  ],
  IMPLEMENTATIONS = [
    ...BPMN_IMPLEMENTATIONS,
    {
      value: 'external',
      name: 'External'
    },
    {
      value: 'connector',
      name: 'Connector'
    }
  ],
  EVENTS_TASK = [
    'create',
    'assignment',
    'complete',
    'delete',
    'update',
    'timeout'// https://docs.camunda.org/manual/latest/reference/bpmn20/events/timer-events/#defining-a-timer
  ],
  SCRIPT_TYPES = [
    {
      value: 'script',
      name: 'Inline Script'
    },
    {
      value: 'resource',
      name: 'External Resource'
    }
  ],
  EVENTS_EXECUTION = [
    'start',
    'end'
  ],
  LISTENER_TYPES = [
    ...BPMN_IMPLEMENTATIONS,
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
  ],
  BINDINGS_CMMN = [
    'latest',
    'deployment',
    'version'
  ],
  BINDINGS = [
    ...BINDINGS_CMMN,
    'versionTag'
  ],
  MAP_DECISION_RESULTS = [
    {
      value: 'singleEntry',
      name: 'singleEntry (TypedValue)'
    },
    {
      value: 'singleResult',
      name: 'singleResult (Map<String, Object>)'
    },
    {
      value: 'collectEntries',
      name: 'collectEntries (List<Object>)'
    },
    {
      value: 'resultList',
      name: 'resultList (List<Map<String, Object>>)'
    }
  ],
  VARIABLE_ASSIGNMENT_TYPES = [
    {
      value: 'text',
      name: 'String or Expression'
    },
    {
      value: 'script',
      name: 'Script'
    },
    {
      value: 'list',
      name: 'List'
    },
    {
      value: 'map',
      name: 'Map'
    }
  ],
  CALL_ACTIVITY_TYPES = [
    'BPMN',
    'CMMN'
  ],
  VARIABLE_MAPPINGS = [
    'variableMappingClass',
    'variableMappingDelegateExpression'
  ]
