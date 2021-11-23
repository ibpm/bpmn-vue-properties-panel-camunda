<template>
  <Common :form="form" @serialize="serialize">
    <template #detail>
      <el-form-item :label="$customTranslate('Initiator')" prop="initiator">
        <el-input v-model="form.initiator" />
      </el-form-item>
    </template>
  </Common>
</template>

<script>
import Common from '@/components/embbed/Common'
import elementHelper from '@/mixins/elementHelper'

export default {
  name: 'StartEvent',
  components: {
    Common
  },
  mixins: [elementHelper]
}
</script>

<style scoped>

</style>
