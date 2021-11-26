<template>
  <el-form-item :label="label" :prop="prop">
    <el-input v-model="value_" clearable @input="input" />
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

<style scoped>

</style>
