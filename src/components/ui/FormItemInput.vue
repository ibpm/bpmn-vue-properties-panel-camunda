<template>
  <el-form-item :label="$customTranslate(label)" :prop="prop" :rules="rules">
    <el-input v-model="value_" :placeholder="$customTranslate(placeholder)" clearable @input="input" />
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
