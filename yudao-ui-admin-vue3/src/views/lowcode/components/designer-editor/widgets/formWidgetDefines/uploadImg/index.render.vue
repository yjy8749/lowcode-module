<!-- index.render.vue -->
<template>
  <ElFormItemWrapper v-bind="formItemAttrs">
    <UploadImgs
      v-if="multiple"
      v-bind="formInputAttrs"
      v-model="valueModel"
      @update:model-value="onUpdateModelValue"
    />
    <UploadImg
      v-else
      v-bind="formInputAttrs"
      :show-delete="!formItemAttrs.readonly"
      v-model="valueModel"
      @update:model-value="onUpdateModelValue"
    />
  </ElFormItemWrapper>
</template>
<script lang="ts" setup>
import ElFormItemWrapper from '../../../../common/ElFormItemWrapper.vue'
import { useWidget, type WidgetRenderProps } from '../../hooks'
import { useFormItemWidget } from '../../hooks/useFormItemWidget'

const props = defineProps<WidgetRenderProps>()

const { formItemAttrs, valueModel, useFormInputAttrs, useEventBind, usePropValue, toEvalFunction } =
  useFormItemWidget(useWidget(props))

const formInputAttrs = computed(() => useFormInputAttrs({ omit: ['multiple', 'change'] }))

const multiple = computed(() => usePropValue('multiple'))

const onChangeHandler = computed(() => toEvalFunction(useEventBind('change')))

const onUpdateModelValue = (val) => {
  onChangeHandler.value?.(val)
}
</script>
