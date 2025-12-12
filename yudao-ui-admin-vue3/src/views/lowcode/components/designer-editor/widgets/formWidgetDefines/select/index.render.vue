<!-- index.render.vue -->
<template>
  <ElFormItemWrapper v-bind="formItemAttrs">
    <el-select
      v-bind="formInputAttrs"
      :collapse-tags-tooltip="true"
      :remote-method="selectRemoteLoad"
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
      <el-option
        v-for="opt in selectOptions"
        :key="opt.label"
        :label="opt.label"
        :value="opt.value"
        :disabled="opt.disabled"
      />
    </el-select>
  </ElFormItemWrapper>
</template>
<script lang="ts" setup>
import { isNullOrUnDef } from '@/utils/is'
import ElFormItemWrapper from '../../../../common/ElFormItemWrapper.vue'
import { useWidget, type WidgetRenderProps } from '../../hooks'
import { useFormItemWidget } from '../../hooks/useFormItemWidget'
import { getStrDictOptions } from '@/utils/dict'
import { useScopeLoading } from '../../../../common/hooks'

const props = defineProps<WidgetRenderProps>()

const { loading, isLoading, callWithLoading } = useScopeLoading()

const { formItemAttrs, valueModel, useFormInputAttrs, usePropValue, toEvalFunction } =
  useFormItemWidget(useWidget(props))

const formInputAttrs = computed(() =>
  useFormInputAttrs({ omit: ['prefixIcon', 'dictType', 'remoteMethod'] })
)

const prefixIcon = computed(() => usePropValue('prefixIcon'))

const remoteMethod = computed(() => toEvalFunction(usePropValue('remoteMethod')))

const loadCacheData = computed(() => toEvalFunction(usePropValue('loadCacheData')))

const selectOptions = ref<any[]>()
const selectDictLoad = async () => {
  await callWithLoading(async () => {
    const dictType = usePropValue('dictType')
    if (!isNullOrUnDef(dictType)) {
      selectOptions.value = getStrDictOptions(dictType)
    }
  })
}

const selectRemoteLoad = async (query?: string) => {
  await callWithLoading(async () => {
    if (remoteMethod.value) {
      selectOptions.value = await remoteMethod.value(query)
    }
  })
}

const selectCacheLoad = async () => {
  await callWithLoading(async () => {
    if (valueModel.value && loadCacheData.value) {
      const vals = formInputAttrs.value.multiple ? valueModel.value : [valueModel.value]
      const optionValues = new Set(selectOptions.value?.map((e) => e.value) ?? [])
      if (vals.some((e) => !optionValues.has(e))) {
        if (loadCacheData.value) {
          selectOptions.value = await loadCacheData.value(valueModel.value)
        }
      }
    }
  })
}

onMounted(async () => {
  await callWithLoading('prefix', async () => {
    if (formInputAttrs.value.remote) {
      await selectRemoteLoad()
    } else {
      await selectDictLoad()
    }
  })

  watch(
    () => valueModel.value,
    () => {
      callWithLoading('prefix', async () => {
        await selectCacheLoad()
      })
    },
    { immediate: true }
  )
})
</script>
<style scoped lang="scss"></style>
