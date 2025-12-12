<!-- index.render.vue -->
<template>
  <ElFormItemWrapper v-bind="formItemAttrs">
    <el-tree-select
      ref="treeSelectRef"
      v-bind="formInputAttrs"
      value-key="id"
      node-key="id"
      :collapse-tags-tooltip="true"
      :props="defaultProps"
      :data="treeDataOptions"
      :cache-data="treeCacheDataOptions"
      :load="treeDataLazyLoad"
      :filter-method="treeDataFilterMethod"
      :loading="loading"
      v-model="valueModel"
    >
      <template v-if="isLoading('prefix') || prefixIcon" #prefix>
        <Icon
          icon="ep:loading"
          class="animate-spin animate-duration-3000"
          v-if="isLoading('prefix')"
        />
        <Icon v-else :icon="prefixIcon" />
      </template>
    </el-tree-select>
  </ElFormItemWrapper>
</template>
<script lang="ts" setup>
import ElFormItemWrapper from '../../../../common/ElFormItemWrapper.vue'
import { useWidget, type WidgetRenderProps } from '../../hooks'
import { useFormItemWidget } from '../../hooks/useFormItemWidget'
import { defaultProps, handleTree } from '@/utils/tree'
import { useScopeLoading } from '../../../../common/hooks'
import { isArray, isEmpty } from '@/utils/is'
import { ElTreeSelect } from 'element-plus'

const props = defineProps<WidgetRenderProps>()

const { loading, isLoading, callWithLoading } = useScopeLoading()

const treeSelectRef = ref<InstanceType<typeof ElTreeSelect>>()

const { formItemAttrs, valueModel, useFormInputAttrs, usePropValue, toEvalFunction } =
  useFormItemWidget(useWidget(props))

const formInputAttrs = computed(() =>
  useFormInputAttrs({ omit: ['prefixIcon', 'filterMethod', 'loadData', 'loadCacheData'] })
)

const prefixIcon = computed(() => usePropValue('prefixIcon'))

const loadData = computed(() => toEvalFunction(usePropValue('loadData')))

const loadCacheData = computed(() => toEvalFunction(usePropValue('loadCacheData')))

const filterMethod = computed(() => toEvalFunction(usePropValue('filterMethod')))

const treeDataList = ref<any[]>()

const treeDataOptions = computed(() => handleTree(treeDataList.value ?? []))

const treeCacheDataList = ref<any[]>([])

const treeCacheDataOptions = computed(() => handleTree(treeCacheDataList.value ?? []))

const treeDataLazyLoad = async (node, resolve, reject) => {
  try {
    resolve((await loadData.value?.(node)) ?? [])
  } catch (e) {
    console.error(e)
    reject()
  }
}

const treeDataLoad = async () => {
  await callWithLoading(async () => {
    treeDataList.value = (await loadData.value?.({ level: 0 })) ?? []
  })
}

const treeDataFilterMethod = (query?: string) => {
  callWithLoading(async () => {
    if (isEmpty(query)) {
      await treeDataLoad()
    } else {
      treeDataList.value = (await filterMethod.value?.(query)) ?? []
    }
  })
}

const treeCacheDataLoad = async () => {
  if (valueModel.value && loadCacheData.value) {
    const vals = formInputAttrs.value.multiple ? valueModel.value : [valueModel.value]
    const treeDataIds = new Set(treeCacheDataList.value?.map((e) => e.id) ?? [])
    for (const val of vals) {
      if (!treeDataIds.has(val)) {
        const node = treeSelectRef.value?.getNode({ id: val })
        if (node?.data) {
          treeCacheDataList.value.push(node.data)
          treeDataIds.add(val)
        }
      }
    }
    if (vals.some((e) => !treeDataIds.has(e))) {
      await callWithLoading(async () => {
        if (loadCacheData.value) {
          treeCacheDataList.value = await loadCacheData.value(valueModel.value)
        }
      })
    }
  }
}

onMounted(async () => {
  await callWithLoading('prefix', async () => {
    if (!formInputAttrs.value.lazy) {
      await treeDataLoad()
    }
  })

  watch(
    () => valueModel.value,
    () => {
      callWithLoading('prefix', async () => {
        await treeCacheDataLoad()
      })
    },
    { immediate: true }
  )
})
</script>
