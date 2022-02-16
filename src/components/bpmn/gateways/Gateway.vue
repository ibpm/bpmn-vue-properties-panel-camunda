<template>
  <Common :moddle="moddle" :form="form" @write="write" />
</template>

<script>
import Common from '@/components/embbed/Common'
import elementHelper from '@/mixins/elementHelper'

export default {
  name: 'Gateway',
  components: {
    Common
  },
  mixins: [elementHelper]
}
</script>
