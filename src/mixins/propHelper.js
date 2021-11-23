export default {
  props: {
    value: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      PROP_NAME: null,
      value_: this.value
    }
  },
  watch: {
    value_(val) {
      this.$emit('serialize', { [this.PROP_NAME]: val })
    }
  }
}
