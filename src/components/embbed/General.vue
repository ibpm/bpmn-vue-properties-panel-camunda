<template>
  <div>
    <el-form ref="form" :model="businessObject" :rules="rules_" label-width="100px" size="mini">
      <FormItemInput v-model="businessObject.id" :label="$customTranslate('Id')" prop="id" />
      <FormItemTextArea v-model="businessObject.name" :label="$customTranslate('Name')" prop="name" />
      <slot name="custom" />
      <el-form-item :label="$customTranslate('Properties')">
        <el-badge :value="properties.length">
          <el-button @click="showProperty = true">
            {{ $customTranslate('Update') }}
          </el-button>
        </el-badge>
      </el-form-item>
      <FormItemTextArea
        v-model="businessObject.doc"
        :label="$customTranslate('Documentation')"
        :placeholder="$customTranslate('Element Documentation')"
        prop="doc"
      />
    </el-form>
    <Properties v-if="showProperty" v-model="properties" :moddle="moddle" :is-form="false" @write-properties="update" @close="showProperty = false" />
  </div>
</template>
<script>
import Properties from '../../components/part/detail/Properties'
import FormItemInput from '../../components/ui/FormItemInput'
import FormItemTextArea from '../../components/ui/FormItemTextArea'
import areaHelper from '../../mixins/areaHelper'
import { is } from 'bpmn-js/lib/util/ModelUtil'
import { customize } from '../../utils'
import { addAndRemoveElementsFromExtensionElements } from '../../utils/creators'

export default {
  name: 'General',
  components: {
    Properties,
    FormItemInput,
    FormItemTextArea
  },
  mixins: [areaHelper],
  data() {
    return {
      showProperty: false,
      properties: []
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
    'businessObject.id': function(val) {
      this.write({ id: val })
    },
    'businessObject.name': function(val) {
      this.write({ name: val })
    },
    'businessObject.doc'(val) {
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
      if (this.businessObject.documentation?.length) {
        this.businessObject.doc = this.businessObject.documentation[0].text
      }
      this.properties =
        this.businessObject.extensionElements?.values.find(item => is(item, customize('Properties')))?.values ?? []
    },
    update(propertiesElement) {
      this.showProperty = false
      this.properties = propertiesElement?.values || []
      const
        matcher = item => !is(item, customize('Properties')),
        objectsToAdd = propertiesElement ? [propertiesElement] : undefined
      this.businessObject.extensionElements = addAndRemoveElementsFromExtensionElements(this.moddle, this.businessObject, objectsToAdd, matcher)
    }
  }
}
</script>
