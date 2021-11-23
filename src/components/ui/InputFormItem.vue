<template>
  <el-form-item :label="label" :prop="prop">
    <el-input v-model="value" clearable />
  </el-form-item>
</template>

<script>

export default {
  name: 'InputFormItem',
  props: {
    label: {

      type: String,
      default: null
    },
    prop: {
      type: String,
      default: null
    },
    value: {
      type: String,
      default: null
    }
  }
}
</script>

<style scoped>

</style>
