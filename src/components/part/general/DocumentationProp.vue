<template>
  <el-form-item :label="$customTranslate('Documentation')" :prop="PROP_NAME">
    <el-input v-model="value_" :autosize="{ maxRows: 10}" type="textarea" />
  </el-form-item>
</template>

<script>
import propHelper from '@/mixins/propHelper'

export default {
  name: 'DocumentationProp',
  mixins: [propHelper],
  props: {
    value: {
      type: String,
      default: null
    }
  },
  created() {
    this.PROP_NAME = 'doc'
  }
}
</script>

<style scoped>

</style>
