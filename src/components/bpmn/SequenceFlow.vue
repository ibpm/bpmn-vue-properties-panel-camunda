<!-- https://docs.camunda.org/manual/latest/reference/bpmn20/gateways/sequence-flow/ -->
<template>
  <Base :moddle="moddle" :bo="bo" @write="write">
    <template v-if="typeVisible && conditionVisible" #custom>
      <FormItemSelect
        v-model="conditionType"
        :options="conditionTypes"
        label="Condition Type"
        @change="changeCondition"
      />
      <Condition v-model="bo" :condition-type="conditionType" @save-condition="writeCondition" />
    </template>
  </Base>
</template>

<script>
import Base from '../embbed/Base'
import Condition from '../part/detail/Condition'
import FormItemSelect from '../ui/FormItemSelect'
import elementHelper from '../../mixins/elementHelper'
import { customize, isConditionalSource } from '../../utils'
import { createFormalExpression } from '../../utils/creators'
import { CONDITION_TYPES } from '../../utils/constants'

export default {
  name: 'SequenceFlow',
  components: {
    Base,
    Condition,
    FormItemSelect
  },
  mixins: [elementHelper],
  data() {
    return {
      conditionTypes: CONDITION_TYPES,
      conditionType: ''
    }
  },
  computed: {
    typeVisible() {
      return isConditionalSource(this.element.source)
    },
    conditionVisible() {
      return this.propertyVisible('conditionExpression')
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
