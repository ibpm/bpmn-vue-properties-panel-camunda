<template>
  <div>
    <el-tabs v-if="templates.length" v-model="tabName" type="card" @tab-click="clickTab">
      <el-tab-pane :label="$customTranslate('General')" name="general">
        <General ref="general" :moddle="moddle" :bo="bo" :rules="rules" @write="write">
          <template #custom>
            <slot name="custom" />
          </template>
        </General>
      </el-tab-pane>
      <el-tab-pane :label="$customTranslate('Template')" name="templates">
        <Templates ref="templates" :moddle="moddle" :bo="bo" :templates="templates" @sync="sync" @write="write" />
      </el-tab-pane>
    </el-tabs>
    <General v-else ref="general" :moddle="moddle" :bo="bo" :rules="rules" @write="write">
      <template #custom>
        <slot name="custom" />
      </template>
    </General>
  </div>
</template>
<script>
import General from './General'
import Templates from './Templates'
import areaHelper from '../../mixins/areaHelper'
export default {
  name: 'Base',
  components: {
    General,
    Templates
  },
  mixins: [areaHelper],
  data() {
    return {
      tabName: 'general'
    }
  },
  methods: {
    sync() {
      this.$refs.general.read()
      this.$emit('sync')
    },
    clickTab(tab) {
      if (tab.name === 'general') {
        this.$refs.general.read()
      } else if (tab.name === 'templates') {
        this.$refs.templates.align()
      }
    }
  }
}
</script>
