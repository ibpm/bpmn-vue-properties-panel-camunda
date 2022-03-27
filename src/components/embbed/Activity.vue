<template>
  <div>
    <Common :moddle="moddle" :bo="bo" :templates="templates" @sync="sync" @write="write">
      <template #detail>
        <slot name="detail" />
        <el-form-item :label="$customTranslate('Multi Instance')">
          <el-badge :is-dot="Boolean(bo.loopCharacteristics)">
            <el-button @click="showMultiInstance = true">
              {{ $customTranslate('Update') }}
            </el-button>
          </el-badge>
        </el-form-item>
      </template>
    </Common>
    <MultiInstance v-if="showMultiInstance" :moddle="moddle" :bo="bo" @write="write" @close="showMultiInstance = false" />
  </div>
</template>

<script>
import Common from '../../components/embbed/Common'
import MultiInstance from '../../components/part/detail/MultiInstance'
import areaHelper from '../../mixins/areaHelper'

export default {
  name: 'Activity',
  components: {
    Common,
    MultiInstance
  },
  mixins: [areaHelper],
  data() {
    return {
      showMultiInstance: false
    }
  },
  methods: {
    sync() {
      this.$emit('sync')
    }
  }
}
</script>
