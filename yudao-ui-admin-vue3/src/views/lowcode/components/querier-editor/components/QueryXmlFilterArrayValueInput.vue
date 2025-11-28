<template>
  <ArrayValueInput
    header-name-prefix="过滤器配置"
    :group="{ pull: false, put: false }"
    :readonly="disabled"
    :max-length="maxLength"
    :min-length="minLength"
    :inline="false"
    v-model="valueVModel"
    @add="handleAdd"
    @remove="handleRemove"
  >
    <template #item="{ index }">
      <QueryXmlBeanInput
        name="过滤器可执行函数配置"
        tips="配置过滤器校验, 校验不通过不执行查询"
        :disabled="disabled"
        :default-js-function="defaultQueryFilter"
        v-model="valueVModel[index]"
        @change="triggerUpdate"
      />
    </template>
  </ArrayValueInput>
</template>

<script setup lang="ts">
import ArrayValueInput from '../../common/ArrayValueInput.vue'
import { QueryFilterValue } from '../querier-editor.type'
import { defaultQueryFilter } from '../querier-editor.utils'
import { computedVModel } from '../../common/hooks'
import QueryXmlBeanInput from './QueryXmlBeanInput.vue'

export interface QueryXmlFilterArrayValueInputProps {
  maxLength?: number
  minLength?: number
  disabled?: boolean
  modelValue?: QueryFilterValue[]
}

export type QueryXmlFilterArrayValueInputEmits = {
  'update:modelValue': [val?: QueryFilterValue[]]
  change: [val?: QueryFilterValue[]]
}

const props = withDefaults(defineProps<QueryXmlFilterArrayValueInputProps>(), {
  modelValue: () => []
})

const emits = defineEmits<QueryXmlFilterArrayValueInputEmits>()

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
  valueVModel.value = valueVModel.value.toSpliced(index + 1, 0, { value: defaultQueryFilter() })
}

const handleRemove = (index: number) => {
  valueVModel.value = valueVModel.value.toSpliced(index, 1)
}
</script>

<style scoped lang="scss"></style>
