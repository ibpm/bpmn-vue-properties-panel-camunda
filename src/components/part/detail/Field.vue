<template>
  <el-dialog
    :title="$customTranslate('Field Injection')"
    :visible.sync="dialogVisible"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    @closed="$emit('close', form.records)"
  >
    <el-form ref="form" :model="form" size="mini">
      <el-table :data="form.records" border>
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
      form: {
        records: this.value
      }
    }
  },
  methods: {
    save() {
      this.$refs['form'].validate().then(() => {
        this.dialogVisible = false
      }).catch(e => console.error(e))
    },
    add() {
      this.form.records.push({
        type: 'string'
      })
    },
    remove(index) {
      this.form.records.splice(index, 1)
    }
  }
}
</script>
