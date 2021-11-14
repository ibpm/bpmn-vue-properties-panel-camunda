<template>
  <el-form ref="processForm" v-model="form" label-width="100px" size="mini">
    <IdProp v-model="form.id" @updateBase="updateBase" />
    <NameProp v-model="form.name" @updateBase="updateBase" />
    <slot name="general" />
    <DocumentationProp v-model="form.doc" @updateBase="updateBase" />
  </el-form>
</template>

<script>
import IdProp from '@/components/part/general/IdProp'
import NameProp from '@/components/part/general/NameProp'
import DocumentationProp from '@/components/part/general/DocumentationProp'

export default {
  name: 'Base',
  components: {
    DocumentationProp,
    IdProp,
    NameProp
  },
  props: {
    form: {
      type: Object,
      required: true,
      default: null
    }
  },
  methods: {
    updateBase(properties) {
      this.$emit('updateElement', properties)
    }
  }
}
</script>

<style scoped>

</style>
