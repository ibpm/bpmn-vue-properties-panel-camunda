export const
  ENGINE = 'camunda',
  INITIAL_DIAGRAM =
    '<?xml version="1.0" encoding="UTF-8"?>' +
    '<bpmn:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ' +
                      'xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" ' +
                      'xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" ' +
                      'xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" ' +
                      'targetNamespace="http://bpmn.io/schema/bpmn" ' +
                      'id="Definitions_1">' +
      '<bpmn:process id="Process_1" isExecutable="true">' +
        '<bpmn:startEvent id="StartEvent_1"/>' +
      '</bpmn:process>' +
      '<bpmndi:BPMNDiagram id="BPMNDiagram_1">' +
        '<bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">' +
          '<bpmndi:BPMNShape id="_BPMNShape_StartEvent_2" bpmnElement="StartEvent_1">' +
            '<dc:Bounds height="36.0" width="36.0" x="173.0" y="102.0"/>' +
          '</bpmndi:BPMNShape>' +
        '</bpmndi:BPMNPlane>' +
      '</bpmndi:BPMNDiagram>' +
    '</bpmn:definitions>',
  BPMN_MESSAGE = 'bpmn:Message',
  CONDITIONAL_SOURCES = [
    'bpmn:Activity',
    'bpmn:ExclusiveGateway',
    'bpmn:InclusiveGateway',
    'bpmn:ComplexGateway'
  ],
  CONDITION_TYPES = [
    {
      value: 'expression',
      name: 'Expression'
    },
    {
      value: 'script',
      name: 'Script'
    }
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
  BINDINGS = [
    'latest',
    'deployment',
    'version',
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
  VARIABLE_MAPPINGS = [
    'variableMappingClass',
    'variableMappingDelegateExpression'
  ],
  VARIABLE_TYPES = [
    {
      value: 'source',
      name: 'Source'
    },
    {
      value: 'sourceExpression',
      name: 'Source Expression'
    },
    {
      value: 'variables',
      name: 'All'
    }
  ]
