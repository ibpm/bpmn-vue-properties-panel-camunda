<template>
  <div>
    <template v-if="showScript">
      <FormItemInput v-model="form_.scriptFormat" :label="$customTranslate('Script Format')" prop="scriptFormat" />
      <el-form-item :label="$customTranslate('Script Type')" prop="scriptType">
        <el-select v-model="form_.scriptType">
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
      v-model="form_.config"
      :label=" $customTranslate(showExpression ? 'Expression': showResource ? 'Resource' : 'Script')"
      prop="config"
    />
  </div>
</template>
<script>
import FormItemInput from '@/components/ui/FormItemInput'
import FormItemTextArea from '@/components/ui/FormItemTextArea'
import { isExpression, isScript, isResource } from '@/utils/helper'
import { SCRIPT_TYPES } from '@/utils/constants'

export default {
  name: 'Condition',
  components: { FormItemInput, FormItemTextArea },
  props: {
    value: {
      type: Object,
      default: null,
      required: true
    }
  },
  data() {
    return {
      scriptTypes: SCRIPT_TYPES,
      form_: this.value
    }
  },
  computed: {
    showExpression() {
      return isExpression(this.value.conditionType)
    },
    showScript() {
      return isScript(this.value.conditionType)
    },
    showResource() {
      return isResource(this.form_.scriptType)
    }
  },
  watch: {
    'form_.scriptFormat'() {
      this.update()
    },
    'form_.config'() {
      this.update()
    }
  },
  methods: {
    update() {
      let props
      if (this.showExpression) {
        props = { expression: this.form_.config }
      } else if (this.showScript) {
        if (this.showResource) {
          props = { scriptFormat: this.form_.scriptFormat, resource: this.form_.config }
        } else {
          props = { scriptFormat: this.form_.scriptFormat, script: this.form_.config }
        }
      } else {
        props = {}
      }
      this.$emit('update', props)
    }
  }
}
</script>
