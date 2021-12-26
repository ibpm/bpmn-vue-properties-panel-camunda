<template>
  <Activity :moddle="moddle" :form="form" @write="write" />
</template>

<script>
import Activity from '@/components/embbed/Activity'
import elementHelper from '@/mixins/elementHelper'

export default {
  name: 'Task',
  components: {
    Activity
  },
  mixins: [elementHelper]
}
</script>
