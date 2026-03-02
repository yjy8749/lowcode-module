<!-- index.render.vue -->
<template>
  <div>
    <WidgetItem
      :editor="editor"
      :parent-widget="widget"
      :parent-render-context="widgetRenderContext"
      :widget="defaultSlotWidget"
      :options="widgetItemOptions"
    />
  </div>
</template>

<script setup lang="ts">
import { useWidget, type WidgetRenderProps } from '../../hooks'
import WidgetItem from '../../../components/WidgetItem.vue'
import { useFormWidget } from '../../hooks/useFormWidget'

const props = defineProps<WidgetRenderProps>()

const { useDefaultSlot, generateOptions } = useFormWidget(useWidget(props))

const widgetItemOptions = generateOptions({ putable: true, selectable: true })

const defaultSlotWidget = computed(() => useDefaultSlot())
</script>
