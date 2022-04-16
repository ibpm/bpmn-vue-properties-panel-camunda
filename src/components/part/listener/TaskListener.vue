<template>
  <div>
    <el-dialog
      :title="$customTranslate('Task Listener')"
      :visible.sync="visible"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
    >
      <el-form ref="form" :model="form" size="mini">
        <el-table :data="form.records" border>
          <el-table-column :label="$customTranslate('Event Type')" prop="event">
            <template v-slot="scope">
              <FormItemSelect
                v-model="scope.row.event"
                :options="events"
                :prop="'records.' + scope.$index + '.event'"
              />
              <FormItemSelect
                v-model="scope.row.timerDefinitionType"
                :options="timerDefinitionTypes"
                placeholder="Timer Definition Type"
                :prop="'records.' + scope.$index + '.timerDefinitionType'"
                :rules="[{ required: true, message: $customTranslate('Must provide a value'), trigger: 'blur' }]"
              />
            </template>
          </el-table-column>
          <el-table-column :label="$customTranslate('Listener Type')" prop="listenerType">
            <template v-slot="scope">
              <FormItemSelect
                v-model="scope.row.listenerType"
                :options="listenerTypes"
                :prop="'records.' + scope.$index + '.listenerType'"
              />
              <FormItemInput
                v-if="showScript(scope.row.listenerType)"
                v-model="scope.row.scriptFormat"
                :prop="'records.' + scope.$index + '.scriptFormat'"
                placeholder="Script Format"
                :rules="[{ required: true, message: $customTranslate('Must provide a value'), trigger: 'blur' }]"
              />
            </template>
          </el-table-column>
          <el-table-column :label="$customTranslate('Config')">
            <template v-slot="scope">
              <FormItemInput
                v-if="!showScript(scope.row.listenerType)"
                v-model="scope.row.config"
                :prop="'records.' + scope.$index + '.config'"
                :placeholder="listenerTypes.find(item => item.value === scope.row.listenerType).name"
                :rules="[{ required: true, message: $customTranslate('Must provide a value'), trigger: 'blur' }]"
              />
              <template v-else>
                <FormItemSelect
                  v-model="scope.row.scriptType"
                  :options="scriptTypes"
                  :prop="'records.' + scope.$index + '.scriptType'"
                  placeholder="Script Type"
                />
                <FormItemTextArea
                  v-if="!showResource(scope.row.scriptType)"
                  v-model="scope.row.config"
                  :prop="'records.' + scope.$index + '.config'"
                  placeholder="Script"
                />
                <FormItemInput
                  v-else
                  v-model="scope.row.config"
                  :prop="'records.' + scope.$index + '.config'"
                  placeholder="Resource"
                />
              </template>
            </template>
          </el-table-column>
          <el-table-column prop="listenerId" :label="$customTranslate('Listener Id')">
            <template v-slot="scope">
              <FormItemGeneratedInput
                v-model="scope.row.listenerId"
                :prop="'records.' + scope.$index + '.listenerId'"
              />
              <FormItemInput
                v-if="showTimeout(scope.row.event)"
                v-model="scope.row.timerDefinition"
                :prop="'records.' + scope.$index + '.timerDefinition'"
                placeholder="Timer Definition"
                :rules="[{ required: true, message: $customTranslate('Must provide a value'), trigger: 'blur' }]"
              />
            </template>
          </el-table-column>
          <el-table-column :label="$customTranslate('Fields')">
            <template v-slot="scope">
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
            <template v-slot="scope">
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
        <el-button type="info" @click="close">{{ $customTranslate('Cancel') }}</el-button>
        <el-button type="primary" @click="add()">{{ $customTranslate('Add') }}</el-button>
        <el-button type="success" @click="save">{{ $customTranslate('Save') }}</el-button>
      </span>
    </el-dialog>
    <Field v-if="showField" v-model="currentRow.fields" @save-fields="saveFields" @close="showField = false" />
  </div>
</template>
<script>
import Field from '../detail/Field'
import FormItemInput from '../../ui/FormItemInput'
import FormItemSelect from '../../ui/FormItemSelect'
import FormItemTextArea from '../../ui/FormItemTextArea'
import FormItemGeneratedInput from '../../ui/FormItemGeneratedInput'
import areaHelper from '../../../mixins/areaHelper'
import dialogHelper from '../../../mixins/dialogHelper'
import { EVENTS_TASK, LISTENER_TYPES, SCRIPT_TYPES, TIMER_DEFINITION_TYPES } from '../../../utils/constants'
import { swapArray, next } from '../../../utils/tools'
import { is } from 'bpmn-js/lib/util/ModelUtil'
import { addAndRemoveElementsFromExtensionElements, createFormalExpression } from '../../../utils/creators'
import { customize, isResource, isScript } from '../../../utils'

const ELEMENT_NAME = 'TaskListener'

export default {
  name: ELEMENT_NAME,
  components: { Field, FormItemInput, FormItemSelect, FormItemTextArea, FormItemGeneratedInput },
  mixins: [areaHelper, dialogHelper],
  data() {
    return {
      events: EVENTS_TASK,
      listenerTypes: LISTENER_TYPES,
      scriptTypes: SCRIPT_TYPES,
      timerDefinitionTypes: TIMER_DEFINITION_TYPES,
      showField: false,
      currentRow: null,
      form: {
        records: []
      }
    }
  },
  created() {
    this.read()
  },
  methods: {
    read() {
      this.form.records = this.bo.extensionElements?.values
        .filter(item => is(item, customize(ELEMENT_NAME)))
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
    update() {
      const matcher = item => !is(item, customize(ELEMENT_NAME))
      let objectsToAdd
      if (this.form.records?.length) {
        objectsToAdd = this.form.records.map(row => {
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
          return data
        })
      }
      this.write({ extensionElements:
          this.bo.extensionElements = addAndRemoveElementsFromExtensionElements(this.moddle, this.bo, objectsToAdd, matcher)
      })
    },
    initRow() {
      return {
        event: 'create',
        listenerType: 'class'
      }
    },
    save() {
      this.$refs['form'].validate().then(() => {
        this.update()
        this.close()
      }).catch(e => console.error(e))
    },
    add() {
      this.form.records.push(this.initRow())
    },
    remove(index) {
      this.form.records.splice(index, 1)
    },
    up(index) {
      if (index > 0) {
        swapArray(this.form.records, index, index - 1)
      }
    },
    down(index) {
      if (index < this.form.records.length - 1) {
        swapArray(this.form.records, index, index + 1)
      }
    },
    showScript(listenerType) {
      return isScript(listenerType)
    },
    showResource(scriptType) {
      return isResource(scriptType)
    },
    configFields(index) {
      this.currentRow = this.form.records[index]
      this.showField = true
    },
    saveFields(fields) {
      this.currentRow.fields = fields
    },
    showTimeout(event) {
      return event === 'timeout'
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss">
@import "../../../styles/bpmn.scss";
</style>

