<template>
  <div>
    <el-row v-bind="rowAttrs" v-for="(_, r) in rowCnt" :key="r">
      <el-col v-bind="colAttrs(r, c)" v-for="(__, c) in colCnt" :key="c">
        <WidgetItem
          :editor="editor"
          :parent-widget="widget"
          :parent-render-context="widgetRenderContext"
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

const props = defineProps<WidgetRenderProps>()

const { useSlot, usePropValue, usePropAndEvent, generateOptions } = useWidget(props)

const widgetItemOptions = generateOptions({ putable: true, selectable: true })

const rowCnt = computed(() => usePropValue('rowCnt') as number)

const colCnt = computed(() => usePropValue('colCnt') as number)

const rowAttrs = computed(() => usePropAndEvent({ only: ['justify', 'align', 'gutter'] }))

const slotWidgetIndex = (r: number, c: number): number => r * (colCnt.value ?? 0) + c

const slotWidget = (r: number, c: number) => useSlot(slotWidgetIndex(r, c))

const colAttrs = (r: number, c: number) => useElColPropAttrs(slotWidget(r, c))
</script>
