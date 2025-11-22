<template>
  <div class="w-full flex justify-between gap-2">
    <div class="flex justify-center items-center" :style="fieldStyles[0]">
      <Icon
        :class="{
          'c-[--el-color-primary]': !valueVModel.hidden
        }"
        :icon="valueVModel.hidden ? 'ep:hide' : 'ep:view'"
        @click="toggleHidden"
      />
    </div>
    <div :style="fieldStyles[1]">
      <el-input placeholder="属性名称" clearable v-model="valueVModel.label" />
    </div>
    <div :style="fieldStyles[2]">
      <el-input placeholder="查询字段" clearable v-model="valueVModel.prop" />
    </div>
    <div :style="fieldStyles[3]">
      <el-select placeholder="查询类型" v-model="valueVModel.symbolType">
        <el-option
          v-for="dict in getStrDictOptions(LOWCODE_DICT_TYPE.LOWCODE_QUERIER_FIELD_SYMBOLS)"
          :key="dict.value"
          :label="dict.label"
          :value="dict.value"
        />
      </el-select>
    </div>
    <div :style="fieldStyles[4]">
      <el-select placeholder="输入类型" v-model="valueVModel.inputType" @change="onInputTypeChange">
        <el-option
          v-for="opt in InputTypeOptions"
          :key="opt.label"
          :label="opt.label"
          :value="opt.value"
        />
      </el-select>
    </div>
    <div :style="fieldStyles[5]">
      <el-input-number
        class="!w-full"
        placeholder="6"
        clearable
        :max="24"
        :min="6"
        :step="1"
        :precision="0"
        v-model="valueVModel.span"
      />
    </div>
    <div :style="fieldStyles[6]">
      <el-input
        clearable
        :placeholder="`请输入${valueVModel.label}`"
        v-model="valueVModel.placeholder"
      />
    </div>
    <div class="flex justify-center items-center" :style="fieldStyles[7]">
      <Icon class="c-[--el-color-primary]" icon="ep:setting" @click="doConfig" />
    </div>
  </div>
</template>
<script lang="ts" setup>
import { getStrDictOptions } from '@/utils/dict'
import { computedVModel } from '../../../../../common/hooks'
import { QuerierTableSearchFieldProps } from '../../../../../querier-table/querier-table.type'
import { LOWCODE_DICT_TYPE } from '../../../../../common/dict'
import { DesignerEditorEvalFunction } from '../../../../designer-editor.type'

export type EasyTableSearchFieldProps = {
  remoteMethod?: DesignerEditorEvalFunction
  load?: DesignerEditorEvalFunction
  filterMethod?: DesignerEditorEvalFunction
  disabledDate?: DesignerEditorEvalFunction
} & Omit<QuerierTableSearchFieldProps, 'remoteMethod' | 'load' | 'filterMethod' | 'disabledDate'>

const InputTypeOptions = [
  {
    label: 'Input 输入框',
    value: 'input'
  },
  {
    label: 'Select 选择器',
    value: 'select'
  },
  {
    label: 'TreeSelect 树形选择',
    value: 'tree-select'
  },
  {
    label: 'Radio 单选框',
    value: 'radio'
  },
  {
    label: 'Checkbox 多选框',
    value: 'checkbox'
  },
  {
    label: 'Switch 开关',
    value: 'switch'
  },
  {
    label: 'DatePicker 日期选择',
    value: 'date-picker'
  },
  {
    label: 'NumberRange 数字范围输入',
    value: 'number-range'
  }
]

export interface EasyTableSearchFieldValueInputProps {
  fieldStyles?: string[]
  modelValue?: EasyTableSearchFieldProps
}

export type EasyTableSearchFieldValueInputEmits = {
  'update:modelValue': [val?: EasyTableSearchFieldProps]
  change: [val?: EasyTableSearchFieldProps]
  labelChange: [val?: EasyTableSearchFieldProps]
}

const props = withDefaults(defineProps<EasyTableSearchFieldValueInputProps>(), {
  fieldStyles: () => []
})

const emits = defineEmits<EasyTableSearchFieldValueInputEmits>()

const openSearchFieldConfigDialog = inject('openSearchFieldConfigDialog') as Function

const { valueVModel } = computedVModel({
  get() {
    return props.modelValue ?? {}
  },
  set(val?: any) {
    emits('update:modelValue', val)
    emits('change', val)
  }
})

const toggleHidden = () => {
  valueVModel.value.hidden = !valueVModel.value.hidden
}

const doConfig = () => {
  openSearchFieldConfigDialog({
    value: valueVModel.value,
    onConfirm: (val) => {
      valueVModel.value = val
    }
  })
}

const onInputTypeChange = () => {
  valueVModel.value = {
    label: valueVModel.value.label,
    helps: valueVModel.value.helps,
    prop: valueVModel.value.prop,
    symbolType: valueVModel.value.symbolType,
    inputType: valueVModel.value.inputType,
    defaultValue: valueVModel.value.defaultValue,
    hidden: valueVModel.value.hidden,
    span: valueVModel.value.span,
    placeholder: valueVModel.value.placeholder
  }
}
</script>

<style lang="scss" scoped></style>
