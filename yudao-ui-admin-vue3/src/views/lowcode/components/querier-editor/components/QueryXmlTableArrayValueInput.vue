<template>
  <ArrayValueInput
    :header-name-prefix="isMainTable ? '主表' : '副表'"
    :group="{ pull: false, put: false }"
    :readonly="disabled || onlyFieldEditable"
    :max-length="maxLength"
    :min-length="minLength"
    :inline="false"
    :sort="!onlyFieldEditable"
    v-model="valueVModel"
    @add="handleAdd"
    @remove="handleRemove"
  >
    <template #item="{ index }">
      <QueryXmlTableValueInput
        :disabled="disabled"
        :isMainTable="isMainTable"
        :onlyFieldEditable="onlyFieldEditable"
        v-model="valueVModel[index]"
        @change="triggerUpdate"
      />
    </template>
  </ArrayValueInput>
</template>

<script setup lang="ts">
import ArrayValueInput from '../../common/ArrayValueInput.vue'
import { computedVModel } from '../../common/hooks'
import { QueryTable } from '../querier-editor.type'
import QueryXmlTableValueInput from './QueryXmlTableValueInput.vue'

export interface QueryXmlTableArrayValueInputProps {
  maxLength?: number
  minLength?: number
  disabled?: boolean
  isMainTable?: boolean
  onlyFieldEditable?: boolean
  modelValue?: QueryTable[]
}

export type QueryXmlTableArrayValueInputEmits = {
  'update:modelValue': [val?: QueryTable[]]
  change: [val?: QueryTable[]]
}

const props = withDefaults(defineProps<QueryXmlTableArrayValueInputProps>(), {
  modelValue: () => []
})

const emits = defineEmits<QueryXmlTableArrayValueInputEmits>()

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
