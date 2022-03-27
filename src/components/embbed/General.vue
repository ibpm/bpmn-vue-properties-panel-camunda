<template>
  <div>
    <el-form ref="form" :model="bo" :rules="rules_" label-width="100px" size="mini">
      <FormItemInput v-model="bo.id" :label="$customTranslate('Id')" prop="id" />
      <FormItemTextArea v-model="bo.name" :label="$customTranslate('Name')" prop="name" />
      <slot name="custom" />
      <el-form-item :label="$customTranslate('Properties')">
        <el-badge :value="properties.length">
          <el-button @click="showProperty = true">
            {{ $customTranslate('Update') }}
          </el-button>
        </el-badge>
      </el-form-item>
      <FormItemTextArea
        v-model="bo.doc"
        :label="$customTranslate('Documentation')"
        :placeholder="$customTranslate('Element Documentation')"
        prop="doc"
      />
    </el-form>
    <Properties v-if="showProperty" v-model="properties" :moddle="moddle" :is-form="false" @save-properties="writeProperties" @close="showProperty = false" />
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
    'bo.id': function(val) {
      this.write({ id: val })
    },
    'bo.name': function(val) {
      this.write({ name: val })
    },
    'bo.doc'(val) {
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
      if (this.bo.documentation?.length) {
        this.bo.doc = this.bo.documentation[0].text
      }
      this.properties =
        this.bo.extensionElements?.values.find(item => is(item, customize('Properties')))?.values ?? []
    },
    writeProperties(propertiesElement) {
      this.showProperty = false
      this.properties = propertiesElement?.values || []
      const
        matcher = item => !is(item, customize('Properties')),
        objectsToAdd = propertiesElement ? [propertiesElement] : undefined
      this.write({ extensionElements:
          this.bo.extensionElements = addAndRemoveElementsFromExtensionElements(this.moddle, this.bo, objectsToAdd, matcher)
      })
    }
  }
}
</script>
