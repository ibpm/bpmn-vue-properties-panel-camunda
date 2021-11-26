<template>
  <Base :moddle="moddle" :form="form_" @write="write">
    <template #custom>
      <slot name="detail" />
      <FormItemSwitch v-model="form_.asyncBefore" :label="$customTranslate('Asynchronous Before')" prop="asyncBefore" />
      <FormItemSwitch v-model="form_.asyncAfter" :label="$customTranslate('Asynchronous After')" prop="asyncAfter" />
      <template v-if="form_.asyncBefore || form_.asyncAfter">
        <FormItemSwitch v-model="form_.exclusive" :label="$customTranslate('Exclusive')" prop="exclusive" />
        <FormItemInput v-model="form_.jobPriority" :label="$customTranslate('Job Priority')" prop="jobPriority" />
        <FormItemInput v-model="form_.failedJobRetryTimeCycle" :label="$customTranslate('Retry Time Cycle')" prop="failedJobRetryTimeCycle" />
      </template>
    </template>
  </Base>
</template>

<script>
import Base from './Base'
import FormItemInput from '@/components/ui/FormItemInput'
import FormItemSwitch from '@/components/ui/FormItemSwitch'
import areaHelper from '@/mixins/areaHelper'

export default {
  name: 'Common',
  components: {
    Base,
    FormItemInput,
    FormItemSwitch
  },
  mixins: [areaHelper],
  watch: {
    'form_.asyncBefore': function(val) {
      this.write({ asyncBefore: val })
    },
    'form_.asyncAfter': function(val) {
      this.write({ asyncAfter: val })
    },
    'form_.exclusive': function(val) {
      this.write({ exclusive: val })
    },
    'form_.jobPriority': function(val) {
      this.write({ jobPriority: val })
    },
    'form_.failedJobRetryTimeCycle': function(val) {
      this.write({ failedJobRetryTimeCycle: val })
    }
  }
}
</script>

<style scoped>

</style>
