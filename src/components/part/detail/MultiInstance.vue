<template>
  <el-dialog
    :title="$customTranslate('Multi Instance')"
    :visible.sync="dialogVisible"
    :close-on-click-modal="false"
    width="500px"
    @closed="$emit('close')"
  >
    <el-form ref="form_" :model="form_" label-width="150px" size="mini">
      <el-form-item :label="$customTranslate('Multi Instance')" prop="isSequential">
        <el-switch
          v-model="form_.isSequential"
          :active-text="$customTranslate('Sequential Multi Instance')"
          :inactive-text="$customTranslate('Parallel Multi Instance')"
        />
      </el-form-item>
      <FormItemInput
        v-model="form_.loopCardinality"
        prop="loopCardinality"
        :label="$customTranslate('Loop Cardinality')"
      />
      <FormItemInput
        v-model="form_.collection"
        prop="collection"
        :label="$customTranslate('Collection')"
      />
      <FormItemInput
        v-model="form_.elementVariable"
        prop="elementVariable"
        :label="$customTranslate('Element Variable')"
      />
      <FormItemInput
        v-model="form_.completionCondition"
        prop="completionCondition"
        :label="$customTranslate('Completion Condition')"
      />
      <FormItemSwitch
        v-model="form_.asyncBefore"
        :label="$customTranslate('Multi Instance') + ' ' + $customTranslate('Asynchronous Before')"
        prop="asyncBefore"
      />
      <FormItemSwitch
        v-model="form_.asyncAfter"
        :label="$customTranslate('Multi Instance') + ' ' + $customTranslate('Asynchronous After')"
        prop="asyncAfter"
      />
      <template v-if="form_.asyncBefore || form_.asyncAfter">
        <FormItemSwitch
          v-model="form_.exclusive"
          :label="$customTranslate('Multi Instance') + ' ' + $customTranslate('Exclusive')"
          prop="exclusive"
        />
        <FormItemInput
          v-model="form_.failedJobRetryTimeCycle"
          :label="$customTranslate('Multi Instance') + ' ' + $customTranslate('Retry Time Cycle')"
          prop="failedJobRetryTimeCycle"
        />
      </template>
    </el-form>
    <span slot="footer">
      <el-button type="primary" @click="form_ = {}">{{ $customTranslate('Clear') }}</el-button>
      <el-button type="success" @click="save">{{ $customTranslate('Save') }}</el-button>
    </span>
  </el-dialog>
</template>

<script>
import FormItemInput from '@/components/ui/FormItemInput'
import FormItemSwitch from '@/components/ui/FormItemSwitch'
import areaHelper from '@/mixins/areaHelper'
import { createFormalExpression, customize } from '@/utils/helper'

export default {
  name: 'MultiInstance',
  components: { FormItemInput, FormItemSwitch },
  mixins: [areaHelper],
  data() {
    return {
      dialogVisible: true
    }
  },
  created() {
    this.read()
  },
  methods: {
    read() {
      let failedJobRetryTimeCycle
      if (this.form.loopCharacteristics?.extensionElements?.values?.length > 0) {
        failedJobRetryTimeCycle = this.form.loopCharacteristics.extensionElements.values[0].body
      } else {
        failedJobRetryTimeCycle = null
      }
      this.form_ = {
        ...this.form.loopCharacteristics,
        loopCardinality: this.form.loopCharacteristics?.loopCardinality?.body,
        completionCondition: this.form.loopCharacteristics?.completionCondition?.body,
        failedJobRetryTimeCycle: failedJobRetryTimeCycle
      }
    },
    writeSub() {
      let extensionElements
      if (this.form_.failedJobRetryTimeCycle) {
        extensionElements = this.moddle.create('bpmn:ExtensionElements')
        extensionElements.values = [this.moddle.create(customize('FailedJobRetryTimeCycle'),
          { body: this.form_.failedJobRetryTimeCycle })]
      } else {
        extensionElements = null
      }
      const loopCharacteristics = this.moddle.create('bpmn:MultiInstanceLoopCharacteristics', {
        isSequential: this.form_.isSequential,
        collection: this.form_.collection,
        elementVariable: this.form_.elementVariable,
        loopCardinality: this.form_.loopCardinality
          ? createFormalExpression(this.moddle, { body: this.form_.loopCardinality }) : null,
        completionCondition: this.form_.completionCondition
          ? createFormalExpression(this.moddle, { body: this.form_.completionCondition }) : null,
        asyncBefore: this.form_.asyncBefore,
        asyncAfter: this.form_.asyncAfter,
        exclusive: this.form_.exclusive,
        extensionElements: extensionElements
      })
      this.form.loopCharacteristics = loopCharacteristics
      this.write({ loopCharacteristics: loopCharacteristics })
    },
    save() {
      console.log(this.form_)
      if (this.form_.loopCardinality || this.form_.collection) {
        this.$refs['form_'].validate().then(() => {
          this.writeSub()
          this.dialogVisible = false
        }).catch(e => console.error(e))
      } else {
        this.form.loopCharacteristics = null
        this.write({ loopCharacteristics: null })
        this.dialogVisible = false
      }
    }
  }
}
</script>
