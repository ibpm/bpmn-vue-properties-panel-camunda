<template>
  <el-dialog
    :title="$customTranslate('Multi Instance')"
    :visible.sync="visible"
    :close-on-click-modal="false"
    width="500px"
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
      <el-button type="info" @click="close">{{ $customTranslate('Cancel') }}</el-button>
      <el-button type="primary" @click="form_ = {}">{{ $customTranslate('Clear') }}</el-button>
      <el-button type="success" @click="save">{{ $customTranslate('Save') }}</el-button>
    </span>
  </el-dialog>
</template>

<script>
import FormItemInput from '@/components/ui/FormItemInput'
import FormItemSwitch from '@/components/ui/FormItemSwitch'
import areaHelper from '@/mixins/areaHelper'
import dialogHelper from '@/mixins/dialogHelper'
import { customize } from '@/utils/utils'
import { addAndRemoveElementsFromExtensionElements, createFormalExpression } from '@/utils/creators'
import { is } from 'bpmn-js/lib/util/ModelUtil'

export default {
  name: 'MultiInstance',
  components: { FormItemInput, FormItemSwitch },
  mixins: [areaHelper, dialogHelper],
  created() {
    this.read()
  },
  methods: {
    read() {
      this.form_ = {
        ...this.form.loopCharacteristics,
        loopCardinality: this.form.loopCharacteristics?.loopCardinality?.body,
        completionCondition: this.form.loopCharacteristics?.completionCondition?.body,
        failedJobRetryTimeCycle: this.form.loopCharacteristics?.extensionElements?.values[0]?.body
      }
    },
    update() {
      const
        loopCharacteristics = this.moddle.create('bpmn:MultiInstanceLoopCharacteristics', {
          isSequential: this.form_.isSequential,
          collection: this.form_.collection,
          elementVariable: this.form_.elementVariable,
          loopCardinality: this.form_.loopCardinality
            ? createFormalExpression(this.moddle, { body: this.form_.loopCardinality }) : null,
          completionCondition: this.form_.completionCondition
            ? createFormalExpression(this.moddle, { body: this.form_.completionCondition }) : null,
          asyncBefore: this.form_.asyncBefore,
          asyncAfter: this.form_.asyncAfter,
          exclusive: this.form_.exclusive
        }),
        matcher = item => !is(item, customize('FailedJobRetryTimeCycle')),
        objectsToAdd = this.form_.failedJobRetryTimeCycle
          ? [this.moddle.create(customize('FailedJobRetryTimeCycle'), {
            body: this.form_.failedJobRetryTimeCycle
          })] : undefined
      loopCharacteristics.extensionElements =
        addAndRemoveElementsFromExtensionElements(this.moddle, loopCharacteristics, objectsToAdd, matcher)
      this.form.loopCharacteristics = loopCharacteristics
    },
    save() {
      if (this.form_.loopCardinality || this.form_.collection) {
        this.$refs['form_'].validate().then(() => {
          this.update()
          this.close()
        }).catch(e => console.error(e))
      } else {
        this.form.loopCharacteristics = undefined
        this.close()
      }
    }
  }
}
</script>
