<template>
  <div>
    <Base :moddle="moddle" :bo="bo" :templates="templates" @sync="sync" @write="write">
      <template #custom>
        <slot name="detail" />
        <el-form-item :label="$customTranslate('Execution Listener')">
          <el-badge :value="listenerLength">
            <el-button @click="showListener = true">
              {{ $customTranslate('Update') }}
            </el-button>
          </el-badge>
        </el-form-item>
        <FormItemSwitch v-model="bo.asyncBefore" :label="$customTranslate('Asynchronous Before')" prop="asyncBefore" />
        <FormItemSwitch v-model="bo.asyncAfter" :label="$customTranslate('Asynchronous After')" prop="asyncAfter" />
        <template v-if="bo.asyncBefore || bo.asyncAfter">
          <FormItemSwitch v-model="bo.exclusive" :label="$customTranslate('Exclusive')" prop="exclusive" />
          <FormItemInput v-model="bo.jobPriority" :label="$customTranslate('Job Priority')" prop="jobPriority" />
          <FormItemInput v-model="bo.failedJobRetryTimeCycle" :label="$customTranslate('Retry Time Cycle')" prop="failedJobRetryTimeCycle" />
        </template>
        <el-form-item v-if="ioSupported" :label="$customTranslate('Input/Output')">
          <el-badge :value="ioLength">
            <el-button @click="showIO = true">
              {{ $customTranslate('Update') }}
            </el-button>
          </el-badge>
        </el-form-item>
      </template>
    </Base>
    <ExecutionListener v-if="showListener" :moddle="moddle" :bo="bo" @write="write" @close="finishListener" />
    <InputOutput v-if="showIO" :moddle="moddle" :io="io" @save-io="saveIO" @close="showIO = false" />
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
import { customize, isInputOutputSupported } from '../../utils'
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
      ioSupported: isInputOutputSupported(this.element.businessObject)
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
    'bo.asyncBefore': function(val) {
      this.write({ asyncBefore: val })
    },
    'bo.asyncAfter': function(val) {
      this.write({ asyncAfter: val })
    },
    'bo.exclusive': function(val) {
      this.write({ exclusive: val })
    },
    'bo.jobPriority': function(val) {
      this.write({ jobPriority: val })
    },
    'bo.failedJobRetryTimeCycle': function(val) {
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
      this.io = this.bo.extensionElements?.values
        .find(item => is(item, customize(ELEMENT_NAME)))
      this.computeLength()
    },
    finishListener() {
      this.computeLength()
      this.showListener = false
    },
    computeLength() {
      this.listenerLength = this.bo.extensionElements?.values
        ?.filter(item => is(item, customize('ExecutionListener'))).length ?? 0
    },
    saveIO(io) {
      this.showIO = false
      this.io = io
      const
        matcher = item => !is(item, customize(ELEMENT_NAME)),
        objectsToAdd = io ? [io] : undefined
      this.write({ extensionElements:
          this.bo.extensionElements = addAndRemoveElementsFromExtensionElements(this.moddle, this.bo, objectsToAdd, matcher)
      })
    }
  }
}
</script>
