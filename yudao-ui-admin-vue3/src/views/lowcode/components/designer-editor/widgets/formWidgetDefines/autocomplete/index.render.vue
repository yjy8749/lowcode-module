<!-- index.render.vue -->
<template>
  <ElFormItemWrapper v-bind="formItemAttrs">
    <el-autocomplete
      v-bind="formInputAttrs"
      :fetch-suggestions="fetchSuggestionsLoad"
      v-model.trim="valueModel"
    >
      <template v-if="prefixIcon" #prefix>
        <Icon :icon="prefixIcon" />
      </template>
      <template v-if="suffixIcon" #suffix>
        <Icon :icon="suffixIcon" />
      </template>
    </el-autocomplete>
  </ElFormItemWrapper>
</template>
<script lang="ts" setup>
import ElFormItemWrapper from '../../../../common/ElFormItemWrapper.vue'
import { useWidget, type WidgetRenderProps } from '../../hooks'
import { useFormItemWidget } from '../../hooks/useFormItemWidget'

const props = defineProps<WidgetRenderProps>()

const { formItemAttrs, valueModel, useFormInputAttrs, usePropValue, toEvalFunction } =
  useFormItemWidget(useWidget(props))

const formInputAttrs = computed(() =>
  useFormInputAttrs({ omit: ['prefixIcon', 'suffixIcon', 'fetchSuggestions'] })
)

const prefixIcon = computed(() => usePropValue('prefixIcon'))

const suffixIcon = computed(() => usePropValue('suffixIcon'))

const fetchSuggestions = computed(() => toEvalFunction(usePropValue('fetchSuggestions')))

const fetchSuggestionsLoad = async (query: string) => {
  return (await fetchSuggestions.value?.(query)) ?? []
}
</script>
