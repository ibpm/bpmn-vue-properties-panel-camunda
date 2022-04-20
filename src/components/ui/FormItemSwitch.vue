<template>
  <el-form-item :label="$customTranslate(label)" :prop="prop" :rules="rules">
    <el-switch v-model="value_" :disabled="disabled" @input="input" @change="change" />
  </el-form-item>
</template>

<script>
import propHelper from '../../mixins/propHelper'

export default {
  name: 'FormItemSwitch',
  mixins: [propHelper],
  props: {
    value: {
      type: Boolean,
      default: null
    }
  }
}
</script>
