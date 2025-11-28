<template>
  <WidgetItem
    v-if="widgetDef && widget"
    :editor="editor"
    :parent-widget="parentWidget"
    :parent-render-context="parentRenderContext"
    :widget="widget"
    :widget-define="widgetDef"
    :widget-index="widgetIndex"
    :options="options"
  />
</template>

<script setup lang="ts">
import { WidgetDefine, WidgetInstance, WidgetItemProps } from '../designer-editor.type'
import WidgetItem from './WidgetItem.vue'
import { createWidgetInstance } from '../designer-editor.utils'
import { useWidgetDefine } from '../widgets'

const props = defineProps<
  {
    _key: string
    _moduleName: string
    defaultProps?: Record<string, any>
  } & Omit<WidgetItemProps, 'widget'>
>()

const widget = ref<WidgetInstance>()

const widgetDef = ref<WidgetDefine>()

onBeforeMount(async () => {
  widgetDef.value = useWidgetDefine({ _moduleName: props._moduleName, _key: props._key })
  widget.value = await createWidgetInstance(props.editor, widgetDef.value, {
    parentWidget: props.parentWidget,
    parentRenderContext: props.parentRenderContext,
    options: props.options,
    defaultProps: props.defaultProps
  })
})
</script>
