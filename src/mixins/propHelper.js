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
  computed: {
    value_: {
      get() {
        return this.value
      },
      set(newValue) {
        return newValue
      }
    }
  },
  methods: {
    input(val) {
      this.$emit('input', val)
    }
  }
}
