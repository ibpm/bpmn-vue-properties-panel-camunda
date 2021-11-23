<template>
  <Base :form="form_" @serialize="serialize">
    <template #custom>
      <slot name="detail" />
      <el-form-item :label="$customTranslate('Asynchronous Before')" prop="asyncBefore">
        <el-switch v-model="form_.asyncBefore" />
      </el-form-item>
      <el-form-item :label="$customTranslate('Asynchronous After')" prop="asyncAfter">
        <el-switch v-model="form_.asyncAfter" />
      </el-form-item>
      <template v-if="form_.asyncBefore || form_.asyncAfter">
        <el-form-item :label="$customTranslate('Exclusive')" prop="exclusive">
          <el-switch v-model="form_.exclusive" />
        </el-form-item>
        <JobPriorityProp v-model="form_.jobPriority" @serialize="serialize" />
        <el-form-item :label="$customTranslate('Retry Time Cycle')" prop="failedJobRetryTimeCycle">
          <el-input v-model="form_.failedJobRetryTimeCycle" />
        </el-form-item>
      </template>
    </template>
  </Base>
</template>

<script>
import Base from './Base'
import JobPriorityProp from '@/components/part/general/JobPriorityProp'
import areaHelper from '@/mixins/areaHelper'

export default {
  name: 'Common',
  components: {
    Base,
    JobPriorityProp
  },
  mixins: [areaHelper]
}
</script>

<style scoped>

</style>
