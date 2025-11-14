<template>
  <ArrayValueInput
    header-name-prefix="拦截器配置"
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
      <QueryXmlInterceptorValueInput
        name="拦截器执行函数配置"
        tips="配置拦截器, 对查询参数或结果拦截处理"
        :disabled="disabled"
        v-model="valueVModel[index]"
        @change="triggerUpdate"
      />
    </template>
  </ArrayValueInput>
</template>

<script setup lang="ts">
import ArrayValueInput from '../../common/ArrayValueInput.vue'
import { QueryInterceptorValue } from '../querier-editor.type'
import QueryXmlInterceptorValueInput from './QueryXmlInterceptorValueInput.vue'
import {
  defaultQueryInterceptorPostHandle,
  defaultQueryInterceptorPreHandle
} from '../querier-editor.utils'
import { computedVModel } from '../../common/hooks'

export interface QueryXmlInterceptorArrayValueInputProps {
  maxLength?: number
  minLength?: number
  disabled?: boolean
  modelValue?: QueryInterceptorValue[]
}

export type QueryXmlInterceptorArrayValueInputEmits = {
  'update:modelValue': [val?: QueryInterceptorValue[]]
  change: [val?: QueryInterceptorValue[]]
}

const props = withDefaults(defineProps<QueryXmlInterceptorArrayValueInputProps>(), {
  modelValue: () => []
})

const emits = defineEmits<QueryXmlInterceptorArrayValueInputEmits>()

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
  valueVModel.value = valueVModel.value.toSpliced(index + 1, 0, {
    preHandleValue: { value: defaultQueryInterceptorPreHandle() },
    postHandleValue: { value: defaultQueryInterceptorPostHandle() }
  })
}

const handleRemove = (index: number) => {
  valueVModel.value = valueVModel.value.toSpliced(index, 1)
}
</script>

<style scoped lang="scss"></style>
