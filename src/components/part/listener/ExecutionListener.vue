<template>
  <div>
    <el-dialog
      :title="$customTranslate('Execution Listener')"
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
import areaHelper from '../../../mixins/areaHelper'
import dialogHelper from '../../../mixins/dialogHelper'
import { EVENTS_EXECUTION, LISTENER_TYPES, SCRIPT_TYPES } from '../../../utils/constants'
import { swapArray } from '../../../utils/tools'
import { is } from 'bpmn-js/lib/util/ModelUtil'
import { addAndRemoveElementsFromExtensionElements } from '../../../utils/creators'
import { customize, isResource, isScript } from '../../../utils'

const ELEMENT_NAME = 'ExecutionListener'

export default {
  name: ELEMENT_NAME,
  components: { Field, FormItemInput, FormItemSelect, FormItemTextArea },
  mixins: [areaHelper, dialogHelper],
  data() {
    return {
      events: EVENTS_EXECUTION,
      listenerTypes: LISTENER_TYPES,
      scriptTypes: SCRIPT_TYPES,
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
        event: 'start',
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
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss">
@import "../../../styles/bpmn.scss";
</style>

