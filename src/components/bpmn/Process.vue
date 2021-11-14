<template>
  <Base :form="form" @updateElement="updateProperties">
    <template v-slot:general>
      <el-form-item :label="$customTranslate('Version Tag')" prop="versionTag">
        <el-input v-model="form.versionTag" />
      </el-form-item>
      <el-form-item :label="$customTranslate('Executable')" prop="isExecutable">
        <el-switch v-model="form.isExecutable" />
      </el-form-item>
      <el-form-item :label="$customTranslate('Candidate Starter Groups')" prop="candidateStarterGroups">
        <el-input v-model="form.candidateStarterGroups" :placeholder="$customTranslate('Specify more than one group as a comma separated list.')" />
      </el-form-item>
      <el-form-item :label="$customTranslate('Candidate Starter Users')" prop="candidateStarterUsers">
        <el-input v-model="form.candidateStarterUsers" :placeholder="$customTranslate('Specify more than one user as a comma separated list.')" />
      </el-form-item>
      <el-form-item :label="$customTranslate('History Time To Live')" prop="historyTimeToLive">
        <el-input v-model="form.historyTimeToLive" />
      </el-form-item>
      <el-form-item :label="$customTranslate('Task Priority')" prop="taskPriority">
        <el-input v-model="form.taskPriority" />
      </el-form-item>
      <el-form-item :label="$customTranslate('Job Priority')" prop="jobPriority">
        <el-input v-model="form.jobPriority" />
      </el-form-item>
      <el-form-item :label="$customTranslate('Startable')" prop="isStartableInTasklist">
        <el-switch v-model="form.isStartableInTasklist" />
      </el-form-item>
    </template>
  </Base>
</template>

<script>
import elementHelper from '@/mixins/elementHelper'
import Base from '@/components/bpmn/Base'

export default {
  name: 'Process',
  components: {
    Base
  },
  mixins: [elementHelper],
  created() {
    if (!this.form.isStartableInTasklist) {
      this.form.isStartableInTasklist = true
    }
  }
}
</script>

<style scoped>

</style>
