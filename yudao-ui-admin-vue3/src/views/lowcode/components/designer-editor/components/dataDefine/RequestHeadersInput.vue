<template>
  <ArrayValueInput
    :group="{ pull: false, put: false }"
    v-model="valueVModel"
    @add="handleAdd"
    @remove="handleRemove"
  >
    <template #item="{ index }">
      <MultiValueInput
        :keys="['name', 'value']"
        :placeholder="(key: string) => `request header ${key}`"
        v-model="valueVModel[index]"
        @change="triggerUpdate"
      />
    </template>
  </ArrayValueInput>
</template>
<script lang="ts" setup>
import { WidgetDataDefineRequestHeaders } from '../../designer-editor.type'
import ArrayValueInput from '../../../common/ArrayValueInput.vue'
import MultiValueInput from '../propInput/MultiValueInput.vue'
import { computedVModel } from '../../../common/hooks'

export interface RequestHeadersInputProps {
  modelValue?: WidgetDataDefineRequestHeaders[]
}

export type RequestHeadersInputEmits = {
  'update:modelValue': [val?: WidgetDataDefineRequestHeaders[]]
  change: [val?: WidgetDataDefineRequestHeaders[]]
}

const props = withDefaults(defineProps<RequestHeadersInputProps>(), {
  modelValue: () => []
})

const emits = defineEmits<RequestHeadersInputEmits>()

const { valueVModel, triggerUpdate } = computedVModel({
  get: () => {
    return props.modelValue
  },
  set: (val) => {
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
