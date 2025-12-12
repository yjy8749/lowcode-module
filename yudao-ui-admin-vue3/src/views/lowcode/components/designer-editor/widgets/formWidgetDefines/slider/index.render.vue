<!-- index.render.vue -->
<template>
  <ElFormItemWrapper v-bind="formItemAttrs">
    <el-slider
      v-bind="formInputAttrs"
      :format-tooltip="formatTooltip"
      :marks="marksOptions"
      v-model="valueModel"
    />
  </ElFormItemWrapper>
</template>
<script lang="ts" setup>
import { CSSProperties } from 'vue'
import ElFormItemWrapper from '../../../../common/ElFormItemWrapper.vue'
import { useWidget, type WidgetRenderProps } from '../../hooks'
import { useFormItemWidget } from '../../hooks/useFormItemWidget'

const props = defineProps<WidgetRenderProps>()

const { formItemAttrs, valueModel, useFormInputAttrs, usePropValue, toEvalFunction } =
  useFormItemWidget(useWidget(props))

const formInputAttrs = computed(() => useFormInputAttrs({ omit: ['formatTooltip', 'marks'] }))

const formatTooltip = computed(() => {
  const t = usePropValue('formatTooltip')
  if (t) {
    return eval(`(function(data) { return \`${t}\` })`)
  } else {
    return (data) => data
  }
})

const marks = computed(() => toEvalFunction(usePropValue('marks')))

const marksOptions = ref<Record<string, { style: CSSProperties; label: any }>>()

const marksLoad = async () => {
  marksOptions.value = (await marks.value?.()) ?? []
}

onMounted(() => {
  marksLoad()
})
</script>
