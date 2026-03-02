<template>
  <AceInputCard
    title="绑定函数"
    lang="javascript"
    :height="120"
    :tips="tips"
    :helps="helps"
    :actions="actions"
    v-model:model-value="valueVModel.evalFunction"
    @update:model-value="updateValueVModel"
  />
</template>
<script lang="ts" setup>
import { DesignerEditor, DesignerEditorEvalFunction, WidgetInstance } from '../designer-editor.type'
import {
  evalFunctionBuiltInHelps,
  buildEvalFnContext,
  executeEvalFunction,
  getEvalFunctionTips,
  toggleDeffaultFunction
} from '../designer-editor.utils'
import { computedVModel } from '../../common/hooks'
import AceInputCard from '../../common/AceInputCard.vue'

export interface EvalFunctionBoundValueInputProps {
  editor: DesignerEditor
  widget: WidgetInstance
  helps?: string
  defaultFunction?: string
  modelValue?: DesignerEditorEvalFunction
}

export type EvalFunctionBoundValueInputEmits = {
  'update:modelValue': [val?: DesignerEditorEvalFunction]
  change: [val?: DesignerEditorEvalFunction]
  'open-edit-dialog': []
}

const props = withDefaults(defineProps<EvalFunctionBoundValueInputProps>(), {
  modelValue: () => ({})
})

const message = useMessage()

const emits = defineEmits<EvalFunctionBoundValueInputEmits>()

const { valueVModel } = computedVModel({
  get: () => {
    return props.modelValue ?? {}
  },
  set: (val?: DesignerEditorEvalFunction) => {
    emits('update:modelValue', val)
    emits('change', val)
  }
})

const tips = computed(() => getEvalFunctionTips(valueVModel.value))

const helps = computed(() => evalFunctionBuiltInHelps(props.helps))

const updateValueVModel = (val) => {
  valueVModel.value = { ...valueVModel.value, evalFunction: val }
}

const actions = computed(() => {
  return [
    {
      type: 'success',
      label: '运行',
      onClick: async () => {
        const result = await executeEvalFunction(
          props.editor,
          buildEvalFnContext(props.editor, { runtime: false, _vid: props.widget._vid }),
          valueVModel.value
        )
        message.info(`执行结果${JSON.stringify(result)}`)
      }
    },
    {
      type: 'warning',
      label: '修改',
      onClick: () => {
        emits('open-edit-dialog')
      }
    },
    {
      type: 'danger',
      label: '删除',
      onClick: () => {
        valueVModel.value = undefined
      }
    },
    {
      type: 'primary',
      label: '重置',
      onClick: () => {
        updateValueVModel(
          toggleDeffaultFunction(valueVModel.value.evalFunction, props.defaultFunction)
        )
      }
    }
  ]
})
</script>
<style lang="scss" scoped></style>
