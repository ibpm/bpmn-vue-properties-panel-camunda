<template>
  <el-form-item :label="$customTranslate(label)" :prop="prop" :rules="rules">
    <el-input v-model="value_" clearable :placeholder="$customTranslate(placeholder)" @input="input">
      <el-button slot="append" icon="el-icon-refresh" @click="generate" />
    </el-input>
  </el-form-item>
</template>

<script>
import propHelper from '../../mixins/propHelper'
import { next } from '../../utils/tools'

export default {
  name: 'FormItemGeneratedInput',
  mixins: [propHelper],
  props: {
    value: {
      type: String,
      default: null
    },
    prefix: {
      type: String,
      default: null
    }
  },
  methods: {
    generate() {
      this.input(next(this.prefix))
    }
  }
}
</script>
