<template>
  <Common :moddle="moddle" :business-object="businessObject" :templates="templates" @write="write" />
</template>

<script>
import Common from '../../embbed/Common'
import elementHelper from '../../../mixins/elementHelper'

export default {
  name: 'Gateway',
  components: {
    Common
  },
  mixins: [elementHelper]
}
</script>
