<!-- index.render.vue -->
<template>
  <ElFormItemWrapper v-bind="formItemAttrs">
    <el-time-select v-bind="formInputAttrs" v-model="valueModel" />
  </ElFormItemWrapper>
</template>
<script lang="ts" setup>
import ElFormItemWrapper from '../../../../common/ElFormItemWrapper.vue'
import { useWidget, type WidgetRenderProps } from '../../hooks'
import { useFormItemWidget } from '../../hooks/useFormItemWidget'

const props = defineProps<WidgetRenderProps>()

const { formItemAttrs, valueModel, useFormInputAttrs } = useFormItemWidget(useWidget(props))

const formInputAttrs = computed(() => useFormInputAttrs())
</script>
