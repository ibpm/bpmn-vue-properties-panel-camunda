<template>
  <div>
    <Base :moddle="moddle" :form="form_" @write="write">
      <template #custom>
        <slot name="detail" />
        <el-form-item :label="$customTranslate('Execution Listener')">
          <el-badge :value="listenerLength">
            <el-button @click="showListener = true">
              {{ $customTranslate('Update') }}
            </el-button>
          </el-badge>
        </el-form-item>
        <FormItemSwitch v-model="form_.asyncBefore" :label="$customTranslate('Asynchronous Before')" prop="asyncBefore" />
        <FormItemSwitch v-model="form_.asyncAfter" :label="$customTranslate('Asynchronous After')" prop="asyncAfter" />
        <template v-if="form_.asyncBefore || form_.asyncAfter">
          <FormItemSwitch v-model="form_.exclusive" :label="$customTranslate('Exclusive')" prop="exclusive" />
          <FormItemInput v-model="form_.jobPriority" :label="$customTranslate('Job Priority')" prop="jobPriority" />
          <FormItemInput v-model="form_.failedJobRetryTimeCycle" :label="$customTranslate('Retry Time Cycle')" prop="failedJobRetryTimeCycle" />
        </template>
      </template>
    </Base>
    <ExecutionListener
      v-if="showListener"
      :moddle="moddle"
      :form="form"
      @write="write"
      @close="finishListener"
    />
  </div>
</template>

<script>
import Base from './Base'
import ExecutionListener from '@/components/part/listener/ExecutionListener'
import FormItemInput from '@/components/ui/FormItemInput'
import FormItemSwitch from '@/components/ui/FormItemSwitch'
import areaHelper from '@/mixins/areaHelper'
import { typeMatch } from '@/utils/helper'

export default {
  name: 'Common',
  components: {
    Base,
    ExecutionListener,
    FormItemInput,
    FormItemSwitch
  },
  mixins: [areaHelper],
  data() {
    return {
      listenerLength: 0,
      showListener: false
    }
  },
  watch: {
    'form_.asyncBefore': function(val) {
      this.write({ asyncBefore: val })
    },
    'form_.asyncAfter': function(val) {
      this.write({ asyncAfter: val })
    },
    'form_.exclusive': function(val) {
      this.write({ exclusive: val })
    },
    'form_.jobPriority': function(val) {
      this.write({ jobPriority: val })
    },
    'form_.failedJobRetryTimeCycle': function(val) {
      this.write({ failedJobRetryTimeCycle: val })
    }
  },
  methods: {
    finishListener() {
      this.listenerLength = this.form_.extensionElements?.values
        ?.filter(item => typeMatch(item.$type, 'ExecutionListener')).length ?? 0
      this.showListener = false
    }
  }
}
</script>
