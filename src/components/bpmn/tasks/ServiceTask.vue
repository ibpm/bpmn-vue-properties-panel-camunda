<!-- https://docs.camunda.org/manual/latest/reference/bpmn20/tasks/service-task/ -->
<template>
  <div>
    <Activity :moddle="moddle" :form="form" @write="write">
      <template #detail>
        <el-form-item :label="$customTranslate('Implementation')" prop="implementation">
          <el-select v-model="form.implementation" filterable>
            <el-option
              v-for="(item, index) in implementations"
              :key="index"
              :label="$customTranslate(item.name)"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <template v-if="form.implementation">
          <FormItemInput
            v-if="form.implementation === 'class'"
            v-model="form.class"
            prop="class"
            :label="$customTranslate('Java Class')"
            :rules="[{ required: true, message: $customTranslate('Must provide a value'), trigger: 'blur' }]"
          />
          <template v-if="form.implementation === 'expression'">
            <FormItemInput
              v-model="form.expression"
              prop="expression"
              :label="$customTranslate('Expression')"
              :rules="[{ required: true, message: $customTranslate('Must provide a value'), trigger: 'blur' }]"
            />
            <FormItemInput
              v-model="form.resultVariable"
              prop="resultVariable"
              :label="$customTranslate('Result Variable')"
            />
          </template>
          <FormItemInput
            v-if="form.implementation === 'delegateExpression'"
            v-model="form.delegateExpression"
            prop="delegateExpression"
            :label="$customTranslate('Delegate Expression')"
            :rules="[{ required: true, message: $customTranslate('Must provide a value'), trigger: 'blur' }]"
          />
          <template v-if="form.implementation === 'external'">
            <FormItemInput
              v-model="form.topic"
              prop="topic"
              :label="$customTranslate('Topic')"
              :rules="[{ required: true, message: $customTranslate('Must provide a value'), trigger: 'blur' }]"
            />
            <FormItemInput
              v-model="form.taskPriority"
              :label="$customTranslate('Task Priority')"
              :placeholder="$customTranslate('External Task Configuration')"
            />
          </template>
          <el-form-item
            v-if="form.implementation === 'connector'"
            :label="$customTranslate('Connector Id')"
            prop="connectorId"
          >
            <el-col :span="12">
              <el-input
                v-model="form.connectorId"
                :rules="[{ required: true, message: $customTranslate('Must provide a value'), trigger: 'blur' }]"
              />
            </el-col>
            <el-col v-if="form.connectorId" :span="4" :offset="1">
              <el-badge :value="ioLength">
                <el-button @click="showIO = true">
                  {{ $customTranslate('Input/Output') }}
                </el-button>
              </el-badge>
            </el-col>
          </el-form-item>
        </template>
      </template>
    </Activity>
    <InputOutput
      v-if="showIO"
      v-model="ioForm"
      @writeIO="writeIO"
    />
  </div>
</template>

<script>
import Activity from '@/components/embbed/Activity'
import InputOutput from '@/components/part/detail/InputOutput'
import FormItemInput from '@/components/ui/FormItemInput'
import elementHelper from '@/mixins/elementHelper'
import { IMPLEMENTATIONS } from '@/utils/constants'
import { customize } from '@/utils/helper'
import { getBusinessObject, is } from 'bpmn-js/lib/util/ModelUtil'

const
  CONNECTOR_NAME = 'Connector',
  ELEMENT_NAME = 'InputOutput'

export default {
  name: 'ServiceTask',
  components: {
    Activity,
    InputOutput,
    FormItemInput
  },
  mixins: [elementHelper],
  data() {
    return {
      implementations: IMPLEMENTATIONS,
      ioForm: {
        ios: []
      },
      showIO: false,
      ioLength: 0
    }
  },
  watch: {
    'form.implementation'(newVal, oldVal) {
      if (oldVal) {
        if (oldVal === 'external') {
          this.write({ type: null, topic: null, taskPriority: null })
        } else if (oldVal === 'connector') {
          let extensionElements = getBusinessObject(this.element).extensionElements
          if (extensionElements && extensionElements.values) {
            extensionElements.values = extensionElements.values?.filter(item => !is(item, customize(CONNECTOR_NAME))) ?? []
            if (!extensionElements.values.length) {
              extensionElements = null
            }
            this.write({ extensionElements: extensionElements })
          }
        } else {
          if (oldVal === 'expression') {
            this.updateResultVariable(null)
          }
          this.write({ [oldVal]: null })
        }
      }
      if (newVal) {
        if (newVal === 'external') {
          this.updateExternal()
          this.updateTaskPriority(this.form.taskPriority)
        } else if (newVal === 'connector') {
          this.updateConnector()
        } else {
          if (newVal === 'expression') {
            this.updateResultVariable(this.form.resultVariable)
          }
          this.updateImplementation()
        }
      }
    },
    'form.class'() {
      this.updateImplementation()
    },
    'form.expression'() {
      this.updateImplementation()
    },
    'form.delegateExpression'() {
      this.updateImplementation()
    },
    'form.topic'() {
      this.updateExternal()
    },
    'form.connectorId'() {
      this.updateConnector()
    },
    'form.resultVariable'(val) {
      this.updateResultVariable(val)
    },
    'form.taskPriority'(val) {
      this.updateTaskPriority(val)
    }
  },
  created() {
    this.readSub()
  },
  methods: {
    readSub() {
      if ('class' in this.form) {
        this.form.implementation = 'class'
      } else if ('expression' in this.form) {
        this.form.implementation = 'expression'
      } else if ('delegateExpression' in this.form) {
        this.form.implementation = 'delegateExpression'
      } else if ('external' in this.form) {
        this.form.implementation = 'external'
      } else if ('connector' in this.form) {
        this.form.implementation = 'connector'
        const connectors = getBusinessObject(this.element)
          .extensionElements?.values?.filter(item => is(item, customize(CONNECTOR_NAME)))
        if (connectors?.length > 0) {
          const ioElement = connectors[0]['inputOutput']
          this.readIO(ioElement?.['inputParameters'], true)
          this.readIO(ioElement?.['outputParameters'], false)
        }
      }
    },
    updateImplementation() {
      if (this.form.implementation) {
        this.write({ [this.form.implementation]: this.form[this.form.implementation] })
      }
    },
    updateExternal() {
      this.write({ type: 'external', topic: this.form.topic })
    },
    updateConnector() {
      let extensionElements = this.form.extensionElements || this.moddle.create('bpmn:ExtensionElements')
      extensionElements.values = extensionElements.values?.filter(item => !is(item, customize(CONNECTOR_NAME))) ?? []
      if (this.form.connectorId) {
        extensionElements.values.push(this.moddle.create(customize(CONNECTOR_NAME), {
          connectorId: this.form.connectorId
        }))
      } else if (!extensionElements.values.length) {
        extensionElements = null
      }
      this.form.extensionElements = extensionElements
      this.write({ extensionElements: extensionElements })
    },
    updateResultVariable(val) {
      this.write({ resultVariable: val })
    },
    updateTaskPriority(val) {
      this.write({ taskPriority: val })
    },
    readIO(sources, ioType) {
      sources?.forEach(io => {
        const target = {
          ioType: ioType,
          name: io.name
        }
        if (io.definition) {
          if (is(io.definition, customize('Script'))) {
            target.type = 'script'
            target.condition = {
              conditionType: 'script',
              scriptFormat: io.definition.scriptFormat,
              scriptType: io.definition.resource ? 'resource' : 'script',
              config: io.definition.value || io.definition.resource
            }
          } else if (is(io.definition, customize('List'))) {
            target.type = 'list'
            target.items = io.definition.items
          } else if (is(io.definition, customize('Map'))) {
            target.type = 'map'
            target.entries = io.definition.entries
          }
        } else {
          target.type = 'text'
          target.value = io.value
        }
        this.ioForm.ios.push(target)
        this.ioLength++
      })
    },
    writeIO(form) {
      this.ioLength = 0
      this.showIO = false
      let ioElement
      if (form.ios.length) {
        ioElement = this.moddle.create(customize(ELEMENT_NAME))
        form.ios.forEach(item => {
          const
            listPropertyName = item.ioType ? 'inputParameters' : 'outputParameters',
            parameterProps = { name: item.name }
          ioElement[listPropertyName] = ioElement[listPropertyName] || []
          if (item.type === 'text') {
            parameterProps.value = item.value
          } else if (item.type === 'script') {
            if (item.condition_?.scriptFormat) {
              parameterProps.definition = this.moddle.create(customize('Script'), {
                scriptFormat: item.condition_.scriptFormat,
                value: item.condition_.script,
                [ customize('resource') ]: item.condition_.resource
              })
            }
          } else if (item.type === 'list') {
            if (item.items?.length) {
              parameterProps.definition = this.moddle.create(customize('List'), {
                items: item.items.map(li => {
                  return this.moddle.create(customize('Value'), {
                    value: li.value
                  })
                })
              })
            }
          } else { // map
            if (item.entries?.length) {
              parameterProps.definition = this.moddle.create(customize('Map'), {
                entries: item.entries.map(entry => {
                  return this.moddle.create(customize('Entry'), {
                    key: entry.key,
                    value: entry.value
                  })
                })
              })
            }
          }
          ioElement[listPropertyName].push(
            this.moddle.create(customize(item.ioType ? 'InputParameter' : 'OutputParameter'),
              parameterProps))
          this.ioLength++
        })
      }
      const connectors = getBusinessObject(this.element)
        .extensionElements?.values?.filter(item => is(item, customize(CONNECTOR_NAME)))
      if (connectors?.length > 0) {
        connectors[0].inputOutput = ioElement
      }
    }
  }
}
</script>
