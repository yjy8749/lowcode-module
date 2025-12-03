<template>
  <div class="w-full flex justify-between gap-1">
    <template v-for="propKey in keys" :key="propKey">
      <slot v-if="slots[propKey]" :name="propKey"></slot>
      <el-input
        v-else
        :placeholder="placeholderFn(propKey)"
        :clearable="clearable"
        v-model="valueVModel[propKey]"
        @change="triggerUpdate"
      />
    </template>
  </div>
</template>
<script lang="ts" setup>
import { isArray, isFunction } from '@/utils/is'
import { computedVModel } from './hooks'

export interface MultiValueInputProps {
  keys: string[]
  modelValue?: object
  placeholder?: string | string[] | ((key: string) => string)
  clearable?: boolean
}

export type MultiValueInputEmits = {
  'update:modelValue': [val?: object]
  change: [val?: object]
}

const slots = useSlots()

const props = withDefaults(defineProps<MultiValueInputProps>(), {
  modelValue: () => ({})
})

const emits = defineEmits<MultiValueInputEmits>()

const { valueVModel, triggerUpdate } = computedVModel({
  get() {
    return props.modelValue
  },
  set(val?: object) {
    emits('update:modelValue', val)
    emits('change', val)
  }
})

const placeholderFn = (key: string) => {
  if (isArray(props.placeholder)) {
    return props.placeholder[props.keys.indexOf(key)]
  } else if (isFunction(props.placeholder)) {
    return props.placeholder.call({}, key)
  } else {
    return props.placeholder
  }
}
</script>
<style lang="scss" scoped></style>
