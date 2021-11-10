<template>
  <el-form ref="processForm" v-model="form" label-width="80px" size="mini">
    <IdProp v-model="form.id" @up="updateProperties" />
    <NameProp v-model="form.name" @up="updateProperties" />
    <el-form-item :label="$customTranslate('Version Tag')" prop="versionTag">
      <el-input v-model="form.versionTag" />
    </el-form-item>
    <el-form-item :label="$customTranslate('Executable')" prop="isExecutable">
      <el-switch v-model="form.isExecutable" />
    </el-form-item>
    <DocumentationProp v-model="form.documentation" :modeler="modeler" @up="updateProperties" />
  </el-form>
</template>

<script>
import IdProp from '@/components/part/common/IdProp'
import NameProp from '@/components/part/common/NameProp'
import elementHelper from '@/mixins/elementHelper'
import DocumentationProp from '@/components/part/common/DocumentationProp'

export default {
  name: 'Process',
  components: {
    DocumentationProp,
    IdProp,
    NameProp
  },
  mixins: [elementHelper],
  data() {
    return {
      form: {
        id: null,
        name: null,
        versionTag: null,
        isExecutable: true,
        documentation: null
      }
    }
  },
  watch: {
    'form.versionTag'(val) {
      this.updateProperties({ versionTag: val })
    },
    'form.isExecutable'(val) {
      this.updateProperties({ isExecutable: val })
    }
  },
  created() {
    this.form = this.updateForm()
  }
}
</script>

<style scoped>

</style>
