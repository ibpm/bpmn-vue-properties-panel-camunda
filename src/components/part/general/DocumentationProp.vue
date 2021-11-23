<template>
  <el-form-item :label="$customTranslate('Documentation')" :prop="PROP_NAME">
    <el-input v-model="value_" :autosize="{ maxRows: 10}" type="textarea" clearable />
  </el-form-item>
</template>

<script>
import propHelper from '@/mixins/propHelper'

export default {
  name: 'DocumentationProp',
  mixins: [propHelper],
  created() {
    this.PROP_NAME = 'doc'
    // this.preHandle()
  }/* ,
  methods: {
    preHandle() {
      if (this.form.documentation) {
        let str = ''
        this.form.documentation.forEach(item => {
          str += item.text
        })
        this.form.doc = str
      }
    }
  } */
}
</script>

<style scoped>

</style>
