<!-- index.render.vue -->
<template>
  <ElFormItemWrapper v-bind="formItemAttrs">
    <el-color-picker v-bind="formInputAttrs" :predefine="predefineOptions" v-model="valueModel" />
  </ElFormItemWrapper>
</template>
<script lang="ts" setup>
import ElFormItemWrapper from '../../../../common/ElFormItemWrapper.vue'
import { useWidget, type WidgetRenderProps } from '../../hooks'
import { useFormItemWidget } from '../../hooks/useFormItemWidget'

const props = defineProps<WidgetRenderProps>()

const { formItemAttrs, valueModel, useFormInputAttrs, usePropValue, toEvalFunction } =
  useFormItemWidget(useWidget(props))

const formInputAttrs = computed(() => useFormInputAttrs({ omit: ['predefine'] }))

const predefineOptions = ref<string[]>([])

const predefine = computed(() => toEvalFunction(usePropValue('predefine')))

const predefineLoad = async () => {
  predefineOptions.value = (await predefine.value?.()) ?? []
}

onMounted(() => {
  predefineLoad()
})
</script>
