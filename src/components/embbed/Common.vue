<template>
  <div>
    <Base :moddle="moddle" :business-object="businessObject" :templates="templates" @sync="sync" @write="write">
      <template #custom>
        <slot name="detail" />
        <el-form-item :label="$customTranslate('Execution Listener')">
          <el-badge :value="listenerLength">
            <el-button @click="showListener = true">
              {{ $customTranslate('Update') }}
            </el-button>
          </el-badge>
        </el-form-item>
        <FormItemSwitch v-model="businessObject.asyncBefore" :label="$customTranslate('Asynchronous Before')" prop="asyncBefore" />
        <FormItemSwitch v-model="businessObject.asyncAfter" :label="$customTranslate('Asynchronous After')" prop="asyncAfter" />
        <template v-if="businessObject.asyncBefore || businessObject.asyncAfter">
          <FormItemSwitch v-model="businessObject.exclusive" :label="$customTranslate('Exclusive')" prop="exclusive" />
          <FormItemInput v-model="businessObject.jobPriority" :label="$customTranslate('Job Priority')" prop="jobPriority" />
          <FormItemInput v-model="businessObject.failedJobRetryTimeCycle" :label="$customTranslate('Retry Time Cycle')" prop="failedJobRetryTimeCycle" />
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
    <ExecutionListener v-if="showListener" :moddle="moddle" :business-object="businessObject" @close="finishListener" />
    <InputOutput v-if="showIO" :moddle="moddle" :io="io" @update="update" @close="showIO = false" />
  </div>
</template>

<script>
import Base from './Base'
import ExecutionListener from '../../components/part/listener/ExecutionListener'
import InputOutput from '../../components/part/detail/InputOutput'
import FormItemInput from '../../components/ui/FormItemInput'
import FormItemSwitch from '../../components/ui/FormItemSwitch'
import areaHelper from '../../mixins/areaHelper'
import { is } from 'bpmn-js/lib/util/ModelUtil'
import { customize } from '../../utils'
import { addAndRemoveElementsFromExtensionElements } from '../../utils/creators'

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
        return (this.io?.inputParameters?.length ?? 0) + (this.io?.outputParameters?.length ?? 0)
      },
      set(newValue) {
        return newValue
      }
    }
  },
  watch: {
    'businessObject.asyncBefore': function(val) {
      this.write({ asyncBefore: val })
    },
    'businessObject.asyncAfter': function(val) {
      this.write({ asyncAfter: val })
    },
    'businessObject.exclusive': function(val) {
      this.write({ exclusive: val })
    },
    'businessObject.jobPriority': function(val) {
      this.write({ jobPriority: val })
    },
    'businessObject.failedJobRetryTimeCycle': function(val) {
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
      this.io = this.businessObject.extensionElements?.values
        .find(item => is(item, customize(ELEMENT_NAME)))
      this.isInputOutputSupported = is(this.businessObject, 'bpmn:FlowNode') &&
        !(
          is(this.businessObject, 'bpmn:StartEvent') ||
          is(this.businessObject, 'bpmn:Gateway') ||
          is(this.businessObject, 'bpmn:BoundaryEvent') ||
          (
            is(this.businessObject, 'bpmn:SubProcess') && this.businessObject.get('triggeredByEvent')
          )
        )
      this.computeLength()
    },
    finishListener() {
      this.computeLength()
      this.showListener = false
    },
    computeLength() {
      this.listenerLength = this.businessObject.extensionElements?.values
        ?.filter(item => is(item, customize('ExecutionListener'))).length ?? 0
    },
    update(io) {
      this.showIO = false
      this.io = io
      const
        matcher = item => !is(item, customize(ELEMENT_NAME)),
        objectsToAdd = io ? [io] : undefined
      this.businessObject.extensionElements = addAndRemoveElementsFromExtensionElements(this.moddle, this.businessObject, objectsToAdd, matcher)
    }
  }
}
</script>
