<!-- index.render.vue -->
<template>
  <ElFormItemWrapper v-bind="formItemAttrs">
    <el-transfer
      v-bind="formInputAttrs"
      :titles="titles"
      :button-texts="buttonTexts"
      :props="{ key: 'value' }"
      :data="transferData"
      v-loading="loading"
      v-model="valueModel"
    />
  </ElFormItemWrapper>
</template>
<script lang="ts" setup>
import ElFormItemWrapper from '../../../../common/ElFormItemWrapper.vue'
import { useWidget, type WidgetRenderProps } from '../../hooks'
import { useFormItemWidget } from '../../hooks/useFormItemWidget'
import { useScopeLoading } from '../../../../common/hooks'

const props = defineProps<WidgetRenderProps>()

const { loading, callWithLoading } = useScopeLoading()

const { formItemAttrs, valueModel, useFormInputAttrs, usePropValue, toEvalFunction } =
  useFormItemWidget(useWidget(props))

const formInputAttrs = computed(() =>
  useFormInputAttrs({
    omit: ['leftTitle', 'rightTitle', 'leftButtonText', 'rightButtonText', 'loadData']
  })
)

const titles = computed(() => {
  const leftTitle = usePropValue('leftTitle')
  const rightTitle = usePropValue('rightTitle')
  if (leftTitle || rightTitle) {
    return [leftTitle, rightTitle]
  }
  return undefined
})

const buttonTexts = computed(() => {
  const leftButtonText = usePropValue('leftButtonText')
  const rightButtonText = usePropValue('rightButtonText')
  if (leftButtonText || rightButtonText) {
    return [leftButtonText, rightButtonText]
  }
  return undefined
})

const loadData = computed(() => toEvalFunction(usePropValue('loadData')))

const transferData = ref<any[]>()
const transferDataLoad = async (query?: string) => {
  await callWithLoading(async () => {
    if (loadData.value) {
      transferData.value = await loadData.value(query)
    }
  })
}

onMounted(async () => {
  transferDataLoad()
})
</script>
