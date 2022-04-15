<template>
  <Base :moddle="moddle" :bo="bo" @write="write">
    <template v-if="visible" #custom>
      <el-form-item :label="$customTranslate('Condition Type')" prop="conditionType">
        <el-select v-model="conditionType" @change="changeCondition">
          <el-option :label="$customTranslate('Expression')" value="expression" />
          <el-option :label="$customTranslate('Script')" value="script" />
          <el-option label="" value="" />
        </el-select>
      </el-form-item>
      <Condition v-model="bo" :condition-type="conditionType" @save-condition="writeCondition" />
    </template>
  </Base>
</template>

<script>
import Base from '../../components/embbed/Base'
import Condition from '../../components/part/detail/Condition'
import elementHelper from '../../mixins/elementHelper'
import { customize, isConditionalSource } from '../../utils'
import { createFormalExpression } from '../../utils/creators'

export default {
  name: 'SequenceFlow',
  components: {
    Base,
    Condition
  },
  mixins: [elementHelper],
  data() {
    return {
      conditionType: ''
    }
  },
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
      if (this.bo.conditionExpression) {
        if (this.bo.conditionExpression.language) {
          this.conditionType = 'script'
          this.bo.scriptFormat = this.bo.conditionExpression.language
          if (this.bo.conditionExpression.body) {
            this.bo.scriptType = 'script'
            this.bo.config = this.bo.conditionExpression.body
          } else {
            this.bo.scriptType = 'resource'
            this.bo.config = this.bo.conditionExpression.resource
          }
        } else {
          this.conditionType = 'expression'
          this.bo.config = this.bo.conditionExpression.body
        }
      }
    },
    writeCondition(obj) {
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
      }
      this.write({ conditionExpression: props })
    },
    changeCondition() {
      this.writeCondition({})
    }
  }
}
</script>
