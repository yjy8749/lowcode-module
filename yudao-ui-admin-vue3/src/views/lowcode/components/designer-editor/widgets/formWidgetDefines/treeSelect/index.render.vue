<!-- index.render.vue -->
<template>
  <ElFormItemWrapper v-bind="formItemAttrs">
    <el-tree-select
      v-bind="formInputAttrs"
      value-key="id"
      node-key="id"
      :data="treeData"
      :cache-data="treeCacheData"
      :load="loadLazy"
      :props="defaultProps"
      :collapse-tags-tooltip="true"
      v-model="valueModel"
    >
      <template v-if="prefixIcon" #prefix>
        <Icon :icon="prefixIcon" />
      </template>
    </el-tree-select>
  </ElFormItemWrapper>
</template>
<script lang="ts" setup>
import ElFormItemWrapper from '../../../../common/ElFormItemWrapper.vue'
import { useWidget, type WidgetRenderProps } from '../../hooks'
import { useFormItemWidget } from '../../hooks/useFormItemWidget'
import { defaultProps, handleTree } from '@/utils/tree'

const props = defineProps<WidgetRenderProps>()

const { formItemAttrs, valueModel, useFormInputAttrs, usePropValue, toEvalFunction } =
  useFormItemWidget(useWidget(props))

const formInputAttrs = computed(() =>
  useFormInputAttrs({ omit: ['prefixIcon', 'loadData', 'loadCacheData'] })
)

const prefixIcon = computed(() => usePropValue('prefixIcon'))

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

onMounted(async () => {
  if (!formInputAttrs.value.lazy) {
    list.value = await loadDataFunction.value?.()
  }
})
</script>
