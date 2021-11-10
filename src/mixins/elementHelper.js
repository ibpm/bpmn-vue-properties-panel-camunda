import { commonParse } from '@/utils/tools'
export default {
  props: {
    modeler: {
      type: Object,
      required: true
    },
    element: {
      type: Object,
      required: true
    }
  },
  methods: {
    updateProperties(properties) {
      this.modeler.get('modeling').updateProperties(this.element, properties)
    },
    updateForm() {
      return commonParse(this.element)
    }
  }
}
