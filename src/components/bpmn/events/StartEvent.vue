<template>
  <Common :moddle="moddle" :bo="bo" :templates="templates" :rules="rules" @write="write">
    <template #detail>
      <FormItemInput v-model="bo.initiator" :label="$customTranslate('Initiator')" prop="initiator" />
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
    'bo.initiator'(val) {
      this.write({ initiator: val })
    }
  }
}
</script>
