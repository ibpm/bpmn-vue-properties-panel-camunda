<template>
  <Common :moddle="moddle" :business-object="businessObject" :templates="templates" :rules="rules" @write="write">
    <template #detail>
      <FormItemInput v-model="businessObject.initiator" :label="$customTranslate('Initiator')" prop="initiator" />
    </template>
  </Common>
</template>

<script>
import Common from '../../embbed/Common'
import FormItemInput from '../../ui/FormItemInput'
import elementHelper from '../../../mixins/elementHelper'

export default {
  name: 'StartEvent',
  components: {
    Common,
    FormItemInput
  },
  mixins: [elementHelper],
  computed: {
    rules() {
      return {
        initiator: [
          { message: this.$customTranslate('Initiator'), trigger: 'blur', max: 255 }
        ]
      }
    }
  },
  watch: {
    'businessObject.initiator'(val) {
      this.write({ initiator: val })
    }
  }
}
</script>
