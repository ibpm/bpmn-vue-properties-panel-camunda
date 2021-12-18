<template>
  <el-form-item :label="label" :prop="prop" :rules="rules">
    <el-input v-model="value_" :autosize="{ maxRows: maxRows }" type="textarea" clearable :placeholder="placeholder" @input="input" />
  </el-form-item>
</template>

<script>
import propHelper from '@/mixins/propHelper'

export default {
  name: 'FormItemTextArea',
  mixins: [propHelper],
  props: {
    value: {
      type: String,
      default: null
    },
    maxRows: {
      type: Number,
      default: 5
    }
  }
}
</script>
