<!-- https://docs.camunda.org/manual/latest/reference/bpmn20/events/start-events/ -->
<template>
  <Common :element="element" :moddle="moddle" :bo="bo" @write="write">
    <template #detail>
      <FormItemInput
        v-if="propertyVisible('initiator')"
        v-model="bo.initiator"
        label="Initiator"
        :rules="[{ message: $customTranslate('Must have max length {length}', { length: 255 }), trigger: 'blur', max: 255 }]"
        prop="initiator"
      />
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
  watch: {
    'bo.initiator'(val) {
      this.write({ initiator: val })
    }
  }
}
</script>
