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
      <FormItemTextArea v-model="form_.doc" :label="$customTranslate('Documentation')" prop="doc" />
    </el-form>
    <InputOutput v-if="showIO" v-model="form_" @writeIO="writeIO" />
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
      this.form_.ios = []
      this.form.extensionElements?.values
        .filter(item => is(item, customize(ELEMENT_NAME)))
        .forEach(io => {
          this.readIO(io['inputParameters'], true)
          this.readIO(io['outputParameters'], false)
        })
    },
    readIO(sources, ioType) {
      sources?.forEach(io => {
        const target = {
          ioType: ioType,
          name: io.name
        }
        if (io.definition) {
          if (is(io.definition, customize('Script'))) {
            target.type = 'script'
            target.condition = {
              conditionType: 'script',
              scriptFormat: io.definition.scriptFormat,
              scriptType: io.definition.resource ? 'resource' : 'script',
              config: io.definition.value || io.definition.resource
            }
          } else if (is(io.definition, customize('List'))) {
            target.type = 'list'
            target.items = io.definition.items
          } else if (is(io.definition, customize('Map'))) {
            target.type = 'map'
            target.entries = io.definition.entries
          }
        } else {
          target.type = 'text'
          target.value = io.value
        }
        this.form_.ios.push(target)
        this.ioLength++
      })
    },
    writeIO(form) {
      this.ioLength = 0
      this.showIO = false
      let ioElement
      if (form.ios.length) {
        ioElement = this.moddle.create(customize(ELEMENT_NAME))
        form.ios.forEach(item => {
          const
            listPropertyName = item.ioType ? 'inputParameters' : 'outputParameters',
            parameterProps = { name: item.name }
          ioElement[listPropertyName] = ioElement[listPropertyName] || []
          if (item.type === 'text') {
            parameterProps.value = item.value
          } else if (item.type === 'script') {
            if (item.condition_?.scriptFormat) {
              parameterProps.definition = this.moddle.create(customize('Script'), {
                scriptFormat: item.condition_.scriptFormat,
                value: item.condition_.script,
                [ customize('resource') ]: item.condition_.resource
              })
            }
          } else if (item.type === 'list') {
            if (item.items?.length) {
              parameterProps.definition = this.moddle.create(customize('List'), {
                items: item.items.map(li => {
                  return this.moddle.create(customize('Value'), {
                    value: li.value
                  })
                })
              })
            }
          } else { // map
            if (item.entries?.length) {
              parameterProps.definition = this.moddle.create(customize('Map'), {
                entries: item.entries.map(entry => {
                  return this.moddle.create(customize('Entry'), {
                    key: entry.key,
                    value: entry.value
                  })
                })
              })
            }
          }
          ioElement[listPropertyName].push(
            this.moddle.create(customize(item.ioType ? 'InputParameter' : 'OutputParameter'),
              parameterProps))
          this.ioLength++
        })
      }
      if (ioElement) {
        let extensionElements = this.form.extensionElements || this.moddle.create('bpmn:ExtensionElements')
        extensionElements.values = extensionElements.values?.filter(item => !is(item, customize(ELEMENT_NAME))) ?? []
        extensionElements.values.push(ioElement)
        this.form.extensionElements = extensionElements
        this.write({ extensionElements: extensionElements })
      }
    }
  }
}
</script>
