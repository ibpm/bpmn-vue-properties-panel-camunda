<template>
  <div>
    <Common :moddle="moddle" :form="form_" @write="write">
      <template #detail>
        <el-form-item :label="$customTranslate('Multi Instance')">
          <el-badge :is-dot="Boolean(form.loopCharacteristics)">
            <el-button @click="showMultiInstance = true">
              {{ $customTranslate('Update') }}
            </el-button>
          </el-badge>
        </el-form-item>
        <slot name="detail" />
      </template>
    </Common>
    <MultiInstance v-if="showMultiInstance" :moddle="moddle" :form="form_" @write="write" @close="finishMultiInstance" />
  </div>
</template>

<script>
import Common from '@/components/embbed/Common'
import MultiInstance from '@/components/part/detail/MultiInstance'
import areaHelper from '@/mixins/areaHelper'

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
    finishMultiInstance() {
      this.showMultiInstance = false
    }
  }
}
</script>
