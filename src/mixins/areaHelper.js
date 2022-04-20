import { isPropertyVisible } from '../utils'

export default {
  props: {
    element: {
      type: Object,
      required: false,
      readOnly: true
    },
    moddle: {
      type: Object,
      required: true
    },
    bo: {
      type: Object,
      required: true
    }
  },
  methods: {
    write(properties) {
      this.$emit('write', properties)
    },
    propertyVisible(prop) {
      return isPropertyVisible(prop, this.bo)
    }
  }
}
