<template>
  <el-form-item :label="label" :prop="prop" :rules="rules">
    <el-input v-model="value_" clearable :placeholder="placeholder" @input="input">
      <el-button slot="append" icon="el-icon-refresh" @click="generate" />
    </el-input>
  </el-form-item>
</template>

<script>
import propHelper from '@/mixins/propHelper'
import { next } from '@/utils/tools'

export default {
  name: 'FormItemGeneratedInput',
  mixins: [propHelper],
  props: {
    value: {
      type: String,
      default: null
    }
  },
  methods: {
    generate() {
      this.value_ = next()
      this.input(this.value_)
    }
  }
}
</script>
