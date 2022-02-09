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
    <InputOutput v-if="showIO" :moddle="moddle" :io="io" @writeSub="writeSub" @syncLength="syncLength" />
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

const CONNECTOR_NAME = 'Connector'

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
      io: {},
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
        getBusinessObject(this.element).extensionElements?.values?.filter(item => is(item, customize(CONNECTOR_NAME)))
          .forEach(connector => {
            this.io = connector['inputOutput']
          })
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
    writeSub(io) {
      this.showIO = false
      getBusinessObject(this.element).extensionElements?.values?.filter(item => is(item, customize(CONNECTOR_NAME)))
        .forEach(connector => {
          this.io = io
          connector['inputOutput'] = io
        })
    },
    syncLength(ioLength) {
      this.ioLength = ioLength
    }
  }
}
</script>
