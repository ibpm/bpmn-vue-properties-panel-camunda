<template>
  <div>
    <template v-if="showScript">
      <FormItemInput v-model="form_.scriptFormat" :label="$customTranslate('Script Format')" prop="scriptFormat" />
      <el-form-item :label="$customTranslate('Script Type')" prop="scriptType">
        <el-select v-model="form_.scriptType">
          <el-option :label="$customTranslate('Inline Script')" value="script" />
          <el-option :label="$customTranslate('External Resource')" value="resource" />
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

export default {
  name: 'Condition',
  components: { FormItemInput, FormItemTextArea },
  props: {
    form: {
      type: Object,
      default: null,
      required: true
    }
  },
  data() {
    return {
      form_: this.form
    }
  },
  computed: {
    showExpression() {
      return isExpression(this.form.conditionType)
    },
    showScript() {
      return isScript(this.form.conditionType)
    },
    showResource() {
      return isResource(this.form_.scriptType)
    }
  },
  watch: {
    form_: {
      handler() {
        this.writeSub()
      },
      immediate: true,
      deep: true
    }
  },
  methods: {
    writeSub() {
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
        props = null
      }
      this.$emit('writeSub', props)
    }
  }
}
</script>
