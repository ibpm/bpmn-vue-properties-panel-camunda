export default {
  data() {
    return {
      visible: true
    }
  },
  methods: {
    close() {
      this.visible = false
      this.$emit('close')
    }
  }
}
