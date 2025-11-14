<template>
  <div class="w-full pos-relative">
    <div v-if="!isBound" class="flex-1 flex justify-end">
      <el-button type="primary" link @click="doBind"> 去绑定 </el-button>
    </div>
    <EvalFunctionBoundValueInput
      v-if="isBound"
      :editor="editor"
      :widget="widget"
      :helps="helps"
      :default-function="defaultFunction"
      v-model="onClickVModel"
      @open-edit-dialog="doBind"
    />
    <div class="pos-absolute z-99 bottom-4 right-4" v-if="isBound">
      <ActionButton
        :type="valueVModel.type"
        :label="valueVModel.label"
        :icon="valueVModel.icon"
        :size="valueVModel.size"
        :plain="valueVModel.plain"
        :link="valueVModel.link"
        :on-click="doBind"
      />
    </div>
  </div>
</template>
<script lang="ts" setup>
import { isNullOrUnDef } from '@/utils/is'
import ActionButton from '../../../common/ActionButton.vue'
import {
  ActionButtonConfig,
  DesignerEditor,
  DesignerEditorEvalFunction,
  WidgetInstance
} from '../../designer-editor.type'
import { computedVModel } from '../../../common/hooks'
import EvalFunctionBoundValueInput from '../EvalFunctionBoundValueInput.vue'

export interface ActionButtonInputProps {
  editor: DesignerEditor
  widget: WidgetInstance
  helps?: string
  defaultFunction?: string
  isMenuButton?: boolean
  modelValue?: ActionButtonConfig
}

export type ActionButtonInputEmits = {
  'update:modelValue': [val?: ActionButtonConfig]
  change: [val?: ActionButtonConfig]
}

const props = withDefaults(defineProps<ActionButtonInputProps>(), {
  modelValue: () => ({})
})

const emits = defineEmits<ActionButtonInputEmits>()

const openActionButtonEditDialog = inject('openActionButtonEditDialog') as Function

const { valueVModel } = computedVModel({
  get: () => {
    return props.modelValue ?? {}
  },
  set: (val?: ActionButtonConfig) => {
    emits('update:modelValue', val)
    emits('change', val)
  }
})

const { valueVModel: onClickVModel } = computedVModel({
  get: () => {
    return props.modelValue?.onClick
  },
  set: (val?: DesignerEditorEvalFunction) => {
    valueVModel.value = val ? { ...valueVModel.value, onClick: val } : undefined
  }
})

const isBound = computed(() => !isNullOrUnDef(onClickVModel.value?.evalFunction))

const doBind = () => {
  openActionButtonEditDialog({
    widget: props.widget,
    helps: props.helps,
    defaultFunction: props.defaultFunction,
    isMenuButton: props.isMenuButton,
    value: valueVModel.value,
    onSubmit: (val?: ActionButtonConfig) => {
      valueVModel.value = val
    }
  })
}

// const message = useMessage()
//
// const doAction = async () => {
//   if (!isNullOrUnDef(onClickVModel.value)) {
//     const context = buildEvalFnContext(props.editor, props.widget._vid)
//     const result = await executeEvalFunction(props.editor, onClickVModel.value, context)
//     message.info(`执行结果${JSON.stringify(result)}`)
//   }
// }
</script>
<style lang="scss" scoped></style>
