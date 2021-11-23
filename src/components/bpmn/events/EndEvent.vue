<template>
  <Common :form="form" @serialize="serialize" />
</template>

<script>
import Common from '@/components/embbed/Common'
import elementHelper from '@/mixins/elementHelper'

export default {
  name: 'EndEvent',
  components: {
    Common
  },
  mixins: [elementHelper]
}
</script>

<style scoped>

</style>
