<template>
  <el-form-item :label="$customTranslate('Documentation')" :prop="PROP_NAME">
    <el-input v-model="value_" :rows="1" type="textarea" />
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
    },
    modeler: {
      type: Object,
      required: true
    }
  },
  watch: {
    value_(val) {
      const documentationElement = val ? [this.modeler.get('moddle').create('bpmn:Documentation', { text: val })] : []
      this.$emit('up', { [this.PROP_NAME]: documentationElement })
    }
  },
  created() {
    this.PROP_NAME = 'documentation'
  }
}
</script>

<style scoped>

</style>
