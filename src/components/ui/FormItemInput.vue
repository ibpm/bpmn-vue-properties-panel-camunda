<template>
  <el-form-item :label="label" :prop="prop" :rules="rules">
    <el-input v-model="value_" clearable :placeholder="placeholder" @input="input" />
  </el-form-item>
</template>

<script>
import propHelper from '@/mixins/propHelper'

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
