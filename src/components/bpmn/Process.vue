<template>
  <Base :moddle="moddle" :business-object="businessObject" :templates="templates" :rules="rules" @sync="sync" @write="write">
    <template #custom>
      <FormItemInput v-model="businessObject.versionTag" :label="$customTranslate('Version Tag')" prop="versionTag" />
      <FormItemSwitch v-model="businessObject.isExecutable" :label="$customTranslate('Executable')" prop="isExecutable" />
      <FormItemInput v-model="businessObject.candidateStarterGroups" :label="$customTranslate('Candidate Starter Groups')" prop="candidateStarterGroups" />
      <FormItemInput v-model="businessObject.candidateStarterUsers" :label="$customTranslate('Candidate Starter Users')" prop="candidateStarterUsers" />
      <FormItemInput v-model="businessObject.historyTimeToLive" :label="$customTranslate('History Time To Live')" prop="historyTimeToLive" />
      <FormItemInput v-model="businessObject.taskPriority" :label="$customTranslate('Task Priority')" prop="taskPriority" />
      <FormItemInput v-model="businessObject.jobPriority" :label="$customTranslate('Job Priority')" prop="jobPriority" />
      <FormItemSwitch v-model="businessObject.isStartableInTasklist" :label="$customTranslate('Startable')" prop="isStartableInTasklist" />
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
    'businessObject.versionTag'(val) {
      this.write({ versionTag: val })
    },
    'businessObject.isExecutable'(val) {
      this.write({ isExecutable: val })
    },
    'businessObject.candidateStarterGroups'(val) {
      this.write({ candidateStarterGroups: val })
    },
    'businessObject.candidateStarterUsers'(val) {
      this.write({ candidateStarterUsers: val })
    },
    'businessObject.historyTimeToLive'(val) {
      this.write({ historyTimeToLive: val })
    },
    'businessObject.taskPriority'(val) {
      this.write({ taskPriority: val })
    },
    'businessObject.jobPriority'(val) {
      this.write({ jobPriority: val })
    },
    'businessObject.isStartableInTasklist'(val) {
      this.write({ isStartableInTasklist: val })
    }
  },
  created() {
    this.sync()
  },
  methods: {
    sync() {
      if (!this.businessObject.isStartableInTasklist) {
        this.businessObject.isStartableInTasklist = true
      }
    }
  }
}
</script>
