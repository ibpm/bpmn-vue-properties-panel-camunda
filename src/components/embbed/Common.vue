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
        <el-form-item v-if="isInputOutputSupported" :label="$customTranslate('Input/Output')">
          <el-badge :value="ioLength">
            <el-button @click="showIO = true">
              {{ $customTranslate('Update') }}
            </el-button>
          </el-badge>
        </el-form-item>
      </template>
    </Base>
    <ExecutionListener v-if="showListener" :moddle="moddle" :form="form" @write="write" @close="finishListener" />
    <InputOutput v-if="showIO" :moddle="moddle" :io="io" @writeSub="writeSub" @syncLength="syncLength" />
  </div>
</template>

<script>
import Base from './Base'
import ExecutionListener from '@/components/part/listener/ExecutionListener'
import InputOutput from '@/components/part/detail/InputOutput'
import FormItemInput from '@/components/ui/FormItemInput'
import FormItemSwitch from '@/components/ui/FormItemSwitch'
import areaHelper from '@/mixins/areaHelper'
import { is } from 'bpmn-js/lib/util/ModelUtil'
import { customize } from '@/utils/helper'

const ELEMENT_NAME = 'InputOutput'

export default {
  name: 'Common',
  components: {
    Base,
    ExecutionListener,
    InputOutput,
    FormItemInput,
    FormItemSwitch
  },
  mixins: [areaHelper],
  data() {
    return {
      listenerLength: 0,
      showListener: false,
      io: null,
      showIO: false,
      ioLength: 0,
      isInputOutputSupported: false
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
  created() {
    this.computeLength()
    this.readSub()
  },
  methods: {
    finishListener() {
      this.computeLength()
      this.showListener = false
    },
    computeLength() {
      this.listenerLength = this.form_.extensionElements?.values
        ?.filter(item => is(item, customize('ExecutionListener'))).length ?? 0
    },
    readSub() {
      this.form.extensionElements?.values
        .filter(item => is(item, customize(ELEMENT_NAME)))
        .forEach(io => {
          this.io = io
        })
      const bo = this.form
      this.isInputOutputSupported = is(bo, 'bpmn:FlowNode') &&
        !(
          is(bo, 'bpmn:StartEvent') ||
          is(bo, 'bpmn:Gateway') ||
          is(bo, 'bpmn:BoundaryEvent') ||
          (
            is(bo, 'bpmn:SubProcess') && bo.get('triggeredByEvent')
          )
        )
    },
    writeSub(io) {
      this.showIO = false
      let extensionElements = this.form.extensionElements || this.moddle.create('bpmn:ExtensionElements')
      extensionElements.values = extensionElements.values?.filter(item => !is(item, customize(ELEMENT_NAME))) ?? []
      if (io) {
        extensionElements.values.push(io)
      } else if (!extensionElements.values.length) {
        extensionElements = null
      }
      this.io = io
      this.form.extensionElements = extensionElements
      this.write({ extensionElements: extensionElements })
    },
    syncLength(ioLength) {
      this.ioLength = ioLength
    }
  }
}
</script>
