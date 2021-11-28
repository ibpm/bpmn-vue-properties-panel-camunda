<template>
  <el-form ref="form" v-model="form_" :rules="rules" label-width="100px" size="mini">
    <FormItemInput v-model="form_.id" :label="$customTranslate('Id')" prop="id" />
    <FormItemTextArea v-model="form_.name" :label="$customTranslate('Name')" prop="name" />
    <slot name="custom" />
    <FormItemTextArea v-model="form_.doc" :label="$customTranslate('Documentation')" prop="doc" />
  </el-form>
</template>

<script>
import FormItemInput from '@/components/ui/FormItemInput'
import FormItemTextArea from '@/components/ui/FormItemTextArea'
import areaHelper from '@/mixins/areaHelper'

export default {
  name: 'Base',
  components: {
    FormItemInput,
    FormItemTextArea
  },
  mixins: [areaHelper],
  data() {
    return {
      rules_: {
        id: [
          { required: true, message: '请输入Id', trigger: 'blur', range: { max: 255 }}
        ]
      }
    }
  },
  watch: {
    'form_.id': function(val) {
      this.write({ id: val })
    },
    'form_.name': function(val) {
      this.write({ name: val })
    },
    'form_.doc'(val) {
      this.write({
        documentation: val ? [this.moddle.create('bpmn:Documentation', { text: val })] : []
      })
    }
  },
  created() {
    this.readDoc()
  },
  methods: {
    readDoc() {
      if (this.form.documentation?.length) {
        this.form_.doc = this.form.documentation[0].text
      }
    }
  }
}
</script>

<style scoped>

</style>
