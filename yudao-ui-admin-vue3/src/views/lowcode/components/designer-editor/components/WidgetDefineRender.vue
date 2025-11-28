<template>
  <WidgetRender
    v-if="
      !isNullOrUnDef(widgetDef) && !isNullOrUnDef(widget) && !isNullOrUnDef(widgetRenderContext)
    "
    :editor="editor"
    :parent-widget="parentWidget"
    :parent-render-context="parentRenderContext"
    :widget="widget"
    :widget-define="widgetDef"
    :widget-render-context="widgetRenderContext"
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
import { createWidgetInstance, regenWidgetRenderContext } from '../designer-editor.utils'
import { isNullOrUnDef } from '@/utils/is'

const props = defineProps<
  {
    _key: string
    _moduleName: string
    defaultProps?: Record<string, any>
  } & Omit<WidgetRenderProps, 'widget' | 'widgetDefine' | 'widgetRenderContext'>
>()

const widget = ref<WidgetInstance>()

const widgetDef = ref<WidgetDefine>()

const widgetRenderContext = ref<WidgetRenderContext>()

onBeforeMount(async () => {
  widgetDef.value = useWidgetDefine({ _moduleName: props._moduleName, _key: props._key })
  widget.value = await createWidgetInstance(props.editor, widgetDef.value, {
    parentWidget: props.parentWidget,
    parentRenderContext: props.parentRenderContext,
    defaultProps: props.defaultProps
  })
  widgetRenderContext.value = regenWidgetRenderContext(
    props.editor,
    props.parentWidget,
    props.parentRenderContext
  )
})
</script>
