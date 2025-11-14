<template>
  <Pagination
    :total="valueVModel.total ?? 0"
    v-model:page="pageNoVModel"
    v-model:limit="pageSizeVModel"
    @pagination="doPage"
  />
</template>
<script lang="ts" setup>
import { computedVModel } from '../../common/hooks'

interface QuerierTablePageModelValue {
  total?: number
  pageNo?: number
  pageSize?: number
}

interface QuerierTablePageProps {
  modelValue?: QuerierTablePageModelValue
}

export type QuerierTablePageEmits = {
  'update:modelValue': [val?: QuerierTablePageModelValue]
  change: [val?: QuerierTablePageModelValue]
  page: []
}

const props = defineProps<QuerierTablePageProps>()

const emits = defineEmits<QuerierTablePageEmits>()

const { valueVModel, triggerUpdate } = computedVModel({
  get() {
    return props.modelValue ?? {}
  },
  set(val) {
    emits('update:modelValue', val)
    emits('change', val)
  }
})

const { valueVModel: pageNoVModel } = computedVModel({
  get() {
    return props.modelValue?.pageNo
  },
  set(val) {
    valueVModel.value.pageNo = val
    triggerUpdate()
  }
})

const { valueVModel: pageSizeVModel } = computedVModel({
  get() {
    return props.modelValue?.pageSize
  },
  set(val) {
    valueVModel.value.pageSize = val
    triggerUpdate()
  }
})

const doPage = () => {
  emits('page')
}
</script>
