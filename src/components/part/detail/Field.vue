<template>
  <div>
    <el-dialog
      :title="$customTranslate('Field Injection')"
      :visible.sync="dialogVisible"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
      @closed="$emit('close', subForm.records)"
    >
      <el-form ref="subForm" :model="subForm" size="mini">
        <el-table :data="subForm.records" border>
          <el-table-column :label="$customTranslate('Name')" prop="name">
            <template slot-scope="scope">
              <FormItemInput
                v-model="scope.row.name"
                :prop="'records.' + scope.$index + '.name'"
                :rules="[{ required: true, message: $customTranslate('Parameter must have a name'), trigger: 'blur' }]"
              />
            </template>
          </el-table-column>
          <el-table-column :label="$customTranslate('Type')" prop="type">
            <template slot-scope="scope">
              <el-form-item :prop="'records.' + scope.$index + '.type'">
                <el-select v-model="scope.row.type">
                  <el-option
                    v-for="(item, index) in fieldTypes"
                    :key="index"
                    :label="$customTranslate(item.name)"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
            </template>
          </el-table-column>
          <el-table-column :label="$customTranslate('Value')">
            <template slot-scope="scope">
              <FormItemTextArea
                v-model="scope.row.value"
                :prop="'records.' + scope.$index + '.value'"
                :placeholder="$customTranslate(fieldTypes.find(item => item.value === scope.row.type).name)"
                :rules="[{ required: true, message: $customTranslate('Must provide a value'), trigger: 'blur' }]"
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
        <el-button type="primary" @click="add()">{{ $customTranslate('Add') }}</el-button>
        <el-button type="success" @click="save">{{ $customTranslate('Confirm') }}</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import FormItemInput from '@/components/ui/FormItemInput'
import FormItemTextArea from '@/components/ui/FormItemTextArea'
import { FIELD_TYPES } from '@/utils/constants'

export default {
  name: 'Field',
  components: { FormItemInput, FormItemTextArea },
  props: {
    value: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      fieldTypes: FIELD_TYPES,
      dialogVisible: true,
      subForm: {
        records: this.value
      }
    }
  },
  methods: {
    initRow() {
      return {
        type: 'string'
      }
    },
    save() {
      this.$refs['subForm'].validate().then(() => {
        this.dialogVisible = false
      }).catch(e => console.error(e))
    },
    add() {
      this.subForm.records.push(this.initRow())
    },
    remove(index) {
      this.subForm.records.splice(index, 1)
    }
  }
}
</script>
