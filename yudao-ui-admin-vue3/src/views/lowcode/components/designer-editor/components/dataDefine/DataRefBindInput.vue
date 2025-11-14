<template>
  <ArrayValueInput
    :minLength="1"
    :sort="false"
    :group="{ pull: false, put: false }"
    v-model="bindListVModel"
    @add="handleAdd"
    @remove="handleRemove"
  >
    <template #item="{ index }">
      <DataRefBindBaseInput
        :editor="editor"
        :bind-options="bindOptions"
        :ref-prop-types="refPropTypes"
        :disabled="disabled"
        v-model="bindListVModel[index]"
        @change="bindListTriggerUpdate"
      />
    </template>
  </ArrayValueInput>
  <LowcodeCard class="mt-2" name="转换代码" :actions="refFunctionActions">
    <AceEditor
      lang="javascript"
      :height="100"
      :readonly="disabled"
      v-model="valueVModel.refFunction"
      @change="triggerUpdate"
    />
  </LowcodeCard>
</template>

<script lang="ts" setup>
import { isNullOrUnDef } from '@/utils/is'
import {
  WidgetDataDefinePropType,
  WidgetPropDefineBind,
  WidgetDataDefine,
  WidgetPropDefineBindBind,
  WidgetPropDefineBindBase,
  DesignerEditor
} from '../../designer-editor.type'
import LowcodeCard from '../../../common/LowcodeCard.vue'
import AceEditor from '../../../ace-editor/index.vue'
import { createDataDefine } from '../../designer-editor.utils'
import ArrayValueInput from '../../../common/ArrayValueInput.vue'
import DataRefBindBaseInput from './DataRefBindBaseInput.vue'
import { computedVModel } from '../../../common/hooks'

export interface DataRefBindInputProps {
  editor: DesignerEditor
  modelValue?: WidgetPropDefineBind
  bindOptions?: WidgetPropDefineBindBind[]
  refPropTypes?: WidgetDataDefinePropType[]
  disableExecute?: boolean
  disabled?: boolean
}

export type DataRefBindInputEmits = {
  'update:modelValue': [val?: WidgetPropDefineBind]
  change: [val?: WidgetPropDefineBind]
  execute: []
}

const openDataDefineExecuteDialog = inject('openDataDefineExecuteDialog') as Function

const props = withDefaults(defineProps<DataRefBindInputProps>(), {
  modelValue: () => ({ bindList: [{}] }),
  bindOptions: () => []
})

const emits = defineEmits<DataRefBindInputEmits>()

const { valueVModel, triggerUpdate } = computedVModel({
  get() {
    return props.modelValue
  },
  set(val?: WidgetPropDefineBind) {
    emits('update:modelValue', val)
    emits('change', val)
  }
})

const { valueVModel: bindListVModel, triggerUpdate: bindListTriggerUpdate } = computedVModel({
  get() {
    return props.modelValue.bindList ?? [{}]
  },
  set(vals?: WidgetPropDefineBindBase[]) {
    valueVModel.value.bindList = [...(vals ?? [])]
    triggerUpdate()
  }
})

const refFunctionActions = computed(() => {
  return [
    {
      type: 'danger',
      label: '执行',
      isShow: !props.disableExecute,
      onClick: () => {
        emits('execute')
      }
    },
    {
      type: 'success',
      label: '结果',
      isShow: true,
      onClick: () => {
        doOpenDataDefineExecuteDialog(
          createDataDefine({ _type: 'ref', refBind: { ...valueVModel.value } })
        )
      }
    },
    {
      type: 'warning',
      label: '重置',
      onClick: () => {
        valueVModel.value.refFunction = '(val) => val'
        triggerUpdate()
      }
    }
  ]
})

const doOpenDataDefineExecuteDialog = (dataDefine?: WidgetDataDefine) => {
  if (!isNullOrUnDef(dataDefine)) {
    openDataDefineExecuteDialog({ dataDefine: dataDefine })
  }
}
const handleAdd = (index: number) => {
  bindListVModel.value = bindListVModel.value.toSpliced(index + 1, 0, {})
}

const handleRemove = (index: number) => {
  bindListVModel.value = bindListVModel.value.toSpliced(index, 1)
}
</script>
