<template>
  <Base :moddle="moddle" :form="form" @write="write">
    <template #custom>
      <FormItemInput v-model="form.versionTag" :label="$customTranslate('Version Tag')" prop="versionTag" />
      <FormItemSwitch v-model="form.isExecutable" :label="$customTranslate('Executable')" prop="isExecutable" />
      <FormItemInput v-model="form.candidateStarterGroups" :label="$customTranslate('Candidate Starter Groups')" prop="candidateStarterGroups" />
      <FormItemInput v-model="form.candidateStarterUsers" :label="$customTranslate('Candidate Starter Users')" prop="candidateStarterUsers" />
      <FormItemInput v-model="form.historyTimeToLive" :label="$customTranslate('History Time To Live')" prop="historyTimeToLive" />
      <FormItemInput v-model="form.taskPriority" :label="$customTranslate('Task Priority')" prop="taskPriority" />
      <FormItemInput v-model="form.jobPriority" :label="$customTranslate('Job Priority')" prop="jobPriority" />
      <FormItemSwitch v-model="form.isStartableInTasklist" :label="$customTranslate('Startable')" prop="isStartableInTasklist" />
    </template>
  </Base>
</template>

<script>
import Base from '@/components/embbed/Base'
import FormItemInput from '@/components/ui/FormItemInput'
import elementHelper from '@/mixins/elementHelper'
import FormItemSwitch from '@/components/ui/FormItemSwitch'

export default {
  name: 'Process',
  components: {
    Base,
    FormItemSwitch,
    FormItemInput
  },
  mixins: [elementHelper],
  watch: {
    'form.versionTag'(val) {
      this.write({ versionTag: val })
    },
    'form.isExecutable'(val) {
      this.write({ isExecutable: val })
    },
    'form.candidateStarterGroups'(val) {
      this.write({ candidateStarterGroups: val })
    },
    'form.candidateStarterUsers'(val) {
      this.write({ candidateStarterUsers: val })
    },
    'form.historyTimeToLive'(val) {
      this.write({ historyTimeToLive: val })
    },
    'form.taskPriority'(val) {
      this.write({ taskPriority: val })
    },
    'form.jobPriority'(val) {
      this.write({ jobPriority: val })
    },
    'form.isStartableInTasklist'(val) {
      this.write({ isStartableInTasklist: val })
    }
  },
  created() {
    if (this.form.isStartableInTasklist === null || this.form.isStartableInTasklist === undefined) {
      this.form.isStartableInTasklist = true
    }
  }
}
</script>

<style scoped>

</style>
