<!-- https://docs.camunda.org/manual/latest/reference/bpmn20/tasks/service-task/ -->
<template>
  <div>
    <Activity :moddle="moddle" :form="form" :templates="templates" @sync="sync" @write="write">
      <template #detail>
        <el-form-item :label="$customTranslate('Implementation')" prop="implementation">
          <el-select v-model="implementation" filterable>
            <el-option
              v-for="(item, index) in implementations"
              :key="index"
              :label="$customTranslate(item.name)"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <template v-if="implementation">
          <FormItemInput
            v-if="implementation === 'class'"
            v-model="form.class"
            prop="class"
            :label="$customTranslate('Java Class')"
            :rules="[{ required: true, message: $customTranslate('Must provide a value'), trigger: 'blur' }]"
          />
          <template v-if="implementation === 'expression'">
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
            v-if="implementation === 'delegateExpression'"
            v-model="form.delegateExpression"
            prop="delegateExpression"
            :label="$customTranslate('Delegate Expression')"
            :rules="[{ required: true, message: $customTranslate('Must provide a value'), trigger: 'blur' }]"
          />
          <template v-if="implementation === 'external'">
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
            v-if="implementation === 'connector'"
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
        <el-form-item :label="$customTranslate('Fields')">
          <el-badge :value="fields.length">
            <el-button @click="showField = true">
              {{ $customTranslate('Update') }}
            </el-button>
          </el-badge>
        </el-form-item>
      </template>
    </Activity>
    <InputOutput v-if="showIO" :moddle="moddle" :io="io" @update="update" @close="showIO = false" />
    <Field v-if="showField" v-model="fields" @save-fields="saveFields" @close="showField = false" />
  </div>
</template>

<script>
import Activity from '@/components/embbed/Activity'
import Field from '@/components/part/detail/Field'
import InputOutput from '@/components/part/detail/InputOutput'
import FormItemInput from '@/components/ui/FormItemInput'
import elementHelper from '@/mixins/elementHelper'
import { IMPLEMENTATIONS } from '@/utils/constants'
import { customize } from '@/utils/utils'
import { is } from 'bpmn-js/lib/util/ModelUtil'
import { addAndRemoveElementsFromExtensionElements } from '@/utils/creators'

const CONNECTOR_NAME = 'Connector'

export default {
  name: 'ServiceTask',
  components: {
    Activity,
    Field,
    InputOutput,
    FormItemInput
  },
  mixins: [elementHelper],
  data() {
    return {
      implementation: null,
      implementations: IMPLEMENTATIONS,
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
    }
  },
  watch: {
    'implementation'(newVal, oldVal) {
      if (oldVal) {
        if (oldVal === 'external') {
          this.write({ type: null, topic: null, taskPriority: null })
        } else if (oldVal === 'connector') {
          const matcher = item => !is(item, customize(CONNECTOR_NAME))
          this.form.extensionElements = addAndRemoveElementsFromExtensionElements(this.moddle, this.form, undefined, matcher)
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
    this.sync()
  },
  methods: {
    sync() {
      if ('expression' in this.form && this.form.expression) {
        this.implementation = 'expression'
      } else if ('delegateExpression' in this.form && this.form.delegateExpression) {
        this.implementation = 'delegateExpression'
      } else if ('external' in this.form && this.form.external) {
        this.implementation = 'external'
      } else if ('connector' in this.form && this.form.connector) {
        this.implementation = 'connector'
        this.io = this.form.extensionElements?.values?.find(item => is(item, customize(CONNECTOR_NAME)))?.inputOutput
      } else {
        this.implementation = 'class'
      }
    },
    updateImplementation() {
      if (this.implementation) {
        this.write({ [this.implementation]: this.form[this.implementation] })
      }
    },
    updateExternal() {
      this.write({ type: 'external', topic: this.form.topic })
    },
    updateConnector() {
      const
        matcher = item => !is(item, customize(CONNECTOR_NAME)),
        objectsToAdd = this.form.connectorId ? [this.moddle.create(customize(CONNECTOR_NAME), {
          connectorId: this.form.connectorId
        })] : undefined
      this.form.extensionElements = addAndRemoveElementsFromExtensionElements(this.moddle, this.form, objectsToAdd, matcher)
    },
    updateResultVariable(val) {
      this.write({ resultVariable: val })
    },
    updateTaskPriority(val) {
      this.write({ taskPriority: val })
    },
    update(io) {
      this.showIO = false
      this.io = io
      this.form.extensionElements?.values?.filter(item => is(item, customize(CONNECTOR_NAME)))
        .forEach(connector => {
          connector['inputOutput'] = io
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
      this.form.extensionElements = addAndRemoveElementsFromExtensionElements(this.moddle, this.form, objectsToAdd, matcher)
    }
  }
}
</script>
