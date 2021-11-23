<template>
  <el-form-item :label="$customTranslate('Job Priority')" :prop="PROP_NAME">
    <el-input v-model="value_" clearable />
  </el-form-item>
</template>

<script>
import propHelper from '@/mixins/propHelper'

export default {
  name: 'JobPriorityProp',
  mixins: [propHelper],
  props: {
    value: {
      type: String,
      default: null
    }
  },
  created() {
    this.PROP_NAME = 'jobPriority'
  }
}
</script>

<style scoped>

</style>
