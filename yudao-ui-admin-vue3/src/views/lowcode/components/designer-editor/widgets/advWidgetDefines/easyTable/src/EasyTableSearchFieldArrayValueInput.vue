<template>
  <ArrayValueInput
    :group="{ pull: false, put: false }"
    :headers="fieldHeaders"
    v-model="valueVModel"
    @add="handleAdd"
    @remove="handleRemove"
  >
    <template #item="{ index }">
      <EasyTableSearchFieldValueInput
        :field-styles="fieldStyles"
        v-model="valueVModel[index]"
        @change="triggerUpdate"
      />
    </template>
  </ArrayValueInput>
</template>

<script setup lang="ts">
import ArrayValueInput from '../../../../../common/ArrayValueInput.vue'
import { computedVModel } from '../../../../../common/hooks'
import EasyTableSearchFieldValueInput from './EasyTableSearchFieldValueInput.vue'
import { EasyTableSearchFieldProps } from './types'

export interface EasyTableSearchFieldArrayValueInputProps {
  modelValue?: EasyTableSearchFieldProps[]
}

export type EasyTableSearchFieldArrayValueInputEmits = {
  'update:modelValue': [val?: EasyTableSearchFieldProps[]]
  change: [val?: EasyTableSearchFieldProps[]]
}

const defaultStyle = 'width: 115px'
const flexStyle = 'flex:1'

const fieldHeaders = [
  {
    label: '显示',
    helps: '隐藏的查询条件默认不显示，点击展开按钮才会显示',
    style: 'width: 48px'
  },
  {
    label: '属性名称',
    style: defaultStyle
  },
  {
    label: '查询字段',
    style: defaultStyle
  },
  {
    label: '查询类型',
    style: defaultStyle
  },
  {
    label: '输入类型',
    style: flexStyle
  },
  {
    label: '宽度(Span)',
    style: defaultStyle
  },
  {
    label: '占位文本',
    style: flexStyle
  },
  {
    label: '设置',
    style: 'width: 30px'
  }
]

const fieldStyles = computed(() => fieldHeaders.map((e) => e.style))

const props = withDefaults(defineProps<EasyTableSearchFieldArrayValueInputProps>(), {
  modelValue: () => []
})

const emits = defineEmits<EasyTableSearchFieldArrayValueInputEmits>()

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
  valueVModel.value = valueVModel.value.toSpliced(index + 1, 0, {})
}

const handleRemove = (index: number) => {
  valueVModel.value = valueVModel.value.toSpliced(index, 1)
}
</script>

<style scoped lang="scss"></style>
