<template>
  <div class="w-full flex justify-between gap-2">
    <div :style="fieldStyles[0]">
      <el-input placeholder="字段名" clearable :disabled="disabled" v-model="valueVModel.name" />
    </div>
    <div :style="fieldStyles[1]">
      <el-input placeholder="数据ID" clearable :disabled="disabled" v-model="idValue" />
    </div>
    <div :style="fieldStyles[2]">
      <el-input
        placeholder="字段备注"
        clearable
        :disabled="disabled"
        v-model="valueVModel.comment"
      />
    </div>
    <div :style="fieldStyles[3]">
      <el-select clearable :disabled="disabled" v-model="valueVModel.authType">
        <el-option
          v-for="dict in getStrDictOptions(LOWCODE_DICT_TYPE.LOWCODE_QUERIER_AUTH_TYPES)"
          :key="dict.value"
          :label="dict.label"
          :value="dict.value"
        />
      </el-select>
    </div>
    <div :style="fieldStyles[4]">
      <el-select
        multiple
        clearable
        :disabled="disabled"
        :model-value="valueVModel.symbols?.split(',')"
        @update:model-value="(e) => (valueVModel.symbols = isEmpty(e) ? undefined : e.join(','))"
      >
        <el-option
          v-for="dict in getStrDictOptions(LOWCODE_DICT_TYPE.LOWCODE_QUERIER_FIELD_SYMBOLS)"
          :key="dict.value"
          :label="dict.label"
          :value="dict.value"
        />
      </el-select>
    </div>
    <div :style="fieldStyles[5]">
      <el-input
        placeholder="必填分组"
        clearable
        :disabled="disabled"
        v-model="valueVModel.required"
      />
    </div>
    <div class="flex justify-center items-center" :style="fieldStyles[6]">
      <el-checkbox
        :disabled="disabled"
        :model-value="!valueVModel.hidden"
        @update:model-value="(val) => (valueVModel.hidden = !val)"
      />
    </div>
    <div class="flex justify-center items-center" :style="fieldStyles[7]">
      <el-checkbox :disabled="disabled" v-model="valueVModel.sortable" />
    </div>
    <div class="flex justify-center items-center" :style="fieldStyles[8]">
      <el-checkbox
        :disabled="disabled"
        :model-value="!valueVModel.disableExpt"
        @update:model-value="(val) => (valueVModel.disableExpt = !val)"
      />
    </div>
  </div>
</template>
<script lang="ts" setup>
import { getStrDictOptions } from '@/utils/dict'
import { QueryField } from '../querier-editor.type'
import { isEmpty } from '@/utils/is'
import { computedVModel } from '../../common/hooks'
import { LOWCODE_DICT_TYPE } from '../../common/dict'

export interface QueryXmlTableFieldValueInputProps {
  fieldStyles?: string[]
  disabled?: boolean
  modelValue?: QueryField
}

export type QueryXmlTableFieldValueInputEmits = {
  'update:modelValue': [val?: QueryField]
  change: [val?: QueryField]
}

const props = withDefaults(defineProps<QueryXmlTableFieldValueInputProps>(), {
  fieldStyles: () => []
})

const emits = defineEmits<QueryXmlTableFieldValueInputEmits>()

const { valueVModel, triggerUpdate } = computedVModel({
  get() {
    return props.modelValue ?? {}
  },
  set(val?: any) {
    emits('update:modelValue', val)
    emits('change', val)
  }
})

const idValue = computed({
  get() {
    return valueVModel.value.id ?? valueVModel.value.value
  },
  set(val?: string) {
    if (/^[a-zA-Z0-9_]{0,28}$/.test(val ?? '')) {
      valueVModel.value.id = val
      valueVModel.value.value = undefined
    } else {
      valueVModel.value.id = undefined
      valueVModel.value.value = val
    }
    triggerUpdate()
  }
})
</script>

<style lang="scss" scoped></style>
