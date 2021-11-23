<template>
  <el-form ref="form" v-model="form_" label-width="100px" size="mini">
    <IdProp v-model="form_.id" @serialize="serialize" />
    <NameProp v-model="form_.name" @serialize="serialize" />
    <slot name="custom" />
    <DocumentationProp v-model="form_.doc" @serialize="serialize" />
  </el-form>
</template>

<script>
import IdProp from '@/components/part/general/IdProp'
import NameProp from '@/components/part/general/NameProp'
import DocumentationProp from '@/components/part/general/DocumentationProp'
import areaHelper from '@/mixins/areaHelper'

export default {
  name: 'Base',
  components: {
    DocumentationProp,
    IdProp,
    NameProp
  },
  mixins: [areaHelper]
}
</script>

<style scoped>

</style>
