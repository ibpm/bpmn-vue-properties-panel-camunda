<template>
  <div>
    <el-dialog
      :title="$customTranslate('Task Listener')"
      :visible.sync="dialogVisible"
      class="listenerStyle"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
      @closed="$emit('close')"
    >
      <el-form ref="listenerForm" :model="listenerForm" size="mini">
        <el-table :data="listenerForm.tableData" border>
          <el-table-column prop="eventType" :label="$customTranslate('Event Type')">
            <template slot-scope="scope">
              <el-form-item :prop="'tableData.' + scope.$index + '.eventType'" :rules="[{ required: true, message: $customTranslate('Event Type'), trigger: 'change' }]">
                <el-select v-model="scope.row.eventType">
                  <el-option v-for="(item, index) in eventTypes" :key="index" :label="item" :value="item" />
                </el-select>
              </el-form-item>
            </template>
          </el-table-column>
          <el-table-column prop="listenerType" :label="$customTranslate('Listener Type')">
            <template slot-scope="scope">
              <el-form-item :prop="'tableData.' + scope.$index + '.listenerType'" :rules="[{ required: true, message: $customTranslate('Listener Type'), trigger: 'change' }]">
                <el-select v-model="scope.row.listenerType">
                  <el-option v-for="(item, index) in listenerTypes" :key="index" :label="$customTranslate(item.label)" :value="item.value" />
                </el-select>
              </el-form-item>
            </template>
          </el-table-column>
          <el-table-column prop="listenerId" :label="$customTranslate('Listener Id')">
            <template slot-scope="scope">
              <FormItemGeneratedInput
                v-model="scope.row.listenerId"
                :prop="'tableData.' + scope.$index + '.listenerId'"
              />
            </template>
          </el-table-column>
          <el-table-column :label="$customTranslate('Config')">
            <template slot-scope="scope">
              <FormItemInput
                v-if="scope.row.listenerType !== 'script'"
                v-model="scope.row.content"
                :placeholder="$customTranslate(listenerTypes.find(item => item.value === scope.row.listenerType).label)"
              />
              <template v-else>
                <FormItemInput v-model="scope.row.scriptFormat" :placeholder="$customTranslate('Script Format')" prop="scriptFormat" />
                <el-form-item prop="scriptType">
                  <el-select v-model="scope.row.scriptType" :placeholder="$customTranslate('Script Type')">
                    <el-option :label="$customTranslate('Inline Script')" value="inlineScript" />
                    <el-option :label="$customTranslate('External Resource')" value="externalResource" />
                  </el-select>
                </el-form-item>
                <FormItemTextArea v-if="!showResource(scope.row.scriptType)" v-model="scope.row.script" :placeholder="$customTranslate('Script')" prop="script" />
                <FormItemInput v-else v-model="scope.row.resource" :placeholder="$customTranslate('Resource')" prop="resource" />
              </template>
            </template>
          </el-table-column>
          <el-table-column :label="$customTranslate('Operation')">
            <template slot-scope="scope">
              <el-form-item>
                <el-button type="primary" size="mini" icon="el-icon-plus" circle @click.native.prevent="addParamsSetting(scope.$index)" />
                <el-button type="danger" size="mini" icon="el-icon-minus" circle @click.native.prevent="deleteRow(scope.$index)" />
              </el-form-item>
            </template>
          </el-table-column>
        </el-table>
      </el-form>
      <span slot="footer">
        <el-button type="primary" @click="closeDialog">{{ $customTranslate('Confirm') }}</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import areaHelper from '@/mixins/areaHelper'
import FormItemInput from '@/components/ui/FormItemInput'
import FormItemTextArea from '@/components/ui/FormItemTextArea'
import FormItemGeneratedInput from '@/components/ui/FormItemGeneratedInput'
import { isResource } from '@/utils/helper'

export default {
  name: 'TaskListener',
  components: { FormItemInput, FormItemTextArea, FormItemGeneratedInput },
  mixins: [areaHelper],
  data() {
    return {
      eventTypes: [
        'create',
        'assignment',
        'complete',
        'delete',
        'update',
        'timeout'
      ],
      listenerTypes: [
        {
          label: 'Java Class',
          value: 'class'
        },
        {
          label: 'Expression',
          value: 'expression'
        },
        {
          label: 'Delegate Expression',
          value: 'delegateExpression'
        },
        {
          label: 'Script',
          value: 'script'
        }
      ],
      dialogVisible: true,
      showParamDialog: false,
      nowIndex: null,
      listenerForm: { // 呼叫参数设置
        tableData: [{
          eventType: 'create',
          listenerType: 'class'
        }]
      }
    }
  },
  methods: {
    showResource(scriptType) {
      return isResource(scriptType)
    },
    closeDialog() {
      this.dialogVisible = false
    },
    addList() {
      this.listenerForm.tableData.push({
        beginTime: '',
        endTime: ''
      })
    },
    // 新增 有效拨打时间
    addParamsSetting() {
      this.addList()
    },
    // 删除当前行
    deleteRow(index) {
      this.listenerForm.tableData.splice(index, 1)
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss">
@import "~@/styles/bpmn.scss";
</style>

