export default {
  props: {
    prop: {
      type: String,
      default: null
    },
    label: {
      type: String,
      default: null
    },
    placeholder: {
      type: String,
      default: null
    },
    rules: {
      type: Array,
      default: null
    }
  },
  data() {
    return {
      value_: this.value
    }
  },
  methods: {
    input(val) {
      this.$emit('input', val)
    }
  }
}
