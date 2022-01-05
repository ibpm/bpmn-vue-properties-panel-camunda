<template>
  <div>
    <el-dialog
      :title="$customTranslate('Task Listener')"
      :visible.sync="dialogVisible"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
      @closed="$emit('close')"
    >
      <el-form ref="form_" :model="form_" size="mini">
        <el-table :data="form_.records" border>
          <el-table-column :label="$customTranslate('Event Type')" prop="event">
            <template slot-scope="scope">
              <el-form-item :prop="'records.' + scope.$index + '.event'">
                <el-select v-model="scope.row.event">
                  <el-option v-for="(item, index) in events" :key="index" :label="$customTranslate(item)" :value="item" />
                </el-select>
              </el-form-item>
              <el-form-item
                v-if="showTimeout(scope.row.event)"
                :prop="'records.' + scope.$index + '.timerDefinitionType'"
                :rules="[{ required: true, message: $customTranslate('Must provide a value'), trigger: 'blur' }]"
              >
                <el-select
                  v-model="scope.row.timerDefinitionType"
                  :placeholder="$customTranslate('Timer Definition Type')"
                >
                  <el-option
                    v-for="(item, index) in timerDefinitionTypes"
                    :key="index"
                    :label="$customTranslate(item.name)"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
            </template>
          </el-table-column>
          <el-table-column :label="$customTranslate('Listener Type')" prop="listenerType">
            <template slot-scope="scope">
              <el-form-item :prop="'records.' + scope.$index + '.listenerType'">
                <el-select v-model="scope.row.listenerType">
                  <el-option
                    v-for="(item, index) in listenerTypes"
                    :key="index"
                    :label="$customTranslate(item.name)"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
              <FormItemInput
                v-if="showScript(scope.row.listenerType)"
                v-model="scope.row.scriptFormat"
                :prop="'records.' + scope.$index + '.scriptFormat'"
                :placeholder="$customTranslate('Script Format')"
                :rules="[{ required: true, message: $customTranslate('Must provide a value'), trigger: 'blur' }]"
              />
            </template>
          </el-table-column>
          <el-table-column :label="$customTranslate('Config')">
            <template slot-scope="scope">
              <FormItemInput
                v-if="!showScript(scope.row.listenerType)"
                v-model="scope.row.config"
                :prop="'records.' + scope.$index + '.config'"
                :placeholder="$customTranslate(listenerTypes.find(item => item.value === scope.row.listenerType).name)"
                :rules="[{ required: true, message: $customTranslate('Must provide a value'), trigger: 'blur' }]"
              />
              <template v-else>
                <el-form-item :prop="'records.' + scope.$index + '.scriptType'">
                  <el-select v-model="scope.row.scriptType" :placeholder="$customTranslate('Script Type')">
                    <el-option
                      v-for="(item, index) in scriptTypes"
                      :key="index"
                      :label="$customTranslate(item.name)"
                      :value="item.value"
                    />
                  </el-select>
                </el-form-item>
                <FormItemTextArea
                  v-if="!showResource(scope.row.scriptType)"
                  v-model="scope.row.config"
                  :prop="'records.' + scope.$index + '.config'"
                  :placeholder="$customTranslate('Script')"
                />
                <FormItemInput
                  v-else
                  v-model="scope.row.config"
                  :prop="'records.' + scope.$index + '.config'"
                  :placeholder="$customTranslate('Resource')"
                />
              </template>
            </template>
          </el-table-column>
          <el-table-column prop="listenerId" :label="$customTranslate('Listener Id')">
            <template slot-scope="scope">
              <FormItemGeneratedInput
                v-model="scope.row.listenerId"
                :prop="'records.' + scope.$index + '.listenerId'"
              />
              <FormItemInput
                v-if="showTimeout(scope.row.event)"
                v-model="scope.row.timerDefinition"
                :prop="'records.' + scope.$index + '.timerDefinition'"
                :placeholder="$customTranslate('Timer Definition')"
                :rules="[{ required: true, message: $customTranslate('Must provide a value'), trigger: 'blur' }]"
              />
            </template>
          </el-table-column>
          <el-table-column :label="$customTranslate('Fields')">
            <template slot-scope="scope">
              <el-form-item>
                <el-badge :value="scope.row.fields ? scope.row.fields.length : 0">
                  <el-button type="primary" @click="configFields(scope.$index)">
                    {{ $customTranslate('Fields') }}
                  </el-button>
                </el-badge>
              </el-form-item>
            </template>
          </el-table-column>
          <el-table-column :label="$customTranslate('Operation')">
            <template slot-scope="scope">
              <el-form-item>
                <el-button type="danger" icon="el-icon-minus" circle @click="remove(scope.$index)" />
                <el-button type="primary" icon="el-icon-arrow-up" circle @click="up(scope.$index)" />
                <el-button type="primary" icon="el-icon-arrow-down" circle @click="down(scope.$index)" />
              </el-form-item>
            </template>
          </el-table-column>
        </el-table>
      </el-form>
      <span slot="footer">
        <el-button type="primary" @click="add()">{{ $customTranslate('Add') }}</el-button>
        <el-button type="success" @click="save">{{ $customTranslate('Save') }}</el-button>
      </span>
    </el-dialog>
    <Field v-if="fieldDialogVisible" v-model="currentRow.fields" @close="saveFields" />
  </div>
</template>
<script>
import Field from '@/components/part/detail/Field'
import FormItemInput from '@/components/ui/FormItemInput'
import FormItemTextArea from '@/components/ui/FormItemTextArea'
import FormItemGeneratedInput from '@/components/ui/FormItemGeneratedInput'
import areaHelper from '@/mixins/areaHelper'
import { isScript, isResource, typeMatch, customize, createFormalExpression } from '@/utils/helper'
import { EVENTS_TASK, LISTENER_TYPES, SCRIPT_TYPES, TIMER_DEFINITION_TYPES } from '@/utils/constants'
import { swapArray, next } from '@/utils/tools'

const ELEMENT_NAME = 'TaskListener'

export default {
  name: ELEMENT_NAME,
  components: { Field, FormItemInput, FormItemTextArea, FormItemGeneratedInput },
  mixins: [areaHelper],
  data() {
    return {
      events: EVENTS_TASK,
      listenerTypes: LISTENER_TYPES,
      scriptTypes: SCRIPT_TYPES,
      timerDefinitionTypes: TIMER_DEFINITION_TYPES,
      dialogVisible: true,
      fieldDialogVisible: false,
      currentRow: null,
      form_: {
        records: []
      }
    }
  },
  created() {
    this.read()
  },
  methods: {
    read() {
      this.form_.records = this.form.extensionElements?.values
        .filter(item => typeMatch(item.$type, ELEMENT_NAME))
        .map(row => {
          const data = {
            event: row.event,
            listenerId: row.id,
            fields: row.fields?.map(field => {
              let fieldType
              if ('string' in field) fieldType = 'string'
              else fieldType = 'expression'
              return {
                name: field.name,
                type: fieldType,
                value: field[fieldType]
              }
            }) ?? []
          }
          let listenerType, config
          if ('class' in row) {
            listenerType = 'class'
            config = row[listenerType]
          } else if ('expression' in row) {
            listenerType = 'expression'
            config = row[listenerType]
          } else if ('delegateExpression' in row) {
            listenerType = 'delegateExpression'
            config = row[listenerType]
          } else {
            listenerType = 'script'
            data.scriptFormat = row.script.scriptFormat
            if (row.script.resource) {
              data.scriptType = 'resource'
              config = row.script.resource
            } else {
              data.scriptType = 'script'
              config = row.script.value
            }
          }
          data.listenerType = listenerType
          data.config = config
          if (row.event === 'timeout' && row.eventDefinitions?.length) {
            const timerEventDefinition = row.eventDefinitions[0]
            if ('timeDate' in timerEventDefinition) {
              data.timerDefinitionType = 'timeDate'
            } else if ('timeDuration' in timerEventDefinition) {
              data.timerDefinitionType = 'timeDuration'
            } else if ('timeCycle' in timerEventDefinition) {
              data.timerDefinitionType = 'timeCycle'
            } else {
              console.warn('Wrong timerDefinitionType in ' + timerEventDefinition + '?')
            }
            data.timerDefinition = timerEventDefinition[data.timerDefinitionType]?.body
          }
          return data
        }) ?? []
    },
    writeSub() {
      let extensionElements = this.form_.extensionElements || this.moddle.create('bpmn:ExtensionElements')
      extensionElements.values = extensionElements.values?.filter(item => !typeMatch(item.$type, ELEMENT_NAME)) ?? []
      if (this.form_.records?.length) {
        this.form_.records.forEach(row => {
          const data = this.moddle.create(customize(ELEMENT_NAME))
          data.event = row.event
          if (row.event === 'timeout') {
            const timerEventDefinition = this.moddle.create('bpmn:TimerEventDefinition', {
              id: next('TimerEventDefinition'),
              [row.timerDefinitionType]: createFormalExpression(this.moddle, {
                body: row.timerDefinition
              })
            })
            data.eventDefinitions = [timerEventDefinition]
          }
          if (row.scriptType) {
            const attrs = {}
            attrs.scriptFormat = row.scriptFormat
            if (this.showResource(row.scriptType)) {
              attrs.resource = row.config
            } else {
              attrs.value = row.config
            }
            data.script = this.moddle.create(customize('Script'), attrs)
          } else {
            data[row.listenerType] = row.config
          }
          data.id = row.listenerId
          if (row.fields?.length) {
            row.fields.forEach(field => {
              const fieldElement = this.moddle.create(customize('Field'))
              fieldElement.name = field.name
              fieldElement[field.type] = field.value
              data.get('fields').push(fieldElement)
            })
          }
          extensionElements.values.push(data)
        })
      } else if (!extensionElements.values.length) {
        extensionElements = null
      }
      this.form.extensionElements = extensionElements
      this.write({ extensionElements: extensionElements })
    },
    initRow() {
      return {
        event: 'create',
        listenerType: 'class'
      }
    },
    save() {
      this.$refs['form_'].validate().then(() => {
        this.writeSub()
        this.dialogVisible = false
      }).catch(e => console.error(e))
    },
    add() {
      this.form_.records.push(this.initRow())
    },
    remove(index) {
      this.form_.records.splice(index, 1)
    },
    up(index) {
      if (index > 0) {
        swapArray(this.form_.records, index, index - 1)
      }
    },
    down(index) {
      if (index < this.form_.records.length - 1) {
        swapArray(this.form_.records, index, index + 1)
      }
    },
    showScript(listenerType) {
      return isScript(listenerType)
    },
    showResource(scriptType) {
      return isResource(scriptType)
    },
    showTimeout(event) {
      return event === 'timeout'
    },
    configFields(index) {
      this.currentRow = this.form_.records[index]
      this.fieldDialogVisible = true
    },
    saveFields(fields) {
      this.currentRow.fields = fields
      this.fieldDialogVisible = false
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss">
@import "~@/styles/bpmn.scss";
</style>

