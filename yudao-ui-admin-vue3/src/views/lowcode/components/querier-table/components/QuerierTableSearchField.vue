<template>
  <el-form-item>
    <template #label v-if="!isEmpty(label)">
      <text-label :label="label" :helps="helps" />
    </template>
    <el-input
      v-if="inputType === 'input'"
      clearable
      :placeholder="placeholder"
      v-model.trim="valueVModel"
      @clear="onFieldClear"
    />
    <el-select
      v-if="inputType === 'select'"
      clearable
      :placeholder="placeholder"
      v-model="valueVModel"
      @clear="onFieldClear"
    >
      <el-option v-for="opt in options" :key="opt.label" :label="opt.label" :value="opt.value" />
    </el-select>
  </el-form-item>
</template>
<script lang="ts" setup>
import { isNullOrUnDef, isEmpty } from '@/utils/is'
import { computedVModel } from '../../common/hooks'
import TextLabel from '../../common/TextLabel.vue'
import { ALL_OPTIONS_VALUE, QuerierTableSearchFieldProps } from '../querier-table.type'
import { getStrDictOptions } from '@/utils/dict'

export type QuerierTableSearchFieldEmits = {
  'update:modelValue': [val?: any]
  change: [val?: any]
  clear: []
}

const props = defineProps<QuerierTableSearchFieldProps & { modelValue?: any }>()

const emits = defineEmits<QuerierTableSearchFieldEmits>()

const { valueVModel } = computedVModel({
  get() {
    return props.modelValue
  },
  set(val) {
    emits('update:modelValue', val)
    emits('change', val)
  }
})

const placeholder = computed(() => props.placeholder ?? `按${props.label}搜索`)

const options = computed(() => {
  let opts: any[] = []
  if (!isNullOrUnDef(props.dictType)) {
    opts = getStrDictOptions(props.dictType)
  }
  opts.unshift({ label: '全部', value: ALL_OPTIONS_VALUE })
  return opts
})

const onFieldClear = () => {
  emits('clear')
}
</script>
