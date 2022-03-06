<template>
  <el-dialog
    :title="$customTranslate('Field Injection')"
    :visible.sync="dialogVisible"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    @closed="$emit('close')"
  >
    <el-form ref="form_" :model="form_" size="mini">
      <el-table :data="form_.records" border>
        <el-table-column :label="$customTranslate('Type')" prop="ioType">
          <template slot-scope="scope">
            <el-form-item>
              <el-switch
                v-model="scope.row.ioType"
                :active-text="$customTranslate('In Mapping')"
                :inactive-text="$customTranslate('Out Mapping')"
              />
            </el-form-item>
          </template>
        </el-table-column>
        <el-table-column :label="$customTranslate('Type')" prop="type">
          <template slot-scope="scope">
            <el-form-item :prop="'records.' + scope.$index + '.type'">
              <el-select v-model="scope.row.type">
                <el-option
                  v-for="(item, index) in variableTypes"
                  :key="index"
                  :label="$customTranslate(item.name)"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </template>
        </el-table-column>
        <el-table-column :label="$customTranslate('Source')" prop="source">
          <template v-if="scope.row.type !== 'variables'" slot-scope="scope">
            <FormItemInput
              v-model="scope.row.source"
              :prop="'records.' + scope.$index + '.source'"
              :rules="[{ required: true, message: $customTranslate('Must provide a value'), trigger: 'blur' }]"
            />
          </template>
        </el-table-column>
        <el-table-column :label="$customTranslate('Target')" prop="target">
          <template v-if="scope.row.type !== 'variables'" slot-scope="scope">
            <FormItemInput
              v-model="scope.row.target"
              :prop="'records.' + scope.$index + '.target'"
              :placeholder="$customTranslate(variableTypes.find(item => item.value === scope.row.type).name)"
              :rules="[{ required: true, message: $customTranslate('Must provide a value'), trigger: 'blur' }]"
            />
          </template>
        </el-table-column>
        <el-table-column :label="$customTranslate('Local')">
          <template slot-scope="scope">
            <FormItemSwitch
              v-model="scope.row.local"
              :prop="'records.' + scope.$index + '.local'"
            />
          </template>
        </el-table-column>
        <el-table-column :label="$customTranslate('Operation')">
          <template slot-scope="scope">
            <el-form-item>
              <el-button type="danger" icon="el-icon-minus" circle @click="remove(scope.$index)" />
            </el-form-item>
          </template>
        </el-table-column>
      </el-table>
    </el-form>
    <span slot="footer">
      <el-button type="primary" icon="el-icon-plus" @click="add(true)">{{ $customTranslate('Input Parameters') }}</el-button>
      <el-button type="primary" icon="el-icon-plus" @click="add(false)">{{ $customTranslate('Output Parameters') }}</el-button>
      <el-button type="success" @click="save">{{ $customTranslate('Confirm') }}</el-button>
    </span>
  </el-dialog>
</template>
<script>
import FormItemInput from '@/components/ui/FormItemInput'
import FormItemSwitch from '@/components/ui/FormItemSwitch'
import areaHelper from '@/mixins/areaHelper'
import { VARIABLE_TYPES } from '@/utils/constants'
import { is, isAny } from 'bpmn-js/lib/util/ModelUtil'
import { customize } from '@/utils/helper'

export default {
  name: 'Variable',
  components: { FormItemInput, FormItemSwitch },
  mixins: [areaHelper],
  data() {
    return {
      variableTypes: VARIABLE_TYPES,
      dialogVisible: true,
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
      this.form_.records = []
      let values
      if ((values = this.form.extensionElements?.values)?.length) {
        this.readIO(values, true)
        this.readIO(values, false)
      }
    },
    update() {
      let extensionElements = this.form.extensionElements || this.moddle.create('bpmn:ExtensionElements')
      extensionElements.values = extensionElements
        .values?.filter(item => !isAny(item, [customize('In'), customize('Out')])) ?? []
      if (this.form_.records?.length) {
        this.form_.records.forEach(row => {
          const data = this.moddle.create(customize(row.ioType ? 'In' : 'Out'))
          if (row.type === 'source') {
            data.source = row.source
          } else if (row.type === 'sourceExpression') {
            data.sourceExpression = row.source
          } else if (row.type === 'variables') {
            data.variables = 'all'
          }
          data.local = row.local
          data.target = row.target
          extensionElements.values.push(data)
        })
      } else if (!extensionElements.values.length) {
        extensionElements = null
      }
      this.form.extensionElements = extensionElements
      this.write({ extensionElements: extensionElements })
    },
    save() {
      this.$refs['form_'].validate().then(() => {
        this.update()
        this.dialogVisible = false
      }).catch(e => console.error(e))
    },
    add(ioType) {
      this.form_.records.push({
        ioType: ioType,
        type: 'source'
      })
    },
    remove(index) {
      this.form_.records.splice(index, 1)
    },
    readIO(values, ioType) {
      values
        .filter(item => is(item, customize(ioType ? 'In' : 'Out')))
        .forEach(row => {
          let type, source
          if ('source' in row) {
            type = 'source'
            source = row.source
          } else if ('sourceExpression' in row) {
            type = 'sourceExpression'
            source = row.sourceExpression
          } else if ('variables' in row) {
            type = 'variables'
          }
          this.form_.records.push({
            ioType: ioType,
            type: type,
            source: source,
            target: row.target,
            local: row.local
          })
        })
    }
  }
}
</script>
