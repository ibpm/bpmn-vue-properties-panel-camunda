<template>
  <Base :moddle="moddle" :form="form" @write="write">
    <template v-if="visible" #custom>
      <ConditionType :moddle="moddle" :form="form" @write="write" />
    </template>
  </Base>
</template>

<script>
import Base from '@/components/embbed/Base'
import ConditionType from '@/components/part/detail/ConditionType'
import elementHelper from '@/mixins/elementHelper'
import { isConditionalSource } from '@/utils/helper'

export default {
  name: 'SequenceFlow',
  components: {
    Base,
    ConditionType
  },
  mixins: [elementHelper],
  computed: {
    visible() {
      return isConditionalSource(this.element.source)
    }
  }
}
</script>
