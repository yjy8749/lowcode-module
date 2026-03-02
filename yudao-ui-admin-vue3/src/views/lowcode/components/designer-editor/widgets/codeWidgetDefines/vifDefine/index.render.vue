<template>
  <WidgetItem
    v-if="isShow"
    :editor="editor"
    :parent-widget="widget"
    :parent-render-context="widgetRenderContext"
    :widget="defaultSlotWidget"
    :options="widgetItemOptions"
  />
</template>

<script setup lang="ts">
import { useWidget, type WidgetRenderProps } from '../../hooks'
import WidgetItem from '../../../components/WidgetItem.vue'

const props = defineProps<WidgetRenderProps>()

const { usePropValue, isPreviewMode, useDefaultSlot, generateOptions } = useWidget(props)

const widgetItemOptions = generateOptions({ putable: true, selectable: true })

const defaultSlotWidget = computed(() => useDefaultSlot())

const isShow = computed(() => (isPreviewMode.value ? usePropValue('vifValue') : true))
</script>
