<template>
  <div>
    <Base :moddle="moddle" :form="form" :templates="templates" @sync="sync" @write="write">
      <template #custom>
        <slot name="detail" />
        <el-form-item :label="$customTranslate('Execution Listener')">
          <el-badge :value="listenerLength">
            <el-button @click="showListener = true">
              {{ $customTranslate('Update') }}
            </el-button>
          </el-badge>
        </el-form-item>
        <FormItemSwitch v-model="form.asyncBefore" :label="$customTranslate('Asynchronous Before')" prop="asyncBefore" />
        <FormItemSwitch v-model="form.asyncAfter" :label="$customTranslate('Asynchronous After')" prop="asyncAfter" />
        <template v-if="form.asyncBefore || form.asyncAfter">
          <FormItemSwitch v-model="form.exclusive" :label="$customTranslate('Exclusive')" prop="exclusive" />
          <FormItemInput v-model="form.jobPriority" :label="$customTranslate('Job Priority')" prop="jobPriority" />
          <FormItemInput v-model="form.failedJobRetryTimeCycle" :label="$customTranslate('Retry Time Cycle')" prop="failedJobRetryTimeCycle" />
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
    <InputOutput v-if="showIO" :moddle="moddle" :io="io" @update="update" />
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
      isInputOutputSupported: false
    }
  },
  computed: {
    ioLength: {
      get() {
        let length = 0
        if (this.io) {
          if (this.io.inputParameters) {
            length += this.io.inputParameters.length
          }
          if (this.io.outputParameters) {
            length += this.io.outputParameters.length
          }
        }
        return length
      },
      set(newValue) {
        return newValue
      }
    }
  },
  watch: {
    'form.asyncBefore': function(val) {
      this.write({ asyncBefore: val })
    },
    'form.asyncAfter': function(val) {
      this.write({ asyncAfter: val })
    },
    'form.exclusive': function(val) {
      this.write({ exclusive: val })
    },
    'form.jobPriority': function(val) {
      this.write({ jobPriority: val })
    },
    'form.failedJobRetryTimeCycle': function(val) {
      this.write({ failedJobRetryTimeCycle: val })
    }
  },
  created() {
    this.init()
  },
  methods: {
    sync() {
      this.$emit('sync')
      this.init()
    },
    init() {
      this.io = this.form.extensionElements?.values
        .find(item => is(item, customize(ELEMENT_NAME)))
      this.isInputOutputSupported = is(this.form, 'bpmn:FlowNode') &&
        !(
          is(this.form, 'bpmn:StartEvent') ||
          is(this.form, 'bpmn:Gateway') ||
          is(this.form, 'bpmn:BoundaryEvent') ||
          (
            is(this.form, 'bpmn:SubProcess') && this.form.get('triggeredByEvent')
          )
        )
      this.computeLength()
    },
    finishListener() {
      this.computeLength()
      this.showListener = false
    },
    computeLength() {
      this.listenerLength = this.form.extensionElements?.values
        ?.filter(item => is(item, customize('ExecutionListener'))).length ?? 0
    },
    update(io) {
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
    }
  }
}
</script>
