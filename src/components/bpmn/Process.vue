<template>
  <Base :moddle="moddle" :bo="bo" :templates="templates" :rules="rules" @sync="sync" @write="write">
    <template #custom>
      <FormItemInput v-model="bo.versionTag" :label="$customTranslate('Version Tag')" prop="versionTag" />
      <FormItemSwitch v-model="bo.isExecutable" :label="$customTranslate('Executable')" prop="isExecutable" />
      <FormItemInput v-model="bo.candidateStarterGroups" :label="$customTranslate('Candidate Starter Groups')" prop="candidateStarterGroups" />
      <FormItemInput v-model="bo.candidateStarterUsers" :label="$customTranslate('Candidate Starter Users')" prop="candidateStarterUsers" />
      <FormItemInput v-model="bo.historyTimeToLive" :label="$customTranslate('History Time To Live')" prop="historyTimeToLive" />
      <FormItemInput v-model="bo.taskPriority" :label="$customTranslate('Task Priority')" prop="taskPriority" />
      <FormItemInput v-model="bo.jobPriority" :label="$customTranslate('Job Priority')" prop="jobPriority" />
      <FormItemSwitch v-model="bo.isStartableInTasklist" :label="$customTranslate('Startable')" prop="isStartableInTasklist" />
    </template>
  </Base>
</template>

<script>
import Base from '../../components/embbed/Base'
import FormItemInput from '../../components/ui/FormItemInput'
import elementHelper from '../../mixins/elementHelper'
import FormItemSwitch from '../../components/ui/FormItemSwitch'

export default {
  name: 'Process',
  components: {
    Base,
    FormItemSwitch,
    FormItemInput
  },
  mixins: [elementHelper],
  computed: {
    rules() {
      return {
        versionTag: [
          { message: this.$customTranslate('Version Tag'), trigger: 'blur', max: 64 }
        ]
      }
    }
  },
  watch: {
    'bo.versionTag'(val) {
      this.write({ versionTag: val })
    },
    'bo.isExecutable'(val) {
      this.write({ isExecutable: val })
    },
    'bo.candidateStarterGroups'(val) {
      this.write({ candidateStarterGroups: val })
    },
    'bo.candidateStarterUsers'(val) {
      this.write({ candidateStarterUsers: val })
    },
    'bo.historyTimeToLive'(val) {
      this.write({ historyTimeToLive: val })
    },
    'bo.taskPriority'(val) {
      this.write({ taskPriority: val })
    },
    'bo.jobPriority'(val) {
      this.write({ jobPriority: val })
    },
    'bo.isStartableInTasklist'(val) {
      this.write({ isStartableInTasklist: val })
    }
  },
  created() {
    this.sync()
  },
  methods: {
    sync() {
      if (!this.bo.isStartableInTasklist) {
        this.bo.isStartableInTasklist = true
      }
    }
  }
}
</script>
