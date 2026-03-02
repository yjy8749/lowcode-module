<template>
  <div class="w-full flex gap-2">
    <div class="flex justify-center items-center" :style="fieldStyles[0]">
      <Icon
        v-if="!isDisabled"
        :class="{
          'c-[--el-color-primary]': !valueVModel.hidden
        }"
        :icon="valueVModel.hidden ? 'ep:hide' : 'ep:view'"
        @click="toggleHidden"
      />
    </div>
    <div :style="fieldStyles[1]">
      <el-input placeholder="列名称" clearable :disabled="isDisabled" v-model="valueVModel.label" />
    </div>
    <div :style="fieldStyles[2]">
      <el-input
        placeholder="列字段"
        clearable
        :disabled="isDisabled"
        v-model="valueVModel.prop"
        @change="onPropChange"
      />
    </div>
    <div :style="fieldStyles[3]">
      <FormatInputNumber
        :style="fieldStyles[3]"
        placeholder="列宽"
        symbol="px"
        v-model="valueVModel.width"
      />
    </div>
    <div class="flex justify-center items-center" :style="fieldStyles[4]">
      <el-checkbox v-model="valueVModel.fixed" />
    </div>
    <div class="flex justify-center items-center" :style="fieldStyles[5]">
      <el-checkbox v-model="valueVModel.rowKey" :disabled="isDisabled" />
    </div>
    <div :style="fieldStyles[6]">
      <el-input
        placeholder="字符串分割"
        clearable
        :disabled="isDisabled"
        v-model="valueVModel.splitChar"
      />
    </div>
    <div :style="fieldStyles[7]">
      <el-select
        placeholder="列类型"
        clearable
        :disabled="isDisabled"
        v-model="valueVModel.columnType"
      >
        <el-option
          v-for="opt in ColumnTypeOptions"
          :key="opt.label"
          :label="opt.label"
          :value="opt.value"
        />
      </el-select>
    </div>
    <div :style="fieldStyles[8]">
      <ColumnFormatInput v-model="valueVModel" :disabled="isDisabled" />
    </div>
    <div class="flex justify-center items-center" :style="fieldStyles[9]">
      <Icon
        v-if="!isDisabled"
        class="cursor-pointer"
        :class="{
          'c-[--el-color-primary]': !!valueVModel.sort,
          'c-[--el-color-info-light-5]': !valueVModel.sort
        }"
        :icon="sortIcon"
        @click="toggleSort"
      />
    </div>
    <div class="flex justify-center items-center" :style="fieldStyles[10]">
      <Icon v-if="!isDisabled" class="c-[--el-color-primary]" icon="ep:setting" @click="doConfig" />
    </div>
  </div>
</template>
<script lang="ts" setup>
import FormatInputNumber from '../../../../components/propInput/FormatInputNumber.vue'
import { computedVModel } from '../../../../../common/hooks'
import { isIndexColumn, isActionColumn } from '../../../../../querier-table/querier-table.utils'
import { ColumnTypeOptions, EasyTableBodyColumnProps } from './types'
import ColumnFormatInput from './ColumnFormatInput.vue'

export interface EasyTableBodyColumnValueInputProps {
  fieldStyles?: string[]
  modelValue?: EasyTableBodyColumnProps
}

export type EasyTableBodyColumnValueInputEmits = {
  'update:modelValue': [val?: EasyTableBodyColumnProps]
  change: [val?: EasyTableBodyColumnProps]
  sortChange: [val?: EasyTableBodyColumnProps]
}

const props = withDefaults(defineProps<EasyTableBodyColumnValueInputProps>(), {
  fieldStyles: () => []
})

const emits = defineEmits<EasyTableBodyColumnValueInputEmits>()

const message = useMessage()

const { valueVModel } = computedVModel({
  get() {
    return props.modelValue ?? {}
  },
  set(val?: any) {
    emits('update:modelValue', val)
    emits('change', val)
  }
})

const isDisabled = computed(() => {
  return isIndexColumn(valueVModel.value) || isActionColumn(valueVModel.value)
})

const onPropChange = () => {
  if (isDisabled.value) {
    message.error(`${valueVModel.value.prop}不能设置`)
    valueVModel.value.prop = ''
  }
}

const toggleHidden = () => {
  if (!isDisabled.value) {
    valueVModel.value.hidden = !valueVModel.value.hidden
  }
}

const sortIcon = computed(() => {
  if (valueVModel.value.sort == 'enable') {
    return 'ep:d-caret'
  } else if (valueVModel.value.sort == 'asc') {
    return 'ep:caret-top'
  } else if (valueVModel.value.sort == 'desc') {
    return 'ep:caret-bottom'
  } else {
    return 'fa-solid:ban'
  }
})

const toggleSort = () => {
  if (!isDisabled.value) {
    if (valueVModel.value.sort == 'enable') {
      valueVModel.value.sort = 'asc'
    } else if (valueVModel.value.sort == 'asc') {
      valueVModel.value.sort = 'desc'
    } else if (valueVModel.value.sort == 'desc') {
      valueVModel.value.sort = ''
    } else {
      valueVModel.value.sort = 'enable'
    }
    emits('sortChange', valueVModel.value)
  }
}

const openColumnConfigDialog = inject('openColumnConfigDialog') as Function
const doConfig = () => {
  openColumnConfigDialog({
    value: valueVModel.value,
    onConfirm: (val) => {
      valueVModel.value = val
    }
  })
}
</script>

<style lang="scss" scoped></style>
