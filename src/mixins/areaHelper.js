export default {
  props: {
    moddle: {
      type: Object,
      required: true
    },
    form: {
      type: Object,
      required: true
    },
    rules: {
      type: Object,
      required: false,
      default: () => {}
    }
  },
  data() {
    return {
      form_: this.form
    }
  },
  methods: {
    write(properties) {
      this.$emit('write', properties)
    }
  }
}