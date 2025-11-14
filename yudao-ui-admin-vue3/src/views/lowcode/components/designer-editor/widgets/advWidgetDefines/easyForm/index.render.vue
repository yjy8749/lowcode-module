<!-- index.render.vue -->
<template>
  <div>
    <WidgetItem
      :editor="editor"
      :parentWidget="widget"
      :parentContext="widgetContext"
      :widget="defaultSlotWidget"
      :options="widgetItemOptions"
    />
  </div>
</template>

<script setup lang="ts">
import { useWidget, type WidgetRenderProps } from '../../hooks'
import WidgetItem from '../../../components/WidgetItem.vue'
import { useFormWidget } from '../../hooks/useFormWidget'
import { customWidgetOptions } from '../../../designer-editor.utils'

const widgetItemOptions = customWidgetOptions({ putable: true, selectable: true })

const props = defineProps<WidgetRenderProps>()

const { useDefaultSlot } = useFormWidget(useWidget(props))

const defaultSlotWidget = computed(() => useDefaultSlot())
</script>
