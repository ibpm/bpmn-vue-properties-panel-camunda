<template>
  <div>
    <el-dialog
      :title="$customTranslate('Execution Listener')"
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
    <Field v-if="showField" v-model="currentRow.fields" @close="saveFields" />
  </div>
</template>
<script>
import Field from '@/components/part/detail/Field'
import FormItemInput from '@/components/ui/FormItemInput'
import FormItemTextArea from '@/components/ui/FormItemTextArea'
import areaHelper from '@/mixins/areaHelper'
import { isScript, isResource, customize } from '@/utils/helper'
import { is } from 'bpmn-js/lib/util/ModelUtil'
import { EVENTS_EXECUTION, LISTENER_TYPES, SCRIPT_TYPES } from '@/utils/constants'
import { swapArray } from '@/utils/tools'

const ELEMENT_NAME = 'ExecutionListener'

export default {
  name: ELEMENT_NAME,
  components: { Field, FormItemInput, FormItemTextArea },
  mixins: [areaHelper],
  data() {
    return {
      events: EVENTS_EXECUTION,
      listenerTypes: LISTENER_TYPES,
      scriptTypes: SCRIPT_TYPES,
      dialogVisible: true,
      showField: false,
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
      let extensionElements = this.form.extensionElements || this.moddle.create('bpmn:ExtensionElements')
      extensionElements.values = extensionElements.values?.filter(item => !is(item, customize(ELEMENT_NAME))) ?? []
      if (this.form_.records?.length) {
        this.form_.records.forEach(row => {
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
        event: 'start',
        listenerType: 'class'
      }
    },
    save() {
      this.$refs['form_'].validate().then(() => {
        this.update()
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
    configFields(index) {
      this.currentRow = this.form_.records[index]
      this.showField = true
    },
    saveFields(fields) {
      this.currentRow.fields = fields
      this.showField = false
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss">
@import "~@/styles/bpmn.scss";
</style>

