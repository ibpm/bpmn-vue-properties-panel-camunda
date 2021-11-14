<template>
  <el-form-item :label="$customTranslate('Id')" :prop="PROP_NAME">
    <el-input v-model="value_" />
  </el-form-item>
</template>

<script>
import propHelper from '@/mixins/propHelper'

export default {
  name: 'IdProp',
  mixins: [propHelper],
  props: {
    value: {
      type: String,
      required: true,
      default: null
    }
  },
  created() {
    this.PROP_NAME = 'id'
  }
}
</script>

<style scoped>

</style>
