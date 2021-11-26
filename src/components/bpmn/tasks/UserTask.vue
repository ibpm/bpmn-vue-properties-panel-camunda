<template>
  <Common :moddle="moddle" :form="form" @write="write">
    <template #detail>
      <FormItemInput v-model="form.dueDate" :label="$customTranslate('Due Date')" prop="dueDate" />
      <FormItemInput v-model="form.followUpDate" :label="$customTranslate('Follow Up Date')" prop="followUpDate" />
      <FormItemInput v-model="form.priority" :label="$customTranslate('Priority')" prop="priority" />
    </template>
  </Common>
</template>

<script>
import Common from '@/components/embbed/Common'
import FormItemInput from '@/components/ui/FormItemInput'
import elementHelper from '@/mixins/elementHelper'

export default {
  name: 'UserTask',
  components: {
    Common,
    FormItemInput
  },
  mixins: [elementHelper],
  watch: {
    'form.dueDate'(val) {
      this.write({ dueDate: val })
    },
    'form.followUpDate'(val) {
      this.write({ followUpDate: val })
    },
    'form.priority'(val) {
      this.write({ priority: val })
    }
  }
}
</script>

<style scoped>

</style>
