<!-- index.render.vue -->
<template>
  <ElFormItemWrapper v-bind="formItemAttrs">
    <el-mention
      v-bind="formInputAttrs"
      :whole="true"
      :check-is-whole="checkIsWhole"
      :options="options"
      :loading="loading"
      v-model="inputTextValue"
      @search="onSearch"
      @select="onSelect"
      @whole-remove="onWholeRemove"
    >
      <template v-if="prefixIcon" #prefix>
        <Icon :icon="prefixIcon" />
      </template>
      <template v-if="suffixIcon" #suffix>
        <Icon :icon="suffixIcon" />
      </template>
    </el-mention>
  </ElFormItemWrapper>
</template>
<script lang="ts" setup>
import ElFormItemWrapper from '../../../../common/ElFormItemWrapper.vue'
import { useWidget, type WidgetRenderProps } from '../../hooks'
import { useFormItemWidget } from '../../hooks/useFormItemWidget'
import { useScopeLoading } from '../../../../common/hooks'
import { MentionOption } from 'element-plus'

export interface MentionValue {
  text: string
  mentions?: string[]
}

const { loading, callWithLoading } = useScopeLoading()

const props = defineProps<WidgetRenderProps>()

const { formItemAttrs, valueModel, useFormInputAttrs, usePropValue, toEvalFunction } =
  useFormItemWidget(useWidget(props))

const inputTextValue = computed<string>({
  get() {
    return valueModel.value?.text ?? ''
  },
  set(val) {
    if (valueModel.value) {
      valueModel.value = { ...valueModel.value, text: val }
    } else {
      valueModel.value = { text: val }
    }
  }
})

const checkIsWhole = (val: string) => {
  return valueModel.value?.mentions?.includes(val)
}

const formInputAttrs = computed(() => {
  const attrs = useFormInputAttrs({ omit: ['prefixIcon', 'suffixIcon', 'search'] })
  return {
    ...attrs,
    rows: attrs.autosize ? undefined : attrs.rows,
    autosize: attrs.autosize ? { minRows: attrs.minRows, maxRows: attrs.maxRows } : undefined
  }
})

const prefixIcon = computed(() => usePropValue('prefixIcon'))

const suffixIcon = computed(() => usePropValue('suffixIcon'))

const search = computed(() => toEvalFunction(usePropValue('search')))

const options = ref<MentionOption[]>([])
const onSearch = async (query: string) => {
  await callWithLoading(async () => {
    if (search.value) {
      options.value = await search.value(query)
    }
  })
}

const onSelect = (opt: MentionOption) => {
  valueModel.value = {
    ...valueModel.value,
    mentions: [...(valueModel.value?.mentions ?? []), opt.value]
  }
}

const onWholeRemove = (value: string) => {
  const mentions = [...(valueModel.value?.mentions ?? [])]
  const index = mentions.lastIndexOf(value)
  if (index >= 0) {
    mentions.splice(index, 1)
  }
  valueModel.value = { ...valueModel.value, mentions }
}
</script>
