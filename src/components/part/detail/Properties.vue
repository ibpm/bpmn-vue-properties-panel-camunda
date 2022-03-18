<template>
  <el-dialog
    :title="$customTranslate('Properties')"
    :visible.sync="visible"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
  >
    <el-form ref="form" :model="form" size="mini">
      <el-table :data="form.properties" border>
        <el-table-column v-if="isForm" :label="$customTranslate('Id')">
          <template v-slot="scope">
            <FormItemGeneratedInput v-model="scope.row.id" prefix="Property" />
          </template>
        </el-table-column>
        <el-table-column v-else :label="$customTranslate('Name')">
          <template v-slot="scope">
            <FormItemInput v-model="scope.row.name" />
          </template>
        </el-table-column>
        <el-table-column :label="$customTranslate('Value')">
          <template v-slot="scope">
            <FormItemInput v-model="scope.row.value" />
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
      <el-button type="primary" @click="add">{{ $customTranslate('Add') }}</el-button>
      <el-button type="success" @click="save">{{ $customTranslate('Confirm') }}</el-button>
    </span>
  </el-dialog>
</template>
<script>
import FormItemInput from '../../ui/FormItemInput'
import FormItemGeneratedInput from '../../ui/FormItemGeneratedInput'
import dialogHelper from '../../../mixins/dialogHelper'
import { VARIABLE_ASSIGNMENT_TYPES } from '../../../utils/constants'
import { customize } from '../../../utils'
import { next } from '../../../utils/tools'

const ELEMENT_NAME = 'Properties'

export default {
  name: ELEMENT_NAME,
  components: { FormItemInput, FormItemGeneratedInput },
  mixins: [dialogHelper],
  props: {
    moddle: {
      type: Object,
      required: true
    },
    value: {
      type: Array,
      default: () => []
    },
    isForm: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      variableAssignmentTypes: VARIABLE_ASSIGNMENT_TYPES,
      form: {
        properties: this.value
      }
    }
  },
  methods: {
    writeProperties() {
      let propertiesElement
      if (this.form.properties.length) {
        propertiesElement = this.moddle.create(customize(ELEMENT_NAME),
          {
            'values':
              this.form.properties.map(property => {
                const item = { value: property.value }
                if (this.isForm) {
                  item.id = property.id
                } else {
                  item.name = property.name
                }
                return this.moddle.create(customize('Property'), item)
              })
          })
      }
      this.$emit('write-properties', propertiesElement)
    },
    save() {
      this.$refs['form'].validate().then(() => {
        this.writeProperties()
        this.close()
      }).catch(e => console.error(e))
    },
    add() {
      const item = { value: '' }
      if (this.isForm) {
        item.id = next(ELEMENT_NAME)
      } else {
        item.name = ''
      }
      this.form.properties.push(item)
    },
    remove(index) {
      this.form.properties.splice(index, 1)
    }
  }
}

</script>

<style rel="stylesheet/scss" lang="scss">
@import "../../../styles/bpmn.scss";
</style>
