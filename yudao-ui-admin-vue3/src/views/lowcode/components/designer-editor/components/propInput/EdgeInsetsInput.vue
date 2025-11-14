<template>
  <div class="w-full bg-#dcdfe6 p-2 b-rd-2 flex flex-col gap-2">
    <div class="flex justify-end">
      <FormatInputNumber v-model="allValueVModel" :symbol="symbol" />
    </div>
    <div class="flex justify-center">
      <FormatInputNumber
        :symbol="symbol"
        :model-value="valueVModel.top"
        @update:model-value="(val) => onValueChange('top', val)"
      />
    </div>
    <div class="flex justify-between items-center gap-2">
      <FormatInputNumber
        :symbol="symbol"
        :model-value="valueVModel.left"
        @update:model-value="(val) => onValueChange('left', val)"
      />
      <div class="bg-#fff flex-1 h-10 b-rd-2"></div>
      <FormatInputNumber
        :symbol="symbol"
        :model-value="valueVModel.right"
        @update:model-value="(val) => onValueChange('right', val)"
      />
    </div>
    <div class="flex justify-center">
      <FormatInputNumber
        :symbol="symbol"
        :model-value="valueVModel.bottom"
        @update:model-value="(val) => onValueChange('bottom', val)"
      />
    </div>
  </div>
</template>
<script lang="ts" setup>
import { isEmpty } from '@/utils/is'
import { EdgeInsetsInputData } from '../../designer-editor.type'
import FormatInputNumber from './FormatInputNumber.vue'
import { parseFormatNumUnit, parseFormatNumValue } from '../../../common/utils'
import { computedVModel } from '../../../common/hooks'

export interface EdgeInsetsInputProps {
  modelValue?: EdgeInsetsInputData
  symbol?: string | string[]
}

export type EdgeInsetsInputEmits = {
  'update:modelValue': [val?: EdgeInsetsInputData]
  change: [val?: EdgeInsetsInputData]
}

const props = withDefaults(defineProps<EdgeInsetsInputProps>(), {
  modelValue: () => ({})
})

const emits = defineEmits<EdgeInsetsInputEmits>()

const isEqualEdgeInsets = (a?: EdgeInsetsInputData, b?: EdgeInsetsInputData): boolean => {
  return (
    a?.top === b?.top && a?.bottom === b?.bottom && a?.left === b?.left && a?.right === b?.right
  )
}

const { valueVModel } = computedVModel({
  get: () => {
    return props.modelValue ?? {}
  },
  set: (val) => {
    if (!isEqualEdgeInsets(valueVModel.value, val)) {
      emits('update:modelValue', val)
      emits('change', val)
    }
  }
})

function unifyUnits(obj: EdgeInsetsInputData, targetUnit: string) {
  return Object.fromEntries(
    Object.entries(obj).map(([key, valueStr]) => {
      return [key, `${parseFormatNumValue(valueStr)}${targetUnit}`]
    })
  )
}

const onValueChange = (key: keyof EdgeInsetsInputData, val?: string) => {
  valueVModel.value = unifyUnits({ ...valueVModel.value, [key]: val }, parseFormatNumUnit(val))
}

const allValueVModel = computed<string>({
  get() {
    const vals = Object.values(valueVModel.value ?? {}).map((val: any) => ({
      value: parseFormatNumValue(val),
      unit: parseFormatNumUnit(val)
    }))
    if (isEmpty(vals)) {
      return ''
    }
    const minVal = vals.reduce((minElement, currentElement) => {
      return currentElement.value < minElement.value ? currentElement : minElement
    })
    return `${minVal.value ?? ''}${minVal.unit ?? ''}`
  },
  set(val?: string) {
    valueVModel.value = { top: val, right: val, bottom: val, left: val }
  }
})
</script>
<style lang="scss" scoped></style>
