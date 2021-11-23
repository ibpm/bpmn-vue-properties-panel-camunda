<template>
  <Common :form="form" @serialize="serialize">
    <template #detail>
      <el-form-item :label="$customTranslate('Due Date')" prop="dueDate">
        <el-input v-model="form.dueDate" />
      </el-form-item>
      <el-form-item :label="$customTranslate('Follow Up Date')" prop="followUpDate">
        <el-input v-model="form.followUpDate" />
      </el-form-item>
      <el-form-item :label="$customTranslate('Priority')" prop="priority">
        <el-input v-model="form.priority" />
      </el-form-item>
    </template>
  </Common>
</template>

<script>
import elementHelper from '@/mixins/elementHelper'
import Common from '@/components/embbed/Common'

export default {
  name: 'UserTask',
  components: {
    Common
  },
  mixins: [elementHelper]
}
</script>

<style scoped>

</style>
