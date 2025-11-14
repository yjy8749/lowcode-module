<template>
  <WidgetRender
    v-if="!isNullOrUnDef(widgetDef) && !isNullOrUnDef(widget) && !isNullOrUnDef(widgetContext)"
    :editor="editor"
    :parent-widget="parentWidget"
    :parent-context="parentContext"
    :widget="widget"
    :widget-define="widgetDef"
    :widget-context="widgetContext"
    :widget-index="widgetIndex"
  />
</template>
<script lang="ts" setup>
import WidgetRender from './WidgetRender.vue'
import {
  WidgetDefine,
  WidgetInstance,
  WidgetRenderContext,
  WidgetRenderProps
} from '../designer-editor.type'
import { useWidgetDefine } from '../widgets'
import { createWidgetInstance, regenWidgetContext } from '../designer-editor.utils'
import { isNullOrUnDef } from '@/utils/is'

const props = defineProps<
  {
    _key: string
    _moduleName: string
    defaultProps?: Record<string, any>
  } & Omit<WidgetRenderProps, 'widget' | 'widgetDefine' | 'widgetContext'>
>()

const widget = ref<WidgetInstance>()

const widgetDef = ref<WidgetDefine>()

const widgetContext = ref<WidgetRenderContext>()

onBeforeMount(async () => {
  widgetDef.value = useWidgetDefine({ _moduleName: props._moduleName, _key: props._key })
  widget.value = await createWidgetInstance(props.editor, widgetDef.value, {
    parentWidget: props.parentWidget,
    parentContext: props.parentContext,
    defaultProps: props.defaultProps
  })
  widgetContext.value = regenWidgetContext(props.editor, props.parentWidget, props.parentContext)
})
</script>
