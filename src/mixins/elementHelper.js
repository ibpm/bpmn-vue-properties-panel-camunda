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
        this.updateProperties()
      },
      deep: true
    }
  },
  created() {
    this.form = {
      ...this.element.businessObject,
      ...this.element.businessObject.$attrs
    }
    // 因为documentation是xml子元素，无法注入form，需要特殊处理下
    if (this.form.documentation) {
      let str = ''
      this.form.documentation.forEach(item => {
        str += item.text
      })
      this.form.doc = str
    }
  },
  methods: {
    updateProperties(val = {}) {
      const properties = {
        ...Object.assign(this.form, val)
      }
      this.preHandle(properties)
      this.modeler.get('modeling').updateProperties(this.element, properties)
    },
    preHandle(properties) {
      properties.documentation = properties.doc
        ? [this.modeler.get('moddle').create('bpmn:Documentation', { text: properties.doc })] : []
      delete properties.doc
      delete properties.$type
    }
  }
}
