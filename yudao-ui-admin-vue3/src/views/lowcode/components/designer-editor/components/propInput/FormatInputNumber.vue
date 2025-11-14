<template>
  <el-input-number v-bind="props" v-model="valueVModel">
    <template v-if="props.symbol" #suffix>
      <span class="cursor-pointer hover:underline" @click="toggleSymbol"> {{ currentSymbol }}</span>
    </template>
  </el-input-number>
</template>
<script lang="ts" setup>
import { isArray, isNullOrUnDef } from '@/utils/is'
import { ElInputNumber, InputNumberProps } from 'element-plus'
import { parseFormatNumUnit, parseFormatNumValue } from '../../../common/utils'
import { computedVModel } from '../../../common/hooks'

export type FormatInputNumberProps = { modelValue?: string; symbol?: string | string[] } & Partial<
  Omit<InputNumberProps, 'modelValue'>
>

export type FormatInputNumberEmits = {
  'update:modelValue': [val?: string]
  change: [val?: string]
}

const props = defineProps<FormatInputNumberProps>()

const emits = defineEmits<FormatInputNumberEmits>()

const currentSymbolIndex = computed({
  get() {
    const unit = parseFormatNumUnit(props.modelValue)
    if (isArray(props.symbol)) {
      return Math.max(props.symbol.indexOf(unit), 0)
    }
    return 0
  },
  set(index: number) {
    if (isArray(props.symbol)) {
      const unit = props.symbol[index % props.symbol.length]
      const result = `${valueVModel.value}${unit}`
      emits('update:modelValue', result)
      emits('change', result)
    }
  }
})

const currentSymbol = computed(() => {
  if (isArray(props.symbol)) {
    return props.symbol[currentSymbolIndex.value % props.symbol.length]
  } else {
    return props.symbol
  }
})

const { valueVModel, triggerValidate } = computedVModel({
  get() {
    return parseFormatNumValue(props.modelValue)
  },
  set(val?: number) {
    const result = isNullOrUnDef(val) ? undefined : `${val}${currentSymbol.value}`
    emits('update:modelValue', result)
    emits('change', result)
  }
})

const toggleSymbol = () => {
  if (isArray(props.symbol)) {
    currentSymbolIndex.value = (currentSymbolIndex.value + 1) % props.symbol.length
    triggerValidate()
  }
}
</script>
<style lang="scss" scoped></style>
