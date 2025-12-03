<!-- index.render.vue -->
<template>
  <ElFormItemWrapper v-bind="formItemAttrs">
    <el-input-tag v-bind="formInputAttrs" :collapse-tags-tooltip="true" v-model="valueModel">
      <template v-if="prefixIcon" #prefix>
        <Icon :icon="prefixIcon" />
      </template>
      <template v-if="suffixIcon" #suffix>
        <Icon :icon="suffixIcon" />
      </template>
    </el-input-tag>
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

const formInputAttrs = computed(() => useFormInputAttrs({ omit: ['prefixIcon', 'suffixIcon'] }))

const prefixIcon = computed(() => usePropValue('prefixIcon'))

const suffixIcon = computed(() => usePropValue('suffixIcon'))
</script>
