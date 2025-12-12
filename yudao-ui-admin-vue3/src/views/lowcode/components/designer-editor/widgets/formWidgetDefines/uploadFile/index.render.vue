<!-- index.render.vue -->
<template>
  <ElFormItemWrapper v-bind="formItemAttrs">
    <UploadFile
      v-bind="formInputAttrs"
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

const { formItemAttrs, valueModel, useFormInputAttrs, useEventBind, toEvalFunction } =
  useFormItemWidget(useWidget(props))

const formInputAttrs = computed(() => useFormInputAttrs({ omit: ['change'] }))

const onChangeHandler = computed(() => toEvalFunction(useEventBind('change')))

const onUpdateModelValue = (val) => {
  onChangeHandler.value?.(val)
}
</script>
