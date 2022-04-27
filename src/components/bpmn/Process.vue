<template>
  <Base :moddle="moddle" :bo="bo" @write="write">
    <template #custom>
      <FormItemInput
        v-if="propertyVisible('versionTag')"
        v-model="bo.versionTag"
        label="Version Tag"
        :rules="[{ message: $customTranslate('Must have max length {length}', { length: 64 }), trigger: 'blur', max: 64 }]"
        prop="versionTag"
      />
      <FormItemSwitch
        v-if="propertyVisible('isExecutable')"
        v-model="bo.isExecutable"
        label="Executable"
      />
      <FormItemInput
        v-if="propertyVisible('candidateStarterGroups')"
        v-model="bo.candidateStarterGroups"
        label="Candidate Starter Groups"
        prop="candidateStarterGroups"
      />
      <FormItemInput
        v-if="propertyVisible('candidateStarterUsers')"
        v-model="bo.candidateStarterUsers"
        label="Candidate Starter Users"
        prop="candidateStarterUsers"
      />
      <FormItemInput
        v-if="propertyVisible('historyTimeToLive')"
        v-model="bo.historyTimeToLive"
        label="History Time To Live"
        prop="historyTimeToLive"
      />
      <FormItemInput
        v-if="propertyVisible('taskPriority')"
        v-model="bo.taskPriority"
        label="Task Priority"
        prop="taskPriority"
      />
      <FormItemInput
        v-if="propertyVisible('jobPriority')"
        v-model="bo.jobPriority"
        label="Job Priority"
        prop="jobPriority"
      />
    </template>
  </Base>
</template>

<script>
import Base from '../embbed/Base'
import FormItemInput from '../ui/FormItemInput'
import FormItemSwitch from '../ui/FormItemSwitch'
import elementHelper from '../../mixins/elementHelper'

export default {
  name: 'Process',
  components: {
    Base,
    FormItemSwitch,
    FormItemInput
  },
  mixins: [elementHelper],
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
    }
  }
}
</script>
