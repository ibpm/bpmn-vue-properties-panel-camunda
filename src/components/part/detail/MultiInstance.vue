<template>
  <el-dialog
    :title="$customTranslate('Multi Instance')"
    :visible.sync="visible"
    :close-on-click-modal="false"
    width="500px"
  >
    <el-form ref="form" :model="form" label-width="150px" size="mini">
      <el-form-item :label="$customTranslate('Multi Instance')" prop="isSequential">
        <el-switch
          v-model="form.isSequential"
          :active-text="$customTranslate('Sequential Multi Instance')"
          :inactive-text="$customTranslate('Parallel Multi Instance')"
        />
      </el-form-item>
      <FormItemInput
        v-model="form.loopCardinality"
        label="Loop Cardinality"
        prop="loopCardinality"
      />
      <FormItemInput
        v-model="form.collection"
        label="Collection"
        prop="collection"
      />
      <FormItemInput
        v-model="form.elementVariable"
        label="Element Variable"
        prop="elementVariable"
      />
      <FormItemInput
        v-model="form.completionCondition"
        label="Completion Condition"
        prop="completionCondition"
      />
      <FormItemSwitch
        v-model="form.asyncBefore"
        :label="$customTranslate('Multi Instance') + ' ' + $customTranslate('Asynchronous Before')"
        prop="asyncBefore"
      />
      <FormItemSwitch
        v-model="form.asyncAfter"
        :label="$customTranslate('Multi Instance') + ' ' + $customTranslate('Asynchronous After')"
        prop="asyncAfter"
      />
      <template v-if="form.asyncBefore || form.asyncAfter">
        <FormItemSwitch
          v-model="form.exclusive"
          :label="$customTranslate('Multi Instance') + ' ' + $customTranslate('Exclusive')"
          prop="exclusive"
        />
        <FormItemInput
          v-model="form.failedJobRetryTimeCycle"
          :label="$customTranslate('Multi Instance') + ' ' + $customTranslate('Retry Time Cycle')"
          prop="failedJobRetryTimeCycle"
        />
      </template>
    </el-form>
    <span slot="footer">
      <el-button type="info" @click="close">{{ $customTranslate('Cancel') }}</el-button>
      <el-button type="primary" @click="form = {}">{{ $customTranslate('Clear') }}</el-button>
      <el-button type="success" @click="save">{{ $customTranslate('Save') }}</el-button>
    </span>
  </el-dialog>
</template>

<script>
import FormItemInput from '../../ui/FormItemInput'
import FormItemSwitch from '../../ui/FormItemSwitch'
import areaHelper from '../../../mixins/areaHelper'
import dialogHelper from '../../../mixins/dialogHelper'
import { customize } from '../../../utils'
import { addAndRemoveElementsFromExtensionElements, createFormalExpression } from '../../../utils/creators'
import { is } from 'bpmn-js/lib/util/ModelUtil'

export default {
  name: 'MultiInstance',
  components: { FormItemInput, FormItemSwitch },
  mixins: [areaHelper, dialogHelper],
  data() {
    return {
      form: null
    }
  },
  created() {
    this.read()
  },
  methods: {
    read() {
      this.form = {
        ...this.bo.loopCharacteristics,
        loopCardinality: this.bo.loopCharacteristics?.loopCardinality?.body,
        completionCondition: this.bo.loopCharacteristics?.completionCondition?.body,
        failedJobRetryTimeCycle: this.bo.loopCharacteristics?.extensionElements?.values[0]?.body
      }
    },
    update() {
      const
        loopCharacteristics = this.moddle.create('bpmn:MultiInstanceLoopCharacteristics', {
          isSequential: this.form.isSequential,
          collection: this.form.collection,
          elementVariable: this.form.elementVariable,
          loopCardinality: this.form.loopCardinality
            ? createFormalExpression(this.moddle, { body: this.form.loopCardinality }) : null,
          completionCondition: this.form.completionCondition
            ? createFormalExpression(this.moddle, { body: this.form.completionCondition }) : null,
          asyncBefore: this.form.asyncBefore,
          asyncAfter: this.form.asyncAfter,
          exclusive: this.form.exclusive
        }),
        matcher = item => !is(item, customize('FailedJobRetryTimeCycle')),
        objectsToAdd = this.form.failedJobRetryTimeCycle
          ? [this.moddle.create(customize('FailedJobRetryTimeCycle'), {
            body: this.form.failedJobRetryTimeCycle
          })] : undefined
      loopCharacteristics.extensionElements =
        addAndRemoveElementsFromExtensionElements(this.moddle, loopCharacteristics, objectsToAdd, matcher)
      this.write({ loopCharacteristics:
        this.bo.loopCharacteristics = loopCharacteristics
      })
    },
    save() {
      if (this.form.loopCardinality || this.form.collection) {
        this.$refs['form'].validate().then(() => {
          this.update()
          this.close()
        }).catch(e => console.error(e))
      } else {
        this.bo.loopCharacteristics = undefined
        this.close()
      }
    }
  }
}
</script>
