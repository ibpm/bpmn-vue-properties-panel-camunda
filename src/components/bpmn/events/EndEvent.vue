<template>
  <Common :element="element" :moddle="moddle" :bo="bo" :templates="templates" @write="write" />
</template>

<script>
import Common from '../../embbed/Common'
import elementHelper from '../../../mixins/elementHelper'

export default {
  name: 'EndEvent',
  components: {
    Common
  },
  mixins: [elementHelper]
}
</script>
