<template>
  <el-form-item :label="$customTranslate(label)" :prop="prop" :rules="rules">
    <el-input
      v-model="value_"
      :placeholder="$customTranslate(placeholder)"
      :disabled="disabled"
      clearable
      @input="input"
      @change="change"
    />
  </el-form-item>
</template>

<script>
import propHelper from '../../mixins/propHelper'

export default {
  name: 'FormItemInput',
  mixins: [propHelper],
  props: {
    value: {
      type: String,
      default: null
    }
  }
}
</script>
