<template>
  <div>
    <WidgetItem
      v-for="(item, index) in bindData"
      :key="item.__key__"
      :editor="editor"
      :parentWidget="widget"
      :parentContext="wrapItemContext(item, index)"
      :widget="defaultSlotWidget"
      :widget-index="index"
      :options="customWidgetOptions({ putable: index == 0, selectable: index == 0 })"
    />
  </div>
</template>

<script setup lang="ts">
import { isEmpty } from '@/utils/is'
import { generateVForKey } from '../../../../common/utils'
import { useWidget, type WidgetRenderProps } from '../../hooks'
import { WidgetRenderContext } from '../../../designer-editor.type'
import WidgetItem from '../../../components/WidgetItem.vue'
import { getForItemDataId } from './utils'
import { customWidgetOptions, regenSeekDataFunctionRuntime } from '../../../designer-editor.utils'

const props = defineProps<WidgetRenderProps>()

const { isPreviewMode, editor, usePropValue, useDefaultSlot } = useWidget(props)

const defaultSlotWidget = computed(() => useDefaultSlot())

const bindData = computed(() => {
  const vals = usePropValue('data')
  return generateVForKey(!isPreviewMode.value && isEmpty(vals) ? [{}] : vals)
})

const wrapItemContext = (data: any, index: number): WidgetRenderContext => {
  return {
    ...props.widgetContext,
    seekData: (propBind, defaultVal) => {
      return regenSeekDataFunctionRuntime(
        editor,
        props.widgetContext,
        {
          [getForItemDataId(props.widget)]: {
            __key__: data.id ?? data.__key__,
            index: index,
            length: bindData.value.length,
            isFirst: index == 0,
            isLast: index == bindData.value.length - 1,
            data: data
          }
        },
        propBind,
        defaultVal
      )
    }
  }
}
</script>
