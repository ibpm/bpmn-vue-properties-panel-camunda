<template>
  <div>
    <template v-if="showScript">
      <FormItemInput
        v-if="scriptFormatVisible"
        v-model="form.scriptFormat"
        label="Script Format"
        prop="scriptFormat"
      />
      <FormItemSelect
        v-if="scriptVisible"
        v-model="form.scriptType"
        :options="scriptTypes"
        label="Script Type"
      />
    </template>
    <FormItemTextArea
      v-if="(showExpression && expressionVisible) || (showScript && scriptVisible)"
      v-model="form.config"
      :label="showExpression ? 'Expression': showResource ? 'Resource' : 'Script'"
      prop="config"
    />
  </div>
</template>
<script>
import FormItemInput from '../../ui/FormItemInput'
import FormItemSelect from '../../ui/FormItemSelect'
import FormItemTextArea from '../../ui/FormItemTextArea'
import { isExpression, isScript, isResource, isPropertyVisible } from '../../../utils'
import { SCRIPT_TYPES } from '../../../utils/constants'

export default {
  name: 'Condition',
  components: { FormItemInput, FormItemSelect, FormItemTextArea },
  props: {
    value: {
      type: Object,
      default: null,
      required: true
    },
    conditionType: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      scriptTypes: SCRIPT_TYPES,
      form: Object.assign({ scriptType: 'script' }, this.value)
    }
  },
  computed: {
    showExpression() {
      return isExpression(this.conditionType)
    },
    showScript() {
      return isScript(this.conditionType)
    },
    showResource() {
      return isResource(this.form.scriptType)
    },
    scriptFormatVisible() {
      return isPropertyVisible('scriptFormat', this.value)
    },
    scriptVisible() {
      return isPropertyVisible('script', this.value) && isPropertyVisible('resource', this.value)
    },
    expressionVisible() {
      return isPropertyVisible('expression', this.value)
    }
  },
  watch: {
    'form.scriptFormat'() {
      this.update()
    },
    'form.scriptType'() {
      this.update()
    },
    'form.config'() {
      this.update()
    }
  },
  methods: {
    update() {
      let props
      if (this.showExpression) {
        props = { expression: this.form.config }
      } else if (this.showScript) {
        if (this.showResource) {
          props = { scriptFormat: this.form.scriptFormat, resource: this.form.config }
        } else {
          props = { scriptFormat: this.form.scriptFormat, script: this.form.config }
        }
      } else {
        props = {}
      }
      this.$emit('save-condition', props)
    }
  }
}
</script>
