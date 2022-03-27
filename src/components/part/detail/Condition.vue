<template>
  <div>
    <template v-if="showScript">
      <FormItemInput v-model="form.scriptFormat" :label="$customTranslate('Script Format')" prop="scriptFormat" />
      <el-form-item :label="$customTranslate('Script Type')" prop="scriptType">
        <el-select v-model="form.scriptType">
          <el-option
            v-for="(item, index) in scriptTypes"
            :key="index"
            :label="$customTranslate(item.name)"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
    </template>
    <FormItemTextArea
      v-if="showExpression || showScript"
      v-model="form.config"
      :label=" $customTranslate(showExpression ? 'Expression': showResource ? 'Resource' : 'Script')"
      prop="config"
    />
  </div>
</template>
<script>
import FormItemInput from '../../ui/FormItemInput'
import FormItemTextArea from '../../ui/FormItemTextArea'
import { isExpression, isScript, isResource } from '../../../utils'
import { SCRIPT_TYPES } from '../../../utils/constants'

export default {
  name: 'Condition',
  components: { FormItemInput, FormItemTextArea },
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
