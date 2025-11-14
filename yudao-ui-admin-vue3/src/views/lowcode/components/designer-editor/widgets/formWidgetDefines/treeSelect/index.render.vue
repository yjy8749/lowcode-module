<!-- index.render.vue -->
<template>
  <ElFormItemWrapper v-bind="formItemAttrs">
    <el-tree-select
      value-key="id"
      node-key="id"
      :data="treeData"
      :cache-data="treeCacheData"
      :load="loadLazy"
      :props="defaultProps"
      v-bind="formInputAttrs"
      v-model="valueModel"
    />
  </ElFormItemWrapper>
</template>
<script lang="ts" setup>
import ElFormItemWrapper from '../../../../common/ElFormItemWrapper.vue'
import { useWidget, type WidgetRenderProps } from '../../hooks'
import { useFormItemWidget } from '../../hooks/useFormItemWidget'
import { defaultProps, handleTree } from '@/utils/tree'

const props = defineProps<WidgetRenderProps>()

const { useFormItemAttrs, useFormInputAttrs, usePropValue, valueModel, toEvalFunction } =
  useFormItemWidget(useWidget(props))

const formItemAttrs = computed(() => useFormItemAttrs())

const formInputAttrs = computed(() => useFormInputAttrs({ omit: ['loadData', 'loadCacheData'] }))

const list = ref<any[]>([])

const treeData = computed(() => handleTree(list.value))

const treeCacheData = ref<any[] | undefined>()

const loadDataFunction = computed(() => toEvalFunction(usePropValue('loadData')))

const loadCacheDataFunction = computed(() => toEvalFunction(usePropValue('loadCacheData')))

const loadLazy = async (node, resolve, reject) => {
  try {
    resolve((await loadDataFunction.value?.(node)) ?? [])
  } catch (e) {
    console.error(e)
    reject()
  }
}

watch(
  () => valueModel.value,
  async () => {
    if (!treeCacheData.value?.some((e) => e.id == valueModel.value)) {
      treeCacheData.value = (await loadCacheDataFunction.value?.(valueModel.value)) ?? []
    }
  },
  { immediate: true }
)

onBeforeMount(async () => {
  if (!formInputAttrs.value.lazy) {
    list.value = await loadDataFunction.value?.()
  }
})
</script>
