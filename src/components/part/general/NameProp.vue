<template>
  <el-form-item :label="$customTranslate('Name')" :prop="PROP_NAME">
    <el-input v-model="value_" :autosize="{ maxRows: 5}" type="textarea" clearable />
  </el-form-item>
</template>

<script>
import propHelper from '@/mixins/propHelper'

export default {
  name: 'NameProp',
  mixins: [propHelper],
  created() {
    this.PROP_NAME = 'name'
  }
}
</script>

<style scoped>

</style>
