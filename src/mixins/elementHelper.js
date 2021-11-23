import { isExpression, isScript, isResource } from '@/utils/helper'

export default {
  props: {
    modeler: {
      type: Object,
      required: true
    },
    element: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      form: {}
    }
  },
  watch: {
    form: {
      handler: function(val) {
        this.serialize(val)
      },
      deep: true
    }
  },
  created() {
    this.deserialize()
  },
  methods: {
    deserialize() {
      this.form = {
        ...this.element.businessObject
      }
      this.postHandle()
    },
    postHandle() {
      delete this.form.$type
      delete this.form.flowElements
      delete this.form.di
      delete this.form.sourceRef
      delete this.form.targetRef
      delete this.form.conditionType

      if (this.form.documentation) {
        let str = ''
        this.form.documentation.forEach(item => {
          str += item.text
        })
        if (str.length > 0) {
          this.form.doc = str
        }
        delete this.form.documentation
      }
      if (this.form.conditionExpression) {
        if (this.form.conditionExpression.language) {
          this.form.conditionType = 'script'
          this.form.scriptFormat = this.form.conditionExpression.language
          if (this.form.conditionExpression.body) {
            this.form.script = this.form.conditionExpression.body
            this.form.scriptType = 'inlineScript'
          } else {
            this.form.resource = this.form.conditionExpression.resource
            this.form.scriptType = 'externalResource'
          }
        } else {
          this.form.conditionType = 'expression'
          this.form.expression = this.form.conditionExpression.body
        }
        delete this.form.conditionExpression
      }
    },
    serialize(val = {}) {
      const properties = {
        ...Object.assign(this.form, val)
      }
      this.preHandle(properties)
      this.modeler.get('modeling').updateProperties(this.element, properties)
    },
    preHandle(properties) {
      // documentation
      properties.documentation = properties.doc
        ? [this.modeler.get('moddle').create('bpmn:Documentation', { text: properties.doc })] : []
      delete properties.doc

      // condition type
      if (properties.expression) {
        console.log(properties.expression)
        let formalExpression = this.modeler.get('moddle').create('bpmn:FormalExpression', { body: properties.expression })
        delete properties.expression
        properties.conditionExpression = formalExpression
        delete properties.conditionType
      }
      /* if (isExpression(properties.conditionType)) {
        formalExpression = this.modeler.get('moddle').create('bpmn:FormalExpression', { body: properties.expression })
        delete properties.expression
      } else if (isScript(properties.conditionType)) {
        if (isResource(properties.scriptType)) {
          formalExpression = this.modeler.get('moddle').create('bpmn:FormalExpression', {
            'camunda:resource': properties.resource,
            language: properties.scriptFormat
          })
          delete properties.resource
        } else {
          formalExpression = this.modeler.get('moddle').create('bpmn:FormalExpression', {
            body: properties.script,
            language: properties.scriptFormat
          })
          delete properties.script
        }
        delete properties.scriptFormat
        delete properties.scriptType
      } else {
        formalExpression = undefined
      }
      properties.conditionExpression = formalExpression
      delete properties.conditionType
      */

      delete properties.$type
    }
  }
}
