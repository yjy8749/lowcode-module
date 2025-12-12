<!-- index.render.vue -->
<template>
  <ElFormItemWrapper v-bind="formItemAttrs">
    <el-input
      v-bind="formInputAttrs"
      :show-password="formInputAttrs.type == 'password'"
      v-model.trim="valueModel"
    >
      <template v-if="prefixIcon" #prefix>
        <Icon :icon="prefixIcon" />
      </template>
      <template v-if="suffixIcon" #suffix>
        <Icon :icon="suffixIcon" />
      </template>
    </el-input>
  </ElFormItemWrapper>
</template>
<script lang="ts" setup>
import ElFormItemWrapper from '../../../../common/ElFormItemWrapper.vue'
import { useWidget, type WidgetRenderProps } from '../../hooks'
import { useFormItemWidget } from '../../hooks/useFormItemWidget'

const props = defineProps<WidgetRenderProps>()

const { formItemAttrs, valueModel, useFormInputAttrs, usePropValue } = useFormItemWidget(
  useWidget(props)
)

const formInputAttrs = computed(() => {
  const attrs = useFormInputAttrs({ omit: ['prefixIcon', 'suffixIcon'] })
  return {
    ...attrs,
    rows: attrs.autosize ? undefined : attrs.rows,
    autosize: attrs.autosize ? { minRows: attrs.minRows, maxRows: attrs.maxRows } : undefined
  }
})

const prefixIcon = computed(() => usePropValue('prefixIcon'))

const suffixIcon = computed(() => usePropValue('suffixIcon'))
</script>
