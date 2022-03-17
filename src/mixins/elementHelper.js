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
    },
    businessObject: {
      type: Object,
      required: true
    },
    templates: {
      type: Array,
      default: () => []
    }
  },
  methods: {
    write(properties) {
      this.modeling.updateProperties(this.element, properties)
    }
  }
}
