<template>
  <Base :moddle="moddle" :business-object="businessObject" :templates="templates" @write="write">
    <template v-if="visible" #custom>
      <el-form-item :label="$customTranslate('Condition Type')" prop="conditionType">
        <el-select v-model="businessObject.conditionType" @change="changeCondition">
          <el-option :label="$customTranslate('Expression')" value="expression" />
          <el-option :label="$customTranslate('Script')" value="script" />
          <el-option label="" value="" />
        </el-select>
      </el-form-item>
      <Condition v-model="businessObject" @update="update" />
    </template>
  </Base>
</template>

<script>
import Base from '../../components/embbed/Base'
import Condition from '../../components/part/detail/Condition'
import elementHelper from '../../mixins/elementHelper'
import { customize, isConditionalSource } from '../../utils/utils'
import { createFormalExpression } from '../../utils/creators'

export default {
  name: 'SequenceFlow',
  components: {
    Base,
    Condition
  },
  mixins: [elementHelper],
  computed: {
    visible() {
      return isConditionalSource(this.element.source)
    }
  },
  created() {
    this.sync()
  },
  methods: {
    sync() {
      if (this.businessObject.conditionExpression) {
        if (this.businessObject.conditionExpression.language) {
          this.businessObject.conditionType = 'script'
          this.businessObject.scriptFormat = this.businessObject.conditionExpression.language
          if (this.businessObject.conditionExpression.body) {
            this.businessObject.scriptType = 'script'
            this.businessObject.config = this.businessObject.conditionExpression.body
          } else {
            this.businessObject.scriptType = 'resource'
            this.businessObject.config = this.businessObject.conditionExpression.resource
          }
        } else {
          this.businessObject.conditionType = 'expression'
          this.businessObject.config = this.businessObject.conditionExpression.body
        }
      }
    },
    update(obj) {
      let props
      if ('expression' in obj) {
        props = obj.expression ? createFormalExpression(this.moddle, { body: obj.expression }) : null
      } else if ('script' in obj) {
        props = obj.script ? createFormalExpression(this.moddle, {
          language: obj.scriptFormat,
          body: obj.script
        }) : null
      } else if ('resource' in obj) {
        props = obj.resource ? createFormalExpression(this.moddle, {
          language: obj.scriptFormat,
          [ customize('resource') ]: obj.resource
        }) : null
      } else {
        props = null
      }
      this.write({ conditionExpression: props })
    },
    changeCondition() {
      this.update({})
    }
  }
}
</script>
