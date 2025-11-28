<template>
  <div class="w-full">
    <el-select
      v-if="'datetime' == valueVModel.columnType"
      placeholder="日期格式"
      clearable
      :disabled="disabled"
      v-model="valueVModel.datetimeFormat"
      @change="onDatetimeFormatChange"
    >
      <el-option
        v-for="opt in ColumnDatetimeFormatOptions"
        :key="opt.label"
        :label="opt.label"
        :value="opt.value"
      />
    </el-select>
    <el-input
      v-else-if="'dict' == valueVModel.columnType"
      placeholder="关联字段类型"
      clearable
      :disabled="disabled"
      v-model="valueVModel.dictType"
    />
    <el-input
      v-else
      placeholder="格式化模版 ${data} ${row.属性}"
      clearable
      :disabled="disabled"
      v-model="valueVModel.dataPattern"
    />
  </div>
</template>
<script lang="ts" setup>
import { computedVModel } from '../../../../../common/hooks'
import { EasyTableBodyColumnProps, ColumnDatetimeFormatOptions } from './types'
import { calcDatetimeColumnWidth } from './utils'

export interface ColumnFormatInputProps {
  modelValue?: EasyTableBodyColumnProps
  disabled?: boolean
}

export type ColumnFormatInputEmits = {
  'update:modelValue': [val?: EasyTableBodyColumnProps]
  change: [val?: EasyTableBodyColumnProps]
}

const props = defineProps<ColumnFormatInputProps>()

const emits = defineEmits<ColumnFormatInputEmits>()

const { valueVModel } = computedVModel<EasyTableBodyColumnProps>({
  get() {
    return props.modelValue ?? {}
  },
  set(val) {
    emits('update:modelValue', val)
    emits('change', val)
  }
})

const onDatetimeFormatChange = () => {
  const width = calcDatetimeColumnWidth(valueVModel.value.datetimeFormat)
  valueVModel.value = { ...valueVModel.value, width: `${width}px` }
}

watch(
  () => valueVModel.value.columnType,
  () => {
    if (valueVModel.value.columnType == 'image') {
      valueVModel.value = { ...valueVModel.value, width: `65px` }
    } else if (valueVModel.value.columnType == 'amount') {
      valueVModel.value = { ...valueVModel.value, dataPattern: '￥${data}' }
    } else {
      valueVModel.value = {
        ...valueVModel.value,
        datetimeFormat: undefined,
        dictType: undefined,
        dataPattern: undefined
      }
    }
  }
)
</script>
