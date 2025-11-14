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
        :placeholder="(key: string) => `form data ${key}`"
        v-model="valueVModel[index]"
        @change="triggerUpdate"
      />
    </template>
  </ArrayValueInput>
</template>
<script lang="ts" setup>
import { WidgetDataDefineRequestFormData } from '../../designer-editor.type'
import MultiValueInput from '../propInput/MultiValueInput.vue'
import ArrayValueInput from '../../../common/ArrayValueInput.vue'
import { computedVModel } from '../../../common/hooks'

export interface RequestFormInputProps {
  modelValue?: WidgetDataDefineRequestFormData[]
}

export type RequestFormInputEmits = {
  'update:modelValue': [val?: WidgetDataDefineRequestFormData[]]
  change: [val?: WidgetDataDefineRequestFormData[]]
}

const props = withDefaults(defineProps<RequestFormInputProps>(), {
  modelValue: () => []
})

const emits = defineEmits<RequestFormInputEmits>()

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
