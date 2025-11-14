<template>
  <el-card v-bind="cardAttrs">
    <el-row v-bind="rowAttrs">
      <el-col v-bind="colAttrs">
        <WidgetItem
          :editor="editor"
          :parentWidget="widget"
          :parentContext="widgetContext"
          :widget="defaultSlotWidget"
          :options="widgetItemOptions"
        />
      </el-col>
    </el-row>
  </el-card>
</template>

<script setup lang="ts">
import { useElColPropAttrs, useWidget, type WidgetRenderProps } from '../../hooks'
import WidgetItem from '../../../components/WidgetItem.vue'
import { customWidgetOptions } from '../../../designer-editor.utils'

const widgetItemOptions = customWidgetOptions({ putable: true, selectable: true })

const props = defineProps<WidgetRenderProps>()

const { usePropAndEvent, useDefaultSlot } = useWidget(props)

const cardAttrs = computed(() => usePropAndEvent({ omit: ['justify'] }))

const defaultSlotWidget = computed(() => useDefaultSlot())

const colAttrs = computed(() => useElColPropAttrs(defaultSlotWidget.value))

const rowAttrs = computed(() => usePropAndEvent({ only: ['justify'] }))
</script>
