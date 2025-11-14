<template>
  <div class="w-full flex">
    <el-radio
      v-if="radio"
      class="!m-0"
      :value="true"
      :model-value="checked"
      @click.prevent="onValueChecked"
    >
      {{ '' }}
    </el-radio>
    <el-checkbox v-else :model-value="checked" @change="onValueChecked">
      {{ '' }}
    </el-checkbox>
    <div class="flex gap-2">
      <span>名:</span>
      <el-input size="small" v-model="valueVModel.label" @change="triggerUpdate" />
      <span>值:</span>
      <el-input size="small" v-model="valueVModel.value" @change="triggerUpdate" />
    </div>
  </div>
</template>
<script lang="ts" setup>
import { computedVModel } from '../../../common/hooks'
import { WidgetPropDefineOptions } from '../../designer-editor.type'

interface EditableOptionsValueInputProps {
  modelValue?: WidgetPropDefineOptions
  radio?: boolean
  checked?: boolean
}

export type EditableOptionsValueInputEmits = {
  'update:modelValue': [val?: WidgetPropDefineOptions]
  change: [val?: WidgetPropDefineOptions]
  check: [val?: WidgetPropDefineOptions]
}

const props = withDefaults(defineProps<EditableOptionsValueInputProps>(), {
  modelValue: () => ({ label: `选项label`, value: `选项value` })
})

const emits = defineEmits<EditableOptionsValueInputEmits>()

const { valueVModel, triggerUpdate } = computedVModel({
  get: () => {
    return props.modelValue
  },
  set: (val) => {
    emits('update:modelValue', val)
    emits('change', val)
  }
})

const onValueChecked = () => {
  emits('check', valueVModel.value)
}
</script>
