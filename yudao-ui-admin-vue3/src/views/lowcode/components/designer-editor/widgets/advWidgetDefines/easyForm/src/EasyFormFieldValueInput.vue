<template>
  <div class="w-full flex justify-between gap-2">
    <div :style="fieldStyles[0]">
      <el-input placeholder="属性prop" clearable v-model="valueVModel.prop" />
    </div>
    <div :style="fieldStyles[1]">
      <el-input
        placeholder="名称label"
        clearable
        v-model="valueVModel.label"
        @change="onLabelChange"
      />
    </div>
    <div :style="fieldStyles[2]">
      <el-select placeholder="输入类型" v-model="widgetValueVModel" value-key="optKey">
        <el-option
          v-for="item in formWidgetOptions"
          :key="item.optKey"
          :label="item.label"
          :value="item"
        />
      </el-select>
    </div>
    <div :style="fieldStyles[3]">
      <el-input clearable placeholder="占位文本" v-model="valueVModel.placeholder" />
    </div>
    <div :style="fieldStyles[4]">
      <el-select clearable placeholder="否" v-model="valueVModel.required">
        <el-option
          v-for="dict in getBoolDictOptions(DICT_TYPE.INFRA_BOOLEAN_STRING)"
          :key="dict.label"
          :label="dict.label"
          :value="dict.value"
        />
      </el-select>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { DICT_TYPE, getBoolDictOptions } from '@/utils/dict'
import { EasyFormConfigFormField } from './EasyFormConfigDialog.vue'
import { computedVModel } from '../../../../../common/hooks'
import { useWidgetModule } from '../../../index'
import { joinKeys } from '../../../../../common/utils'

export interface EasyFormFieldValueInputProps {
  fieldStyles?: string[]
  modelValue?: EasyFormConfigFormField
}

export type EasyFormFieldValueInputEmits = {
  'update:modelValue': [val?: EasyFormConfigFormField]
  change: [val?: EasyFormConfigFormField]
  labelChange: [val?: EasyFormConfigFormField]
}

const props = withDefaults(defineProps<EasyFormFieldValueInputProps>(), {
  fieldStyles: () => []
})

const emits = defineEmits<EasyFormFieldValueInputEmits>()

const { valueVModel, triggerUpdate } = computedVModel({
  get() {
    return props.modelValue ?? {}
  },
  set(val?: any) {
    emits('update:modelValue', val)
    emits('change', val)
  }
})

const { valueVModel: widgetValueVModel } = computedVModel({
  get() {
    return {
      optKey: getOptionKey(valueVModel.value),
      _moduleName: valueVModel.value._moduleName,
      _key: valueVModel.value._key
    }
  },
  set(val?: any) {
    valueVModel.value._moduleName = val?._moduleName
    valueVModel.value._key = val?._key
    triggerUpdate()
  }
})

const formWidgetOptions = computed(() => {
  return (useWidgetModule({ _moduleName: 'formWidgetDefines' }).defines ?? []).map((e) => {
    return {
      optKey: getOptionKey(e),
      label: e.label,
      _moduleName: e._moduleName,
      _key: e._key
    }
  })
})

const getOptionKey = (item: { _moduleName?: string; _key?: string }) => {
  return joinKeys(item._moduleName, item._key)
}

const isInputType = (item: { _moduleName?: string; _key?: string }) => {
  item._moduleName ??= 'formWidgetDefines'
  return widgetValueVModel.value?.optKey == getOptionKey(item)
}

const onLabelChange = () => {
  emits('labelChange', valueVModel.value)
}
</script>

<style lang="scss" scoped></style>
