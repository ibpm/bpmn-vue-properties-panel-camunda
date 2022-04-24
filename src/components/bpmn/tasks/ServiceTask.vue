<!-- https://docs.camunda.org/manual/latest/reference/bpmn20/tasks/service-task/ -->
<template>
  <div>
    <Activity :element="element" :moddle="moddle" :bo="bo" @sync="sync" @write="write">
      <template #detail>
        <FormItemSelect
          v-if="
            (propertyVisible('class') && implementation === 'class') ||
              (propertyVisible('expression') && implementation === 'expression') ||
              (propertyVisible('delegateExpression') && implementation === 'delegateExpression') ||
              (propertyVisible('external') && implementation === 'external') ||
              (propertyVisible('connector') && implementation === 'connector')
          "
          v-model="implementation"
          :options="implementations"
          label="Implementation"
        />
        <template v-if="implementation">
          <FormItemInput
            v-if="propertyVisible('class') && implementation === 'class'"
            v-model="bo.class"
            label="Java Class"
            :rules="[{ required: true, message: $customTranslate('Must provide a value'), trigger: 'blur' }]"
            prop="class"
          />
          <template v-if="propertyVisible('expression') && implementation === 'expression'">
            <FormItemInput
              v-model="bo.expression"
              label="Expression"
              :rules="[{ required: true, message: $customTranslate('Must provide a value'), trigger: 'blur' }]"
              prop="expression"
            />
            <FormItemInput
              v-model="bo.resultVariable"
              label="Result Variable"
              prop="resultVariable"
            />
          </template>
          <FormItemInput
            v-if="propertyVisible('delegateExpression') && implementation === 'delegateExpression'"
            v-model="bo.delegateExpression"
            label="Delegate Expression"
            :rules="[{ required: true, message: $customTranslate('Must provide a value'), trigger: 'blur' }]"
            prop="delegateExpression"
          />
          <template v-if="propertyVisible('external') && implementation === 'external'">
            <FormItemInput
              v-model="bo.topic"
              label="Topic"
              :rules="[{ required: true, message: $customTranslate('Must provide a value'), trigger: 'blur' }]"
              prop="topic"
            />
            <FormItemInput
              v-model="bo.taskPriority"
              label="Task Priority"
              placeholder="External Task Configuration"
            />
          </template>
          <el-form-item
            v-if="propertyVisible('connector') && implementation === 'connector'"
            :label="$customTranslate('Connector Id')"
            prop="connectorId"
          >
            <el-col :span="12">
              <el-input
                v-model="connectorId"
                :rules="[{ required: true, message: $customTranslate('Must provide a value'), trigger: 'blur' }]"
              />
            </el-col>
            <el-col v-if="connectorId" :span="4" :offset="1">
              <el-badge :value="ioLength">
                <el-button @click="showIO = true">
                  {{ $customTranslate('Input/Output') }}
                </el-button>
              </el-badge>
            </el-col>
          </el-form-item>
        </template>
        <el-form-item v-if="fieldVisible" :label="$customTranslate('Fields')">
          <el-badge :value="fields.length">
            <el-button @click="showField = true">
              {{ $customTranslate('Update') }}
            </el-button>
          </el-badge>
        </el-form-item>
      </template>
    </Activity>
    <InputOutput v-if="showIO" :moddle="moddle" :io="io" @save-io="saveIO" @close="showIO = false" />
    <Field v-if="showField && fieldVisible" v-model="fields" @save-fields="saveFields" @close="showField = false" />
  </div>
</template>

<script>
import Activity from '../../embbed/Activity'
import Field from '../../part/detail/Field'
import InputOutput from '../../part/detail/InputOutput'
import FormItemInput from '../../ui/FormItemInput'
import FormItemSelect from '../../ui/FormItemSelect'
import elementHelper from '../../../mixins/elementHelper'
import { IMPLEMENTATIONS } from '../../../utils/constants'
import { customize } from '../../../utils'
import { is } from 'bpmn-js/lib/util/ModelUtil'
import { addAndRemoveElementsFromExtensionElements } from '../../../utils/creators'

const CONNECTOR_NAME = 'Connector'

export default {
  name: 'ServiceTask',
  components: {
    Activity,
    Field,
    InputOutput,
    FormItemInput,
    FormItemSelect
  },
  mixins: [elementHelper],
  data() {
    return {
      implementation: null,
      implementations: IMPLEMENTATIONS,
      connectorId: null,
      io: {},
      showIO: false,
      fields: [],
      showField: false
    }
  },
  computed: {
    ioLength: {
      get() {
        return (this.io?.inputParameters?.length ?? 0) + (this.io?.outputParameters?.length ?? 0)
      },
      set(newValue) {
        return newValue
      }
    },
    fieldVisible() {
      return this.propertyVisible('field')
    }
  },
  watch: {
    'implementation'(newVal, oldVal) {
      if (oldVal) {
        if (oldVal === 'external') {
          this.write({ type: null, topic: null, taskPriority: null })
        } else if (oldVal === 'connector') {
          const matcher = item => !is(item, customize(CONNECTOR_NAME))
          this.write({ extensionElements:
              this.bo.extensionElements = addAndRemoveElementsFromExtensionElements(this.moddle, this.bo, undefined, matcher)
          })
          this.connectorId = null
          this.io = {}
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
          this.updateTaskPriority(this.bo.taskPriority)
        } else if (newVal === 'connector') {
          this.updateConnector()
        } else {
          if (newVal === 'expression') {
            this.updateResultVariable(this.bo.resultVariable)
          }
          this.updateImplementation()
        }
      }
    },
    'bo.class'() {
      this.updateImplementation()
    },
    'bo.expression'() {
      this.updateImplementation()
    },
    'bo.delegateExpression'() {
      this.updateImplementation()
    },
    'bo.topic'() {
      this.updateExternal()
    },
    'connectorId'() {
      this.updateConnector()
    },
    'bo.resultVariable'(val) {
      this.updateResultVariable(val)
    },
    'bo.taskPriority'(val) {
      this.updateTaskPriority(val)
    }
  },
  created() {
    this.sync()
  },
  methods: {
    sync() {
      let connector
      if ('expression' in this.bo && this.bo.expression) {
        this.implementation = 'expression'
      } else if ('delegateExpression' in this.bo && this.bo.delegateExpression) {
        this.implementation = 'delegateExpression'
      } else if ('topic' in this.bo && this.bo.topic) {
        this.implementation = 'external'
      } else if ((connector = this.bo.extensionElements?.values?.find(item => is(item, customize(CONNECTOR_NAME)))) !== undefined) {
        this.implementation = 'connector'
        this.connectorId = connector.connectorId
        this.io = connector.inputOutput
      } else {
        this.implementation = 'class'
      }
      this.fields = this.bo.extensionElements?.values?.filter(item => is(item, customize('Field'))).map(field => {
        let fieldType
        if ('string' in field) fieldType = 'string'
        else fieldType = 'expression'
        return {
          name: field.name,
          type: fieldType,
          value: field[fieldType]
        }
      }) ?? []
    },
    updateImplementation() {
      if (this.implementation) {
        this.write({ [this.implementation]: this.bo[this.implementation] })
      }
    },
    updateExternal() {
      this.write({ type: 'external', topic: this.bo.topic })
    },
    updateConnector() {
      const
        matcher = item => !is(item, customize(CONNECTOR_NAME)),
        objectsToAdd = this.connectorId ? [this.moddle.create(customize(CONNECTOR_NAME), {
          connectorId: this.connectorId
        })] : undefined
      this.write({ extensionElements:
          this.bo.extensionElements = addAndRemoveElementsFromExtensionElements(this.moddle, this.bo, objectsToAdd, matcher)
      })
    },
    updateResultVariable(val) {
      this.write({ resultVariable: val })
    },
    updateTaskPriority(val) {
      this.write({ taskPriority: val })
    },
    saveIO(io) {
      this.showIO = false
      this.io = io
      this.bo.extensionElements?.values?.filter(item => is(item, customize(CONNECTOR_NAME)))
        .forEach(connector => {
          connector['inputOutput'] = io
          this.write({ extensionElements: this.bo.extensionElements })
        })
    },
    saveFields(fields) {
      this.showField = false
      this.fields = fields
      const
        matcher = item => !is(item, customize('Field')),
        objectsToAdd = fields?.map(field => {
          const fieldElement = this.moddle.create(customize('Field'))
          fieldElement.name = field.name
          fieldElement[field.type] = field.value
          return fieldElement
        })
      this.write({ extensionElements:
          this.bo.extensionElements = addAndRemoveElementsFromExtensionElements(this.moddle, this.bo, objectsToAdd, matcher)
      })
    }
  }
}
</script>
