<template>
  <ArrayValueInput
    header-name-prefix="按钮"
    :group="{ pull: false, put: false }"
    :inline="false"
    v-model="valueVModel"
    @add="handleAdd"
    @remove="handleRemove"
  >
    <template #item="{ index }">
      <ActionButtonValueInput
        :editor="editor"
        :widget="widget"
        :helps="helps"
        :default-function="defaultFunction"
        :isMenuButton="isMenuButton"
        v-model="valueVModel[index]"
        @change="triggerUpdate"
      />
    </template>
  </ArrayValueInput>
</template>

<script setup lang="ts">
import ArrayValueInput from '../../common/ArrayValueInput.vue'
import { computedVModel } from '../../common/hooks'
import ActionButtonValueInput from './ActionButtonValueInput.vue'
import { ActionButtonConfig, DesignerEditor, WidgetInstance } from '../designer-editor.type'

export interface ActionButtonArrayValueInputProps {
  editor: DesignerEditor
  widget: WidgetInstance
  helps?: string
  defaultFunction?: string
  isMenuButton?: boolean
  modelValue?: ActionButtonConfig[]
}

export type ActionButtonArrayValueInputEmits = {
  'update:modelValue': [val?: ActionButtonConfig[]]
  change: [val?: ActionButtonConfig[]]
}

const props = withDefaults(defineProps<ActionButtonArrayValueInputProps>(), {
  modelValue: () => []
})

const emits = defineEmits<ActionButtonArrayValueInputEmits>()

const { valueVModel, triggerUpdate } = computedVModel({
  get() {
    return props.modelValue
  },
  set(val?: any[]) {
    emits('update:modelValue', val)
    emits('change', val)
  }
})

const handleAdd = (index: number) => {
  valueVModel.value = valueVModel.value.toSpliced(index + 1, 0, {
    type: 'primary',
    onClick: {},
    _vIfPermis: [],
    _vIfFun: {}
  })
}

const handleRemove = (index: number) => {
  valueVModel.value = valueVModel.value.toSpliced(index, 1)
}
</script>

<style scoped lang="scss"></style>
