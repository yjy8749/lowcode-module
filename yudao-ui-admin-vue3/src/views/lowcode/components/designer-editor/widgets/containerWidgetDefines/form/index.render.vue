<template>
  <el-row :justify="rowJustify">
    <el-col v-bind="colAttrs">
      <el-form
        :class="{ 'form-compact': isCompact }"
        ref="formRef"
        v-bind="formAttrs"
        :model="formModel"
        :rules="formRules"
      >
        <WidgetItem
          :editor="editor"
          :parent-widget="widget"
          :parent-render-context="widgetRenderContext"
          :widget="defaultSlotWidget"
          :options="widgetItemOptions"
        />
      </el-form>
    </el-col>
  </el-row>
</template>

<script setup lang="ts">
import { useElColPropAttrs, useWidget, type WidgetRenderProps } from '../../hooks'
import WidgetItem from '../../../components/WidgetItem.vue'
import { useFormWidget } from '../../hooks/useFormWidget'
import { customWidgetOptions } from '../../../designer-editor.utils'

const widgetItemOptions = customWidgetOptions({ putable: true, selectable: true })

const props = defineProps<WidgetRenderProps>()

const formRef = ref()

const {
  formModel,
  formRules,
  usePropValue,
  usePropAndEvent,
  exposeContext,
  useDefaultSlot,
  updateFormModel
} = useFormWidget(useWidget(props))

const defaultSlotWidget = computed(() => useDefaultSlot())

const colAttrs = computed(() => useElColPropAttrs(defaultSlotWidget.value))

const rowJustify = computed(() => usePropValue('justify'))

const isCompact = computed(() => usePropValue('compact'))

const formAttrs = computed(() => {
  return usePropAndEvent({ omit: ['data', 'justify', 'compact', 'hideLabel'] })
})

exposeContext({
  formRef: () => formRef.value,
  formModel: () => formModel,
  isHideLabel: () => usePropValue('hideLabel'),
  isReadonly: () => usePropValue('readonly'),
  isDisabled: () => usePropValue('disabled'),
  getData: async () => {
    await formRef.value.validate()
    return formModel.value
  }
})

const bindData = computed(() => usePropValue('data'))

watch(
  () => bindData.value,
  () => {
    updateFormModel(bindData.value)
    formRef.value?.resetFields()
  },
  { immediate: true }
)
</script>
<style scoped lang="scss">
.form-compact {
  :deep(.el-form-item:not(.is-error)) {
    margin-bottom: 8px;
  }
}
</style>
