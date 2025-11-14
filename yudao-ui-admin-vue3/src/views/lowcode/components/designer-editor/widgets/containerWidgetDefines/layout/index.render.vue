<template>
  <div>
    <el-row v-bind="rowAttrs" v-for="(_, r) in rowCnt" :key="r">
      <el-col v-bind="colAttrs(r, c)" v-for="(__, c) in colCnt" :key="c">
        <WidgetItem
          :editor="editor"
          :parentWidget="widget"
          :parentContext="widgetContext"
          :widget="slotWidget(r, c)!"
          :widget-index="slotWidgetIndex(r, c)"
          :options="widgetItemOptions"
        />
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { useElColPropAttrs, useWidget, type WidgetRenderProps } from '../../hooks'
import WidgetItem from '../../../components/WidgetItem.vue'
import { customWidgetOptions } from '../../../designer-editor.utils'

const widgetItemOptions = customWidgetOptions({ putable: true, selectable: true })

const props = defineProps<WidgetRenderProps>()

const { useSlot, usePropValue, usePropAndEvent } = useWidget(props)

const rowCnt = computed(() => usePropValue('rowCnt'))

const colCnt = computed(() => usePropValue('colCnt'))

const rowAttrs = computed(() => usePropAndEvent({ only: ['justify', 'align', 'gutter'] }))

const slotWidgetIndex = (r: number, c: number): number => r * (colCnt.value ?? 0) + c

const slotWidget = (r: number, c: number) => useSlot(slotWidgetIndex(r, c))

const colAttrs = (r: number, c: number) => useElColPropAttrs(slotWidget(r, c))
</script>
