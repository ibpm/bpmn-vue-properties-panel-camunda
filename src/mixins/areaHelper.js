export default {
  props: {
    moddle: {
      type: Object,
      required: true
    },
    bo: {
      type: Object,
      required: true
    },
    rules: {
      type: Object,
      required: false,
      default: () => {}
    },
    templates: {
      type: Array,
      default: () => []
    }
  },
  methods: {
    write(properties) {
      this.$emit('write', properties)
    }
  }
}
