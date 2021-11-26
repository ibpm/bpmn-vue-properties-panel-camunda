<template>
  <Common :moddle="moddle" :form="form" @write="write">
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
  watch: {
    'form.initiator'(val) {
      this.write({ initiator: val })
    }
  }
}
</script>

<style scoped>

</style>
