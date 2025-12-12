<template>
  <el-row v-bind="rowAttrs">
    <el-col v-bind="colAttrs">
      <DesignerPreview v-bind="editorAttrs" />
    </el-col>
  </el-row>
</template>

<script setup lang="ts">
import { useElColPropAttrs, useWidget, type WidgetRenderProps } from '../../hooks'
import DesignerPreview from '../../../index.preview.vue'

const props = defineProps<WidgetRenderProps>()

const { usePropAndEvent, exposeContext, refresh } = useWidget(props)

const rowAttrs = computed(() => usePropAndEvent({ only: ['justify'] }))
const colAttrs = computed(() => useElColPropAttrs(props.widget))
const editorAttrs = computed(() => usePropAndEvent({ only: ['fileId', 'version', 'params'] }))

exposeContext({
  refresh: () => refresh()
})
</script>
