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
      <el-select placeholder="输入类型" v-model="valueVModel.inputType">
        <el-option
          v-for="opt in InputTypeOptions"
          :key="opt.label"
          :label="opt.label"
          :value="opt.value"
        />
      </el-select>
    </div>
    <div :style="fieldStyles[5]">
      <el-input
        v-if="valueVModel.inputType == 'input'"
        clearable
        placeholder="占位文本"
        v-model="valueVModel.placeholder"
      />
      <el-input
        v-else-if="valueVModel.inputType == 'select'"
        clearable
        placeholder="绑定字典"
        v-model="valueVModel.dictType"
      />
      <div class="h-full flex justify-center items-center" v-else>
        <el-text type="info"> 请选择输入类型 </el-text>
      </div>
    </div>
    <div :style="fieldStyles[6]">
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
  </div>
</template>
<script lang="ts" setup>
import { getStrDictOptions } from '@/utils/dict'
import { computedVModel } from '../../../../../common/hooks'
import { QuerierTableSearchFieldProps } from '@/views/lowcode/components/querier-table/querier-table.type'
import { LOWCODE_DICT_TYPE } from '../../../../../common/dict'

const InputTypeOptions = [
  {
    label: '输入框Input',
    value: 'input'
  },
  {
    label: '下拉框Select',
    value: 'select'
  }
]

export interface EasyTableSearchFieldValueInputProps {
  fieldStyles?: string[]
  modelValue?: QuerierTableSearchFieldProps
}

export type EasyTableSearchFieldValueInputEmits = {
  'update:modelValue': [val?: QuerierTableSearchFieldProps]
  change: [val?: QuerierTableSearchFieldProps]
  labelChange: [val?: QuerierTableSearchFieldProps]
}

const props = withDefaults(defineProps<EasyTableSearchFieldValueInputProps>(), {
  fieldStyles: () => []
})

const emits = defineEmits<EasyTableSearchFieldValueInputEmits>()

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
</script>

<style lang="scss" scoped></style>
