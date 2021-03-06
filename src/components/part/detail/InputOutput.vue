<template>
  <el-dialog
    :title="$customTranslate('Input/Output')"
    :visible.sync="visible"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
  >
    <el-form ref="form" :model="form" size="mini">
      <el-table :data="form.ios" border>
        <el-table-column :label="$customTranslate('Type')" prop="ioType">
          <template v-slot="scope">
            <el-form-item>
              <el-switch
                v-model="scope.row.ioType"
                :active-text="$customTranslate('Input')"
                :inactive-text="$customTranslate('Output')"
              />
            </el-form-item>
          </template>
        </el-table-column>
        <el-table-column :label="$customTranslate('Local Variable Name')" prop="name">
          <template v-slot="scope">
            <FormItemGeneratedInput
              v-model="scope.row.name"
              :prefix="scope.row.ioType ? 'Input' : 'Output'"
              :prop="'ios.' + scope.$index + '.name'"
              :rules="[{ required: true, message: $customTranslate('Parameter must have a name'), trigger: 'blur' }]"
            />
          </template>
        </el-table-column>
        <el-table-column :label="$customTranslate('Variable Assignment Type')" prop="type">
          <template v-slot="scope">
            <FormItemSelect
              v-model="scope.row.type"
              :options="variableAssignmentTypes"
              :prop="'ios.' + scope.$index + '.type'"
            />
          </template>
        </el-table-column>
        <el-table-column :label="$customTranslate('Config')">
          <template v-slot="scope">
            <FormItemTextArea
              v-if="scope.row.type === 'text'"
              v-model="scope.row.value"
              :prop="'ios.' + scope.$index + '.value'"
              placeholder="Variable Assignment Value"
            />
            <Condition
              v-if="scope.row.type === 'script'"
              v-model="scope.row.condition"
              :condition-type="scope.row.type"
              @save-condition="scope.row.condition_ = $event"
            />
            <template v-if="scope.row.type === 'list'">
              <el-form-item>
                <el-button type="primary" size="mini" icon="el-icon-plus" @click="scope.row.items.push({value: ''})" />
              </el-form-item>
              <el-form-item v-for="(item, idx) in scope.row.items" :key="idx">
                <el-col :span="16">
                  <el-input v-model="item.value" />
                </el-col>
                <el-col :span="8">
                  <el-button icon="el-icon-minus" type="danger" @click="scope.row.items.splice(idx, 1)" />
                </el-col>
              </el-form-item>
            </template>
            <template v-if="scope.row.type === 'map'">
              <el-form-item>
                <el-button type="primary" size="mini" icon="el-icon-plus" @click="scope.row.entries.push({key: '', value: ''})" />
              </el-form-item>
              <el-form-item v-for="(item, idx) in scope.row.entries" :key="idx">
                <el-col :span="8">
                  <el-input v-model="item.key" />
                </el-col>
                <el-col :span="8">
                  <el-input v-model="item.value" />
                </el-col>
                <el-col :span="8">
                  <el-button icon="el-icon-minus" type="danger" @click="scope.row.entries.splice(idx, 1)" />
                </el-col>
              </el-form-item>
            </template>
          </template>
        </el-table-column>
        <el-table-column :label="$customTranslate('Operation')">
          <template v-slot="scope">
            <el-form-item>
              <el-button type="danger" icon="el-icon-minus" circle @click="remove(scope.$index)" />
            </el-form-item>
          </template>
        </el-table-column>
      </el-table>
    </el-form>
    <span slot="footer">
      <el-button type="info" @click="close">{{ $customTranslate('Cancel') }}</el-button>
      <el-button type="primary" icon="el-icon-plus" @click="add(true)">{{ $customTranslate('Input Parameters') }}</el-button>
      <el-button type="primary" icon="el-icon-plus" @click="add(false)">{{ $customTranslate('Output Parameters') }}</el-button>
      <el-button type="success" @click="save">{{ $customTranslate('Confirm') }}</el-button>
    </span>
  </el-dialog>
</template>
<script>
import Condition from './Condition'
import FormItemSelect from '../../ui/FormItemSelect'
import FormItemTextArea from '../../ui/FormItemTextArea'
import FormItemGeneratedInput from '../../ui/FormItemGeneratedInput'
import dialogHelper from '../../../mixins/dialogHelper'
import { VARIABLE_ASSIGNMENT_TYPES } from '../../../utils/constants'
import { customize } from '../../../utils'
import { next } from '../../../utils/tools'
import { is } from 'bpmn-js/lib/util/ModelUtil'

const ELEMENT_NAME = 'InputOutput'

export default {
  name: ELEMENT_NAME,
  components: { Condition, FormItemSelect, FormItemTextArea, FormItemGeneratedInput },
  mixins: [dialogHelper],
  props: {
    moddle: {
      type: Object,
      required: true
    },
    io: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      variableAssignmentTypes: VARIABLE_ASSIGNMENT_TYPES,
      form: {
        ios: []
      }
    }
  },
  created() {
    this.read()
  },
  methods: {
    readIO(listPropertyName, ioType) {
      this.io[listPropertyName]?.forEach(io => {
        const target = {
          ioType: ioType,
          name: io.name
        }
        if (io.definition) {
          if (is(io.definition, customize('Script'))) {
            target.type = 'script'
            target.condition = {
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
        this.form.ios.push(target)
      })
    },
    writeIO() {
      let io
      if (this.form.ios.length) {
        io = this.moddle.create(customize(ELEMENT_NAME))
        this.form.ios.forEach(item => {
          const
            listPropertyName = item.ioType ? 'inputParameters' : 'outputParameters',
            parameterProps = { name: item.name }
          io[listPropertyName] = io[listPropertyName] || []
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
          io[listPropertyName].push(
            this.moddle.create(customize(item.ioType ? 'InputParameter' : 'OutputParameter'),
              parameterProps))
        })
      }
      this.$emit('save-io', io)
    },
    read() {
      if (this.io) {
        this.readIO('inputParameters', true)
        this.readIO('outputParameters', false)
      }
    },
    save() {
      this.$refs['form'].validate().then(() => {
        this.writeIO()
        this.close()
      }).catch(e => console.error(e))
    },
    add(ioType) {
      this.form.ios.push({
        ioType: ioType,
        name: ioType ? next('Input') : next('Output'),
        type: 'text',
        condition: {
          conditionType: 'script',
          scriptType: 'script'
        },
        items: [],
        entries: []
      })
    },
    remove(index) {
      this.form.ios.splice(index, 1)
    }
  }
}

</script>

<style rel="stylesheet/scss" lang="scss">
@import "../../../styles/bpmn.scss";
</style>
