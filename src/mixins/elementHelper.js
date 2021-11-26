export default {
  props: {
    element: {
      type: Object,
      required: true
    },
    modeling: {
      type: Object,
      required: true
    },
    moddle: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      form: {}
    }
  },
  created() {
    this.read()
  },
  methods: {
    read() {
      this.form = { ...this.element.businessObject }
      delete this.form.$type
      delete this.form.flowElements
      delete this.form.di
      delete this.form.sourceRef
      delete this.form.targetRef
    },
    write(properties) {
      this.modeling.updateProperties(this.element, properties)
    }
  }
}
