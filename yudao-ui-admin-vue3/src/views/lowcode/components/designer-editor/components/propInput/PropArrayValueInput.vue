<template>
  <ArrayValueInput
    :sort="isDragSortable"
    :group="{ pull: false, put: false }"
    :readonly="readonly"
    :max-length="propDefine.maxLength"
    :min-length="propDefine.minLength"
    v-model="valueVModel"
    @add="handleAdd"
    @remove="handleRemove"
  >
    <template #item="{ index }">
      <PropValueInput
        :editor="editor"
        :widget="widget"
        :context="context"
        :widget-define="widgetDefine"
        :prop-define="propDefine"
        v-model="valueVModel[index]"
        @change="triggerUpdate"
      />
    </template>
  </ArrayValueInput>
</template>

<script setup lang="ts">
import { isNullOrUnDef } from '@/utils/is'
import { generateVForKey } from '../../../common/utils'
import {
  WidgetRenderContext,
  WidgetDefine,
  WidgetInstance,
  WidgetPropDefine,
  DesignerEditor
} from '../../designer-editor.type'
import ArrayValueInput from '../../../common/ArrayValueInput.vue'
import PropValueInput from './PropValueInput.vue'
import { computedVModel } from '../../../common/hooks'

export interface PropArrayValueInputProps {
  editor: DesignerEditor
  widget: WidgetInstance
  context: WidgetRenderContext
  widgetDefine: WidgetDefine
  propDefine: WidgetPropDefine
  modelValue?: any[]
}

export type PropArrayValueInputEmits = {
  'update:modelValue': [val?: any[]]
  change: [val?: any[]]
}

const props = withDefaults(defineProps<PropArrayValueInputProps>(), {
  modelValue: () => []
})

const emits = defineEmits<PropArrayValueInputEmits>()

const { valueVModel, triggerUpdate } = computedVModel({
  get() {
    return generateVForKey(props.modelValue)
  },
  set(val?: any[]) {
    emits('update:modelValue', val)
    emits('change', val)
  }
})

const isDragSortable = computed(() => props.propDefine.dragSortable ?? true)

const readonly = computed(() => ['text', 'link'].includes(props.propDefine.type ?? ''))

const handleAdd = (index: number) => {
  const defaultValue = props.propDefine.defaultValue?.()
  const minLength = props.propDefine.minLength
  if (!isNullOrUnDef(minLength) && valueVModel.value.length < minLength) {
    const itemsToAdd = minLength - valueVModel.value.length
    const items = Array(itemsToAdd).fill(defaultValue)
    valueVModel.value = valueVModel.value.toSpliced(index + 1, 0, ...items)
  } else {
    valueVModel.value = valueVModel.value.toSpliced(index + 1, 0, defaultValue)
  }
}

const handleRemove = (index: number) => {
  const minLength = props.propDefine.minLength
  if (!isNullOrUnDef(minLength) && valueVModel.value.length <= minLength) {
    valueVModel.value = [...valueVModel.value]
  } else {
    valueVModel.value = valueVModel.value.toSpliced(index, 1)
  }
}
</script>

<style scoped lang="scss"></style>
