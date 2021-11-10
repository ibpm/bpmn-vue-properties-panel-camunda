export default {
  data() {
    return {
      PROP_NAME: null,
      value_: this.value
    }
  },
  watch: {
    value_(val) {
      this.$emit('up', { [this.PROP_NAME]: val })
    }
  }
}
