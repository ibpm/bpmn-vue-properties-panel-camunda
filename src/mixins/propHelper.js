export default {
  data() {
    return {
      PROP_NAME: null,
      value_: this.value
    }
  },
  watch: {
    value_(val) {
      this.$emit('updateBase', { [this.PROP_NAME]: val })
    }
  }
}
