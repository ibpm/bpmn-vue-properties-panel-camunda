<template>
  <el-form-item :label="$customTranslate(label)" :prop="prop" :rules="rules">
    <el-select
      v-model="value_"
      :placeholder="$customTranslate(placeholder)"
      :disabled="disabled"
      clearable
      filterable
      @input="input"
      @change="change"
    >
      <el-option
        v-for="(item, index) in options"
        :key="index"
        :label="$customTranslate(isStr(item) ? item.name : item)"
        :value="isStr(item) ? item.value : item"
      />
    </el-select>
  </el-form-item>
</template>

<script>
import propHelper from '../../mixins/propHelper'

export default {
  name: 'FormItemSelect',
  mixins: [propHelper],
  props: {
    value: {
      type: String,
      default: null
    },
    options: {
      type: Array,
      default: () => []
    }
  },
  methods: {
    isStr(item) {
      return typeof item === 'object' && 'name' in item
    }
  }
}
</script>
