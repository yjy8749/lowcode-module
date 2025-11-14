<template>
  <WidgetItem
    v-if="isShow"
    :editor="editor"
    :parentWidget="widget"
    :parentContext="widgetContext"
    :widget="defaultSlotWidget"
    :options="widgetItemOptions"
  />
</template>

<script setup lang="ts">
import { useWidget, type WidgetRenderProps } from '../../hooks'
import WidgetItem from '../../../components/WidgetItem.vue'
import { customWidgetOptions } from '../../../designer-editor.utils'

const widgetItemOptions = customWidgetOptions({ putable: true, selectable: true })

const props = defineProps<WidgetRenderProps>()

const { usePropValue, isPreviewMode, useDefaultSlot } = useWidget(props)

const defaultSlotWidget = computed(() => useDefaultSlot())

const showConditionValue = computed(() => usePropValue('showConditionValue'))

const isShow = computed(() => showConditionValue.value ?? !isPreviewMode.value)
</script>
