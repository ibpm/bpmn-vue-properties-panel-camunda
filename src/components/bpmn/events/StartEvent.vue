<template>
  <Common :moddle="moddle" :form="form" :rules="rules" @write="write">
    <template #detail>
      <FormItemInput v-model="form.initiator" :label="$customTranslate('Initiator')" prop="initiator" />
    </template>
  </Common>
</template>

<script>
import Common from '@/components/embbed/Common'
import FormItemInput from '@/components/ui/FormItemInput'
import elementHelper from '@/mixins/elementHelper'

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
    'form.initiator'(val) {
      this.write({ initiator: val })
    }
  }
}
</script>
