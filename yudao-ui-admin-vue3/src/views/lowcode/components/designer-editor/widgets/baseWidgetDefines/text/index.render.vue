<!-- index.render.vue -->
<template>
  <el-text v-bind="textAttrs">
    {{ text }}
  </el-text>
</template>
<script lang="ts" setup>
import { useWidget, type WidgetRenderProps } from '../../hooks'

const props = defineProps<WidgetRenderProps>()

const { usePropValue, usePropObject, usePropAndEvent } = useWidget(props)

const text = computed(() => usePropValue('text'))

const textAttrs = computed(() => {
  return {
    ...usePropAndEvent({ omit: ['text', 'color', 'fontSize', 'fontWeight'] }),
    style: usePropObject('color', 'fontSize', 'fontWeight')
  }
})
</script>
