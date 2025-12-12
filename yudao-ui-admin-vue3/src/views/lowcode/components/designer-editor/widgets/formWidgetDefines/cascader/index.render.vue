<!-- index.render.vue -->
<template>
  <ElFormItemWrapper v-bind="formItemAttrs">
    <el-cascader
      v-bind="formInputAttrs"
      class="!w-full"
      :collapse-tags-tooltip="true"
      :props="cascaderProps"
      :before-filter="cascaderBeforeFilter"
      :options="cascaderOptions"
      v-model="valueModel"
      @visible-change="onCascaderVisibleChange"
    >
      <template v-if="isLoading('prefix') || prefixIcon" #prefix>
        <Icon
          icon="ep:loading"
          class="animate-spin animate-duration-3000"
          v-if="isLoading('prefix')"
        />
        <Icon v-else :icon="prefixIcon" />
      </template>
      <template v-if="loading" #empty>
        <Icon icon="ep:loading" class="animate-spin animate-duration-3000" />
      </template>
    </el-cascader>
  </ElFormItemWrapper>
</template>
<script lang="ts" setup>
import ElFormItemWrapper from '../../../../common/ElFormItemWrapper.vue'
import { useWidget, type WidgetRenderProps } from '../../hooks'
import { useFormItemWidget } from '../../hooks/useFormItemWidget'
import { useScopeLoading } from '../../../../common/hooks'
import { useDebounceFn } from '@vueuse/core'

const props = defineProps<WidgetRenderProps>()

const { loading, isLoading, callWithLoading } = useScopeLoading()

const {
  formItemAttrs,
  valueModel,
  useFormInputAttrs,
  usePropValue,
  usePropObject,
  toEvalFunction
} = useFormItemWidget(useWidget(props))

const formInputAttrs = computed(() =>
  useFormInputAttrs({
    omit: [
      'prefixIcon',
      'emitPath',
      'multiple',
      'checkStrictly',
      'filterMethod',
      'lazy',
      'loadData'
    ]
  })
)

const prefixIcon = computed(() => usePropValue('prefixIcon'))

const filterMethod = computed(() => toEvalFunction(usePropValue('filterMethod')))

const loadData = computed(() => toEvalFunction(usePropValue('loadData')))

const cascaderProps = computed(() => {
  return {
    ...usePropObject('emitPath', 'multiple', 'checkStrictly', 'lazy'),
    lazyLoad: cascaderOptionsLazyLoad
  }
})

const cascaderOptions = ref<any[] | undefined>(undefined)

const isCascaderVisible = ref(false)

const onCascaderVisibleChange = (val: boolean) => {
  isCascaderVisible.value = val
}

const cascaderOptionsLoad = async () => {
  await callWithLoading(async () => {
    if (loadData.value) {
      cascaderOptions.value = await loadData.value()
    }
  })
}

const cascaderOptionsLazyLoad = async (node, resolve) => {
  await callWithLoading(
    'prefix',
    async () => {
      resolve((await loadData.value?.(node)) ?? [])
    },
    isCascaderVisible.value
  )
}

const cascaderFilterMethod = useDebounceFn(async (query?: string) => {
  await callWithLoading(async () => {
    cascaderOptions.value = []
    await nextTick(async () => {
      cascaderOptions.value = (await filterMethod.value?.(query)) ?? []
    })
  })
})
const cascaderBeforeFilter = (query?: string) => {
  cascaderFilterMethod(query)
  return false
}

onMounted(async () => {
  await callWithLoading('prefix', async () => {
    if (!cascaderProps.value.lazy) {
      await cascaderOptionsLoad()
    }
  })
})
</script>
<style scoped lang="scss"></style>
