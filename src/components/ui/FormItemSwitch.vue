<template>
  <el-form-item :label="label" :prop="prop" :rules="rules">
    <el-switch v-model="value_" @input="input" />
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
