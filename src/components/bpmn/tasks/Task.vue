<!-- https://docs.camunda.org/manual/latest/reference/bpmn20/tasks/ -->
<template>
  <Activity :element="element" :moddle="moddle" :bo="bo" @write="write" />
</template>

<script>
import Activity from '../../embbed/Activity'
import elementHelper from '../../../mixins/elementHelper'

export default {
  name: 'Task',
  components: {
    Activity
  },
  mixins: [elementHelper]
}
</script>
