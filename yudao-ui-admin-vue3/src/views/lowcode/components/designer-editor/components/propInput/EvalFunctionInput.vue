<template>
  <div class="w-full">
    <div v-if="!isBound" class="flex-1 flex justify-end">
      <el-button type="primary" link @click="doBind"> 去绑定 </el-button>
    </div>
    <EvalFunctionBoundValueInput
      v-else
      :editor="editor"
      :widget="widget"
      :helps="helps"
      :default-function="defaultFunction"
      v-model="valueVModel"
      @open-edit-dialog="doBind"
    />
  </div>
</template>
<script lang="ts" setup>
import { isNullOrUnDef } from '@/utils/is'
import {
  DesignerEditor,
  DesignerEditorEvalFunction,
  DesignerEditorEvalFunctionType,
  WidgetInstance
} from '../../designer-editor.type'
import { computedVModel } from '../../../common/hooks'
import EvalFunctionBoundValueInput from '../EvalFunctionBoundValueInput.vue'

export interface EvalFunctionInputProps {
  editor: DesignerEditor
  widget: WidgetInstance
  type?: DesignerEditorEvalFunctionType
  helps?: string
  defaultFunction?: string
  modelValue?: DesignerEditorEvalFunction
}

export type EvalFunctionInputEmits = {
  'update:modelValue': [val?: DesignerEditorEvalFunction]
  change: [val?: DesignerEditorEvalFunction]
}

const props = withDefaults(defineProps<EvalFunctionInputProps>(), {
  modelValue: () => ({})
})

const emits = defineEmits<EvalFunctionInputEmits>()

const openEvalFunctionEditDialog = inject('openEvalFunctionEditDialog') as Function

const { valueVModel } = computedVModel({
  get: () => {
    return props.modelValue ?? {}
  },
  set: (val?: DesignerEditorEvalFunction) => {
    emits('update:modelValue', val)
    emits('change', val)
  }
})

const isBound = computed(() => !isNullOrUnDef(valueVModel.value?.evalFunction))

const doBind = () => {
  openEvalFunctionEditDialog({
    widget: props.widget,
    type: props.type,
    helps: props.helps,
    defaultFunction: props.defaultFunction,
    value: valueVModel.value,
    onSubmit: (val?: DesignerEditorEvalFunction) => {
      valueVModel.value = val
    }
  })
}
</script>
<style lang="scss" scoped></style>
