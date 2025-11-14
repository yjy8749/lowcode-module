<!-- index.render.vue -->
<template>
  <ElFormItemWrapper v-bind="formItemAttrs">
    <el-input v-bind="formInputAttrs" v-model="valueModel">
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

const { useFormItemAttrs, useFormInputAttrs, usePropValue, valueModel } = useFormItemWidget(
  useWidget(props)
)

const formItemAttrs = computed(() => useFormItemAttrs())

const formInputAttrs = computed(() => useFormInputAttrs({ omit: ['prefixIcon', 'suffixIcon'] }))

const prefixIcon = computed(() => usePropValue('prefixIcon'))

const suffixIcon = computed(() => usePropValue('suffixIcon'))
</script>
