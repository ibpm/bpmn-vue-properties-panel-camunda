<template>
  <Base :modeler="modeler" :form="form" @up="updateProperties">
    <template v-slot:general>
      <el-form-item :label="$customTranslate('Initiator')" prop="initiator">
        <el-input v-model="form.initiator" />
      </el-form-item>
    </template>
  </Base>
</template>

<script>
import elementHelper from '@/mixins/elementHelper'
import Base from '@/components/bpmn/Base'

export default {
  name: 'Event',
  components: {
    Base
  },
  mixins: [elementHelper]/*,
  data() {
    return {
      form: {}
    }
  },
  watch: {
    'form.initiator'(val) {
      this.updateProperties({ initiator: val })
    }
  }*/
}
</script>

<style scoped>

</style>
