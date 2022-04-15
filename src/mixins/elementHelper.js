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
      bo: this.getBO(),
      templates: this.$store.state.templateMap[this.bo?.$type]
    }
  },
  methods: {
    write(properties) {
      this.modeling.updateProperties(this.element, properties)
      this.bo = this.getBO()
    },
    getBO() {
      return { ...this.element.businessObject }
    }
  }
}
