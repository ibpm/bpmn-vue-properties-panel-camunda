export default {
  props: {
    form: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      form_: this.form
    }
  },
  watch: {
    form_: {
      handler: function(val) {
        this.serialize(val)
      },
      deep: true
    }
  },
  methods: {
    serialize(properties) {
      console.log(properties)
      this.$emit('serialize', properties)
    }
  }
}
