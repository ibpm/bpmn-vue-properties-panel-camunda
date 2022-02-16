<template>
  <div>
    <el-form ref="form" :model="form_" :rules="rules_" label-width="100px" size="mini">
      <FormItemInput v-model="form_.id" :label="$customTranslate('Id')" prop="id" />
      <FormItemTextArea v-model="form_.name" :label="$customTranslate('Name')" prop="name" />
      <slot name="custom" />
      <el-form-item :label="$customTranslate('Input/Output')">
        <el-badge :value="ioLength">
          <el-button @click="showIO = true">
            {{ $customTranslate('Update') }}
          </el-button>
        </el-badge>
      </el-form-item>
      <FormItemTextArea
        v-model="form_.doc"
        :label="$customTranslate('Documentation')"
        :placeholder="$customTranslate('Element Documentation')"
        prop="doc"
      />
    </el-form>
    <InputOutput v-if="showIO" :moddle="moddle" :io="io" @writeSub="writeSub" @syncLength="syncLength" />
  </div>
</template>

<script>
import InputOutput from '@/components/part/detail/InputOutput'
import FormItemInput from '@/components/ui/FormItemInput'
import FormItemTextArea from '@/components/ui/FormItemTextArea'
import areaHelper from '@/mixins/areaHelper'
import { customize } from '@/utils/helper'
import { is } from 'bpmn-js/lib/util/ModelUtil'

const ELEMENT_NAME = 'InputOutput'

export default {
  name: 'Base',
  components: {
    InputOutput,
    FormItemInput,
    FormItemTextArea
  },
  mixins: [areaHelper],
  data() {
    return {
      io: null,
      showIO: false,
      ioLength: 0
    }
  },
  computed: {
    rules_() {
      return {
        id: [
          { required: true, message: this.$customTranslate('Element must have an unique id.'), trigger: 'blur', range: { max: 255 }}
        ],
        name: [
          { message: this.$customTranslate('Name'), trigger: 'blur', max: 255 }
        ],
        doc: [
          { message: this.$customTranslate('Documentation'), trigger: 'blur', max: 4000 }
        ],
        ...this.rules
      }
    }
  },
  watch: {
    'form_.id': function(val) {
      this.write({ id: val })
    },
    'form_.name': function(val) {
      this.write({ name: val })
    },
    'form_.doc'(val) {
      this.write({
        documentation: val ? [this.moddle.create('bpmn:Documentation', { text: val })] : []
      })
    }
  },
  created() {
    this.read()
  },
  methods: {
    read() {
      if (this.form.documentation?.length) {
        this.form_.doc = this.form.documentation[0].text
      }
      this.form.extensionElements?.values
        .filter(item => is(item, customize(ELEMENT_NAME)))
        .forEach(io => {
          this.io = io
        })
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
